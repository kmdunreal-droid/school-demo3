// ============================================================
// PROVISION — Supabase Auth users + profiles banata hai (ID+Password system)
// Direct Postgres (PG_CONNECTION_STRING) se chalta hai — SERVICE KI NAHI ZAROORAT.
//
// Run:
//   node scripts/provision-users.cjs               → provision + provisioned passwords strip
//   node scripts/provision-users.cjs --no-strip    → passwords cloud me rehne dein
//   node scripts/provision-users.cjs --only=ali,teacher1
//
// Principal/Developer (env se override):
//   SUPABASE_ADMIN_EMAIL / SUPABASE_ADMIN_PASSWORD (default: ali / Ali@2026!)
//   DEV_LOGIN_ID / DEV_PASSWORD                    (default: km / Km@6016!)
//
// Needs: `pg` + `dotenv` (devDependencies — `npm install` chala lein)
// ============================================================
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');

const DOMAIN = '@app.school';
const STRIP = !process.argv.includes('--no-strip');
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const KEEP_PW = process.argv.includes('--keep-passwords');

// NOTE: client (src/lib/authId.ts) se SAME rule — dono jagah same key bane
const sanitize = (v) => String(v || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
const splitKey = (v, fallback) => sanitize(String(v || fallback || '').split('@')[0]);

// NOTE: GoTrue NULL tokens ko handle nahi karta — login par 500 "Database error querying schema".
// Insert ke waqt ye '' set karna zaroori hai (auth.users ke token columns).
const TOKEN_COLS = [
  'confirmation_token', 'recovery_token', 'email_change', 'email_change_token_new',
  'email_change_token_current', 'phone_change', 'phone_change_token', 'reauthentication_token',
];

async function tableCols(c, schema, table) {
  // NOTE: generated columns (jaise auth.identities.email) skip — unme explicit insert allowed nahi
  const r = await c.query(
    "select column_name from information_schema.columns where table_schema='" + schema + "' and table_name='" + table + "'" +
    " and (is_generated is null or is_generated = 'NEVER')"
  );
  return new Set(r.rows.map(x => x.column_name));
}

// NOT NULL repair ke saath insert (schema drift tolerate karta hai)
async function insertWithRepair(c, table, base, cols, schema, tbl) {
  const vals = { ...base };
  for (let attempt = 0; attempt < 8; attempt++) {
    const keys = Object.keys(vals).filter(k => cols.has(k) && vals[k] !== undefined);
    try {
      await c.query(
        'insert into ' + table + ' (' + keys.map(k => '"' + k + '"').join(', ') + ') values (' + keys.map((k, i) => '$' + (i + 1)).join(', ') + ')',
        keys.map(k => vals[k])
      );
      return;
    } catch (e) {
      const m = /column "([^"]+)" violates not-null/.exec(e.message);
      if (!m) throw e;
      const t = await c.query("select data_type from information_schema.columns where table_schema='" + schema + "' and table_name='" + tbl + "' and column_name='" + m[1] + "'");
      const dt = t.rows[0]?.data_type || 'text';
      if (dt === 'text' || dt === 'character varying') vals[m[1]] = '';
      else if (dt === 'boolean') vals[m[1]] = false;
      else if (String(dt).includes('timestamp')) vals[m[1]] = new Date();
      else if (dt === 'jsonb' || dt === 'json') vals[m[1]] = '{}';
      else if (dt === 'uuid' && m[1] === 'instance_id') vals[m[1]] = '00000000-0000-0000-0000-000000000000';
      else throw new Error('NOT NULL column handle nahi hua: ' + m[1] + ' (' + dt + ') — ' + e.message);
    }
  }
}

async function main() {
  if (!process.env.PG_CONNECTION_STRING) { console.error('PG_CONNECTION_STRING missing (.env)'); process.exit(1); }
  const c = new Client({ connectionString: process.env.PG_CONNECTION_STRING });
  await c.connect();

  // 1) profiles table + RLS
  await c.query(fs.readFileSync(path.join(__dirname, 'profiles-schema.sql'), 'utf8'));
  console.log('[1/5] profiles table ready.');

  const userCols = await tableCols(c, 'auth', 'users');
  const identCols = await tableCols(c, 'auth', 'identities');

  // 2) Candidates — principal/dev + DB ke teachers/students/coordinators
  const users = [
    { key: splitKey(process.env.SUPABASE_ADMIN_EMAIL, 'ali'), pw: process.env.SUPABASE_ADMIN_PASSWORD || 'Ali@2026!', role: 'principal', name: 'Ali (Principal)', ref: null, tbl: null },
    { key: splitKey(process.env.DEV_LOGIN_ID, 'km'), pw: process.env.DEV_PASSWORD || 'Km@6016!', role: 'developer', name: 'System Developer', ref: null, tbl: null },
  ];
  for (const [tbl, role] of [['teachers', 'teacher'], ['students', 'student'], ['coordinators', 'coordinator']]) {
    try {
      const r = await c.query('select id, data from public.' + tbl);
      for (const row of r.rows) {
        const d = row.data || {};
        const key = sanitize(d.username) || sanitize(row.id);
        if (!key) continue;
        users.push({ key, pw: d.password, role, name: d.name || key, ref: String(row.id), tbl });
      }
    } catch (e) { console.warn('[' + tbl + '] skip:', e.message); }
  }
  console.log('[2/5] ' + users.length + ' candidates.');
  // 3) Har candidate → auth.users + auth.identities + profiles
  let created = 0, exists = 0, skipped = 0, stripped = 0, failed = 0;
  const summary = [];
  for (const u of users) {
    if (ONLY.length && !ONLY.includes(u.key)) continue;
    if (!u.pw || String(u.pw).length < 6) { skipped++; summary.push('SKIP  ' + u.key + ' (password < 6 chars ya missing)'); continue; }
    let key = u.key, email = key + DOMAIN;
    const pw = String(u.pw);

    const findUid = async () => (await c.query('select id from auth.users where lower(email) = lower($1)', [email])).rows[0]?.id || null;
    let uid = await findUid();

    // Collision: email pehle se kisi AUR record ka hai → record-id se naya key
    if (uid && u.ref) {
      const p = await c.query('select ref_id from public.profiles where id = $1', [uid]);
      const ref = p.rows[0]?.ref_id ?? null;
      if (String(ref || '') !== String(u.ref)) { key = sanitize(u.ref); email = key + DOMAIN; uid = await findUid(); }
    }

    try {
      if (uid) {
        // Password record se sync (auth login wahi password accept kare) — --keep-passwords se skip
        if (KEEP_PW) {
          console.log('   PW   ' + email + ' → password as-is chhoda (--keep-passwords)');
        } else {
          await c.query(
            "update auth.users set encrypted_password = crypt($1, gen_salt('bf')), email_confirmed_at = coalesce(email_confirmed_at, now()), banned_until = null, updated_at = now() where id = $2",
            [pw, uid]
          );
          console.log('   PW   ' + email + ' → password record se sync');
        }
        // Identity row missing ho to bana do — password login ke liye zaroori hai
        const idRow = await c.query('select provider from auth.identities where user_id = $1 limit 1', [uid]);
        if (!idRow.rows.length) {
          const now = new Date();
          await insertWithRepair(c, 'auth.identities', {
            id: crypto.randomUUID(), provider_id: uid, user_id: uid,
            identity_data: JSON.stringify({ sub: uid, email, email_verified: true, phone_verified: false }),
            provider: 'email', last_sign_in_at: now, created_at: now, updated_at: now, email,
          }, identCols, 'auth', 'identities');
          console.log('   IDN  ' + email + ' → missing identity row add ho gayi');
        }
        // Pehle se mojood → profiles row ensure (role/ref/name refresh)
        await c.query(
          'insert into public.profiles (id, login_key, role, ref_id, display_name) values ($1,$2,$3,$4,$5)' +
          ' on conflict (id) do update set login_key = excluded.login_key, role = excluded.role,' +
          ' ref_id = excluded.ref_id, display_name = excluded.display_name, updated_at = now()',
          [uid, key, u.role, u.ref, u.name]
        );
        exists++; summary.push('EXISTS ' + email + ' [' + u.role + ']');
        console.log('   OK   ' + email + ' → profile sync (role ' + u.role + ')');
      } else {
        // Naya auth user: bcrypt hash DB se, identity row, phir profile
        const hash = (await c.query("select crypt($1, gen_salt('bf')) as h", [pw])).rows[0].h;
        const id = crypto.randomUUID();
        const now = new Date();
        await insertWithRepair(c, 'auth.users', {
          instance_id: '00000000-0000-0000-0000-000000000000',
          id, aud: 'authenticated', role: 'authenticated',
          email, encrypted_password: hash, email_confirmed_at: now,
          raw_app_meta_data: JSON.stringify({ provider: 'email', providers: ['email'] }),
          raw_user_meta_data: JSON.stringify({ full_name: u.name || '' }),
          confirmation_token: '', recovery_token: '', email_change: '',
          email_change_token_new: '', email_change_token_current: '',
          phone_change: '', phone_change_token: '', reauthentication_token: '',
          created_at: now, updated_at: now,
        }, userCols, 'auth', 'users');

        await insertWithRepair(c, 'auth.identities', {
          id: crypto.randomUUID(), provider_id: id, user_id: id,
          identity_data: JSON.stringify({ sub: id, email, email_verified: true, phone_verified: false }),
          provider: 'email', last_sign_in_at: now, created_at: now, updated_at: now, email,
        }, identCols, 'auth', 'identities');

        await c.query(
          'insert into public.profiles (id, login_key, role, ref_id, display_name) values ($1,$2,$3,$4,$5)' +
          ' on conflict (id) do update set login_key = excluded.login_key, role = excluded.role,' +
          ' ref_id = excluded.ref_id, display_name = excluded.display_name, updated_at = now()',
          [id, key, u.role, u.ref, u.name]
        );
        created++; summary.push('CREATE ' + email + '  uid=' + id.slice(0, 8) + '...');
        console.log('   NEW  ' + email + ' → auth user + identity + profile (role ' + u.role + ')');
      }

      // 4) Password cloud data se strip (auth login active hone par)
      if (STRIP && u.tbl && u.ref) {
        await c.query('update public.' + u.tbl + " set data = data - 'password' where id = $1", [u.ref]);
        stripped++;
      }
    } catch (e) {
      failed++; summary.push('FAIL   ' + email + ' → ' + e.message);
      console.log('   FAIL ' + email + ' → ' + e.message);
    }
  }

  // 4b) Purane users ke NULL token columns → '' (warna GoTrue login 500 deta hai)
  const tcols = TOKEN_COLS.filter(t => userCols.has(t));
  if (tcols.length) {
    const setSql = tcols.map(t => '"' + t + '" = coalesce("' + t + '", \'\')').join(', ');
    const nullCond = tcols.map(t => '"' + t + '" is null').join(' or ');
    const fixed = await c.query('update auth.users set ' + setSql + ' where ' + nullCond);
    console.log('[4/5] token columns normalize: ' + fixed.rowCount + ' users (' + tcols.length + ' cols)');
  }

  // 5) Report
  console.log('[3/5] created=' + created + ' exists=' + exists + ' skipped=' + skipped + ' failed=' + failed);
  console.log('[4/5] password strip: ' + (STRIP ? stripped + ' records clean' : 'OFF (--no-strip)'));
  summary.forEach(s => console.log('   ' + s));
  console.log('[5/5] DONE. Ab test karein:  node scripts/test-auth-login.cjs');
  console.log('   Principal  : ' + splitKey(process.env.SUPABASE_ADMIN_EMAIL, 'ali') + ' / ' + (process.env.SUPABASE_ADMIN_PASSWORD || 'Ali@2026!'));
  console.log('   Developer  : ' + splitKey(process.env.DEV_LOGIN_ID, 'km') + ' / ' + (process.env.DEV_PASSWORD || 'Km@6016!'));
  console.log('   Supabase Dashboard → Authentication → Providers → Email: ON, Confirm email: OFF, Allow new sign-ups: OFF');
  await c.end();
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });


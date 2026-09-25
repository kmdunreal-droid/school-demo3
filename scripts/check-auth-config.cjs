// ============================================================
// CHECK — ID+Password auth setup ka poora verification (read-only).
// Run: node scripts/check-auth-config.cjs
//
// Kya check karta hai:
//   1) GoTrue public settings  → Email provider ON / Confirm email OFF / Sign-ups OFF
//   2) Edge Function presence  → create-auth-user deployed hai ya nahi
//   3) Direct Postgres         → users/profiles/identities counts, orphans, NULL token cols,
//                                aur kitne records ke login abhi tak nahi bane
// ============================================================
require('dotenv').config();
const { Client } = require('pg');

const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

const results = [];
const ok = (label, detail) => { results.push({ pass: true, label }); console.log('  PASS  ' + label + (detail ? ' — ' + detail : '')); };
const bad = (label, fix) => { results.push({ pass: false, label, fix }); console.log('  FAIL  ' + label + (fix ? '\n        → ' + fix : '')); };

// ---------- 1) GoTrue settings ----------
async function checkGoTrue() {
  console.log('\n[1/3] Supabase Auth settings (' + url + '/auth/v1/settings)');
  const res = await fetch(url + '/auth/v1/settings', { headers: { apikey: key } });
  if (!res.ok) { bad('settings endpoint (' + res.status + ')', 'URL/apikey check karein (.env)'); return; }
  const s = await res.json().catch(() => ({}));

  s?.external?.email === true
    ? ok('Email provider ON')
    : bad('Email provider OFF', 'Dashboard → Authentication → Providers → Email → Enable');

  // Confirm email OFF  ⇔  mailer_autoconfirm true
  s?.mailer_autoconfirm === true
    ? ok('Confirm email OFF (mailer_autoconfirm=true)')
    : bad('Confirm email still ON', 'Dashboard → Authentication → Providers → Email → "Confirm email" OFF karein');

  s?.disable_signup === true
    ? ok('Allow new sign-ups OFF')
    : bad('New sign-ups khule hain', 'Dashboard → Authentication → "Allow new sign-ups" OFF (users sirf principal banayein)');

  console.log('        (raw: email=' + s?.external?.email + ', autoconfirm=' + s?.mailer_autoconfirm +
    ', disable_signup=' + s?.disable_signup + ')');
}

// ---------- 2) Edge Function ----------
async function checkFunction() {
  console.log('\n[2/3] Edge Function create-auth-user');
  const res = await fetch(url + '/functions/v1/create-auth-user', {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 404 && String(body?.code || '') === 'NOT_FOUND') {
    bad('deployed nahi hai (404)', 'supabase functions deploy create-auth-user\n        → supabase secrets set SUPABASE_SECRET_KEY=sb_secret_...');
  } else if (res.status === 401 || res.status === 403) {
    ok('deployed hai (unauth request par ' + res.status + ')', 'principal dashboard se user create kar sakta hai');
  } else if (res.status === 500) {
    bad('deployed hai par error 500', 'Secret check karein: supabase secrets set SUPABASE_SECRET_KEY=sb_secret_...\n        → ' + JSON.stringify(body));
  } else {
    ok('reachable (' + res.status + ')', JSON.stringify(body).slice(0, 120));
  }
}

// ---------- 3) Direct Postgres ----------
async function checkDb() {
  console.log('\n[3/3] Database state (direct Postgres)');
  const c = new Client({ connectionString: process.env.PG_CONNECTION_STRING });
  await c.connect();
  const one = async (sql) => (await c.query(sql)).rows[0];
  try {
    const users = (await one('select count(*)::int n from auth.users')).n;
    const profs = (await one('select count(*)::int n from public.profiles')).n;
    const ids = (await one("select count(*)::int n from auth.identities where provider = 'email'")).n;
    const nullTok = (await one(`select count(*)::int n from auth.users where
        confirmation_token is null or email_change is null or recovery_token is null
        or email_change_token_new is null or email_change_token_current is null
        or phone_change is null or phone_change_token is null or reauthentication_token is null`)).n;
    const orphanProf = (await one('select count(*)::int n from public.profiles p left join auth.users u on u.id::text = p.id where u.id is null')).n;
    const noProf = (await one('select count(*)::int n from auth.users u left join public.profiles p on p.id = u.id::text where p.id is null')).n;
    const noIdentity = (await one("select count(*)::int n from auth.users u where not exists (select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email')")).n;
    const unconfirmed = (await one('select count(*)::int n from auth.users where email_confirmed_at is null')).n;
    const noLogin = {}, noLoginRows = [];
    for (const [tbl, role] of [['teachers', 'teacher'], ['students', 'student'], ['coordinators', 'coordinator']]) {
      noLogin[role] = (await one(
        'select count(*)::int n from public.' + tbl + ' r where not exists (select 1 from public.profiles p where p.ref_id = r.id::text)'
      )).n;
      if (noLogin[role]) {
        const rows = (await c.query(
          'select r.id::text as id, coalesce(r.data->>\'username\', r.data->>\'name\', r.id::text) as name,' +
          " coalesce(r.data->>'password','') as pw from public." + tbl + ' r' +
          ' where not exists (select 1 from public.profiles p where p.ref_id = r.id::text) order by 1 limit 20'
        )).rows;
        rows.forEach((r) => noLoginRows.push(role + ': ' + r.name + ' (id ' + r.id + ', password ' +
          (String(r.pw).length ? String(r.pw).length + ' chars' : 'MISSING') + ')'));
      }
    }

    console.log('        auth.users=' + users + '  profiles=' + profs + '  email identities=' + ids);
    console.log('        records bina login: teachers=' + noLogin.teacher +
      ' students=' + noLogin.student + ' coordinators=' + noLogin.coordinator);

    users > 0 ? ok('auth users mojood hain', users + ' users') : bad('koi auth user nahi', 'node scripts/provision-users.cjs');
    users === profs ? ok('users = profiles', users + ' = ' + profs)
      : bad('count mismatch', 'node scripts/provision-users.cjs (profiles sync karega)');
    ids >= users ? ok('email identities OK', ids + ' rows')
      : bad('identities kam hain', 'node scripts/provision-users.cjs (password login ke liye identity zaroori)');
    nullTok === 0 ? ok('token columns normal (GoTrue 500 fix)')
      : bad(nullTok + ' users me NULL token columns', 'node scripts/provision-users.cjs (normalize pass)');
    orphanProf === 0 ? ok('orphan profile nahi') : bad(orphanProf + ' orphan profile rows', 'node scripts/provision-users.cjs');
    noProf === 0 ? ok('har auth user ki profile hai') : bad(noProf + ' users ki profile nahi', 'node scripts/provision-users.cjs');
    noIdentity === 0 ? ok('har user ka email identity hai') : bad(noIdentity + ' users bina identity', 'node scripts/provision-users.cjs');
    unconfirmed === 0 ? ok('sab emails confirmed') : bad(unconfirmed + ' users unconfirmed', 'node scripts/provision-users.cjs');

    const totalNoLogin = noLogin.teacher + noLogin.student + noLogin.coordinator;
    if (totalNoLogin === 0) ok('har record ka login bana hua hai');
    else {
      console.log('  INFO  ' + totalNoLogin + ' record(s) ka login abhi nahi bana:');
      noLoginRows.forEach((r) => console.log('          - ' + r));
      console.log('        → school data me theek karein (password >= 6 chars) ya chalein: node scripts/provision-users.cjs');
    }
  } finally { await c.end(); }
}

(async () => {
  if (!url || !key) { console.error('VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY missing (.env)'); process.exit(1); }
  console.log('=== ID+PASSWORD AUTH SETUP CHECK ===');
  try { await checkGoTrue(); } catch (e) { bad('GoTrue check', e.message); }
  try { await checkFunction(); } catch (e) { bad('Function check', e.message); }
  try { await checkDb(); } catch (e) { bad('DB check', e.message); }

  const fails = results.filter((r) => !r.pass);
  console.log('\n=== SUMMARY: ' + (results.length - fails.length) + '/' + results.length + ' PASS ===');
  if (fails.length) {
    console.log('Baqi kaam:');
    fails.forEach((f, i) => console.log('  ' + (i + 1) + '. ' + f.label + (f.fix ? '\n     -> ' + f.fix : '')));
    process.exit(1);
  }
  console.log('Sab ready hai — ID+Password login aur principal-managed user creation live hai.');
})();

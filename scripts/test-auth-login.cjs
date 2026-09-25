// ============================================================
// TEST — ID+Password auth login verify (Supabase password grant + profiles RLS).
// Run: node scripts/test-auth-login.cjs [loginId] [password]
//   - loginId default: SUPABASE_ADMIN_EMAIL (ya 'ali')
//   - password default: DB record se (teachers/students/coordinators) ya principal/dev default
// ============================================================
require('dotenv').config();
const { Client } = require('pg');

const DOMAIN = '@app.school';
const sanitize = (v) => String(v || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

async function lookupPassword(loginKey) {
  const c = new Client({ connectionString: process.env.PG_CONNECTION_STRING });
  await c.connect();
  try {
    const p = await c.query('select role, ref_id from public.profiles where login_key = $1', [loginKey]);
    const prof = p.rows[0];
    if (!prof) return null;
    if (!prof.ref_id) {
      return prof.role === 'principal'
        ? process.env.SUPABASE_ADMIN_PASSWORD || 'Ali@2026!'
        : process.env.DEV_PASSWORD || 'Km@6016!';
    }
    const tbl = prof.role === 'teacher' ? 'teachers' : prof.role === 'student' ? 'students' : prof.role === 'coordinator' ? 'coordinators' : null;
    if (!tbl) return null;
    const r = await c.query('select data->>' + "'password'" + ' as pw from public.' + tbl + ' where id = $1', [prof.ref_id]);
    return r.rows[0]?.pw || null;
  } finally { await c.end(); }
}

(async () => {
  if (!url || !key) { console.error('VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY missing (.env)'); process.exit(1); }
  const loginId = sanitize(process.argv[2] || process.env.SUPABASE_ADMIN_EMAIL || 'ali');
  const password = process.argv[3] || (await lookupPassword(loginId));
  if (!password) { console.error('Password nahi mila for ' + loginId + ' (arg ke saath try karein)'); process.exit(1); }

  const email = loginId + DOMAIN;
  const res = await fetch(url + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('LOGIN FAIL (' + res.status + '): ' + (body.error_description || body.msg || body.error || JSON.stringify(body)));
    if (String(body.error_description || body.msg || '').toLowerCase().includes('email')) {
      console.error('→ Supabase Dashboard → Authentication → Providers → Email ko ON karein.');
    }
    process.exit(1);
  }
  console.log('LOGIN OK  ' + email + '  (auth role ' + body.user?.role + ', uid ' + String(body.user?.id).slice(0, 8) + '...)');

  const pr = await fetch(url + '/rest/v1/profiles?select=login_key,role,ref_id,display_name&id=eq.' + body.user.id, {
    headers: { apikey: key, Authorization: 'Bearer ' + body.access_token },
  });
  console.log('profiles  (' + pr.status + '): ' + JSON.stringify(await pr.json().catch(() => null)));
})();

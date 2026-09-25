// STATUS — auth/profiles ka quick health check (direct Postgres).
// Run: node scripts/db-status.cjs
require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const c = new Client({ connectionString: process.env.PG_CONNECTION_STRING });
  await c.connect();
  const q = async (label, sql) => {
    try { console.log(label + ': ' + JSON.stringify((await c.query(sql)).rows)); }
    catch (e) { console.log(label + ': ERR ' + e.message); }
  };
  await q('auth.users', 'select count(*)::int as n from auth.users');
  await q('auth emails', 'select email, email_confirmed_at is not null as confirmed from auth.users order by email');
  await q('identities', 'select count(*)::int as n from auth.identities');
  await q('profiles', 'select count(*)::int as n from public.profiles');
  await q('profiles rows', 'select login_key, role, ref_id, display_name from public.profiles order by login_key limit 15');
  await q('app tables', "select table_name from information_schema.tables where table_schema='public' order by table_name");
  await q('teachers', 'select count(*)::int as n from public.teachers');
  await q('students', 'select count(*)::int as n from public.students');
  await q('coordinators', 'select count(*)::int as n from public.coordinators');
  await c.end();
})().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });

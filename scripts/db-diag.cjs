// DIAG — auth.users / auth.identities / profiles ka deep dump (root cause dhundhne ke liye).
// Run: node scripts/db-diag.cjs
require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const c = new Client({ connectionString: process.env.PG_CONNECTION_STRING });
  await c.connect();
  const q = async (label, sql, params) => {
    try { console.log('\n-- ' + label + ' --'); console.log(JSON.stringify((await c.query(sql, params)).rows, null, 1)); }
    catch (e) { console.log(label + ': ERR ' + e.message); }
  };
  await q('profiles columns', "select column_name, data_type, is_nullable, column_default from information_schema.columns where table_schema='public' and table_name='profiles' order by ordinal_position");
  await q('profiles all rows', 'select * from public.profiles');
  await q('auth.users (latest 8)', 'select left(id::text,8) as uid, email, email_confirmed_at is not null as confirmed, created_at from auth.users order by created_at desc limit 8');
  await q('auth.users oldest 3', 'select left(id::text,8) as uid, email, created_at from auth.users order by created_at asc limit 3');
  await q('identities count', 'select count(*)::int as n from auth.identities');
  await q('identities sample', 'select provider, left(user_id::text,8) as uid, identity_data from auth.identities limit 3');
  await q('users without identity', 'select count(*)::int as n from auth.users u where not exists (select 1 from auth.identities i where i.user_id = u.id)');
  await q('triggers on auth.users', "select tgname, pg_get_triggerdef(oid) as def from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal");
  await q('non-null cols auth.users (no default)', "select column_name, data_type from information_schema.columns where table_schema='auth' and table_name='users' and is_nullable='NO' and column_default is null order by ordinal_position");
  await q('teachers keys', "select id, data->>'name' as name, data->>'username' as username, (data ? 'password') as has_pw from public.teachers order by id");
  await c.end();
})().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });

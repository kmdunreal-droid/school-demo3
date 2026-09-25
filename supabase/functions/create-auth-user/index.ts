// ============================================================
// CREATE-AUTH-USER — principal/developer ke liye Supabase Auth provisioning.
//
// Deploy (dono raste chalte hain):
//   A) Dashboard (CLI/secret ki zarurat NAHI):
//      Dashboard → Edge Functions → Deploy a new function → Via Editor
//      → name: create-auth-user → is file ka code paste karein → Deploy function
//   B) CLI:  supabase functions deploy create-auth-user
//
// Keys: platform khud inject karta hai — SUPABASE_URL + SUPABASE_SECRET_KEYS (naye
//       sb_secret_) ya legacy SUPABASE_SERVICE_ROLE_KEY. Custom secret bhi chalega:
//       SUPABASE_SECRET_KEY. Manual secrets set karna zaroori nahi hai.
//
// Body:  { action, loginKey, password, role, refId, displayName }
// Auth:  caller ka Supabase session JWT zaroori; profiles.role se permission check.
// ID+Password: loginKey ka auth email `<loginKey>@app.school` banta hai (user ko
// email kabhi nahi dikhta). Service key SIRF yahan server-side rehti hai.
// ============================================================
import { createClient } from 'npm:@supabase/supabase-js@2';

const DOMAIN = '@app.school';
const ADMIN_ROLES = ['principal', 'developer'];

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const sanitize = (v: unknown) => String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

// Platform kuch keys JSON dict me deta hai (jaise {"default":"sb_secret_..."}).
// Pehli valid value nikalte hain; plain string ho to waisi hi return.
function firstKey(...candidates: (string | undefined)[]): string {
  for (const raw of candidates) {
    const t = String(raw ?? '').trim();
    if (!t) continue;
    if (t.startsWith('{')) {
      try {
        const vals = Object.values(JSON.parse(t) as Record<string, unknown>)
          .filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
        if (vals.length) return vals[0].trim();
      } catch { /* JSON nahi hai — neeche plain string ki tarah use karein */ }
    }
    return t;
  }
  return '';
}

// listUsers me email filter nahi hota — pages scan karte hain
async function findUserByEmail(admin: any, email: string): Promise<string | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) return null;
    const hit = data.users.find((u: any) => String(u.email || '').toLowerCase() === email);
    if (hit) return hit.id as string;
    if (data.users.length < 200) return null;
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST required' }, 405);

  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = firstKey(
    Deno.env.get('SUPABASE_PUBLISHABLE_KEYS'),  // naye sb_publishable_ (platform-injected dict)
    Deno.env.get('SUPABASE_ANON_KEY'),          // legacy anon JWT
    Deno.env.get('SUPABASE_PUBLISHABLE_KEY'),
  );
  const secretKey = firstKey(
    Deno.env.get('SUPABASE_SECRET_KEYS'),       // naye sb_secret_ (platform-injected dict)
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),  // legacy service_role JWT
    Deno.env.get('SUPABASE_SECRET_KEY'),        // custom/self-set secret
  );
  if (!secretKey) return json({ error: 'Server secret nahi mila (SUPABASE_SECRET_KEYS ya SUPABASE_SERVICE_ROLE_KEY)' }, 500);
  if (!anonKey) return json({ error: 'Publishable key nahi mili (SUPABASE_PUBLISHABLE_KEYS ya SUPABASE_ANON_KEY)' }, 500);

  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!jwt) return json({ error: 'Session token missing' }, 401);

  try {
    // 1) Caller verify (uska JWT) + uski profile (RLS: sirf apni row)
    const caller = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userErr } = await caller.auth.getUser();
    const user = userData?.user;
    if (userErr || !user) return json({ error: 'Invalid session' }, 401);

    const { data: prof, error: profErr } = await caller
      .from('profiles').select('role, ref_id, login_key').eq('id', user.id).maybeSingle();
    if (profErr || !prof) return json({ error: 'Caller ki profile nahi mili' }, 403);

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'create-or-update');
    const loginKey = sanitize(body.loginKey);
    const password = String(body.password || '');
    const role = String(body.role || '');
    const refId = body.refId ? String(body.refId) : null;
    const displayName = String(body.displayName || loginKey);

    if (!loginKey || !password || password.length < 6) {
      return json({ error: 'loginKey + password (min 6 chars) chahiye' }, 400);
    }

    const isAdmin = ADMIN_ROLES.includes(String(prof.role));
    const isSelf = (refId && prof.ref_id && String(prof.ref_id) === refId) || prof.login_key === loginKey;
    if (!isAdmin && !isSelf) return json({ error: 'Permission nahi hai (sirf apna password)' }, 403);
    if (action === 'create-or-update' && !isAdmin) return json({ error: 'Sirf principal/developer user bana sakte hain' }, 403);

    const admin = createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const email = loginKey + DOMAIN;
    return await upsert(admin, { action, loginKey, email, password, role, refId, displayName, fallbackRole: String(prof.role), isAdmin });
  } catch (e) {
    return json({ error: (e as Error)?.message || 'Unexpected error' }, 500);
  }
});


// 2) Actual provisioning — login_key/ref_id/email se existing mapping dhoondh kar update ya create
async function upsert(admin: any, p: {
  action: string; loginKey: string; email: string; password: string;
  role: string; refId: string | null; displayName: string; fallbackRole: string; isAdmin: boolean;
}) {
  const { action, loginKey, email, password, role, refId, displayName, fallbackRole, isAdmin } = p;

  // SECURITY: non-admin apna role nahi badal sakta (privilege escalation block)
  const effectiveRole = isAdmin ? (role || fallbackRole) : fallbackRole;

  const { data: byKey } = await admin
    .from('profiles').select('id, login_key, ref_id').eq('login_key', loginKey).maybeSingle();

  let byRef: any = null;
  if (!byKey && refId) {
    const r = await admin.from('profiles').select('id, login_key, ref_id').eq('ref_id', refId).maybeSingle();
    byRef = r.data;
  }

  let targetUid: string | null = byKey?.id ?? null;

  // Rename case: record ka login ID badal gaya → purana auth user hata do
  if (!targetUid && byRef?.id && byRef.login_key !== loginKey) {
    await admin.auth.admin.deleteUser(byRef.id as string);
    await admin.from('profiles').delete().eq('id', byRef.id);
  }

  // Profile row ke bina bhi auth user mojood ho sakta hai (manual/dashboard entry)
  if (!targetUid) targetUid = await findUserByEmail(admin, email);

  if (targetUid) {
    const upd = await admin.auth.admin.updateUserById(targetUid, {
      password, email_confirm: true, user_metadata: { full_name: displayName },
    });
    if (upd.error) return json({ error: upd.error.message }, 400);
    const { error } = await admin.from('profiles').upsert({
      id: targetUid, login_key: loginKey, role: effectiveRole, ref_id: refId, display_name: displayName,
    }, { onConflict: 'id' });
    if (error) return json({ error: 'profiles update fail: ' + error.message }, 400);
    return json({ ok: true, mode: 'updated', uid: targetUid, role: effectiveRole });
  }

  const created = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name: displayName },
    app_metadata: { provider: 'email', providers: ['email'] },
  });
  if (created.error || !created.data?.user) {
    return json({ error: created.error?.message || 'User create fail' }, 400);
  }
  const uid = created.data.user.id as string;
  const { error } = await admin.from('profiles').insert({
    id: uid, login_key: loginKey, role: effectiveRole, ref_id: refId, display_name: displayName,
  });
  if (error) return json({ error: 'profiles insert fail: ' + error.message, uid }, 400);
  return json({ ok: true, mode: 'created', uid, role: effectiveRole });
}

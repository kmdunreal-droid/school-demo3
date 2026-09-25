/**
 * AUTH ADMIN — Supabase Auth account provisioning (client side se sirf request).
 *
 * Actual user creation Edge Function `create-auth-user` karti hai (service key
 * wahan server-side rehti hai; browser me KABHI nahi). Function caller ki
 * profiles.role check karti hai — sirf principal/developer hi naye users
 * bana sakte hain, baaki khud ka password hi badal sakte hain.
 */
import { supabase } from '../supabase';
import { toAuthEmail, sanitizeLoginKey, AUTH_EMAIL_DOMAIN } from './authId';

export interface ProvisionAuthArgs {
  /** 'create-or-update' (naya user / password reset) ya 'update-password' (self ya admin) */
  action?: 'create-or-update' | 'update-password';
  /** Login ID — username ya record id (email nahi) */
  loginId: string;
  password: string;
  role: 'teacher' | 'student' | 'coordinator' | 'principal' | 'developer';
  /** App record id (teachers.id / students.id / coordinators.id) — rename detection ke liye */
  refId?: string;
  displayName?: string;
}

export interface ProvisionAuthResult {
  ok: boolean;
  error?: string;
}

/** Edge Function ke through Supabase Auth user banata/update karta hai. */
export async function provisionAuthUser(args: ProvisionAuthArgs): Promise<ProvisionAuthResult> {
  const loginKey = sanitizeLoginKey(args.loginId);
  const email = toAuthEmail(args.loginId || '') || (loginKey ? loginKey + AUTH_EMAIL_DOMAIN : '');
  if (!loginKey || !email || !args.password) {
    return { ok: false, error: 'Login ID ya password missing hai' };
  }
  if (String(args.password).length < 6) {
    return { ok: false, error: 'Password kam se kam 6 characters ka ho' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('create-auth-user', {
      body: {
        action: args.action || 'create-or-update',
        loginKey,
        password: args.password,
        role: args.role,
        refId: args.refId || null,
        displayName: args.displayName || loginKey,
      },
    });

    if (error) {
      const status = (error as any)?.context?.status;
      const msg = status === 404
        ? 'Auth function deploy nahi hai (supabase functions deploy create-auth-user)'
        : (error.message || 'Auth function error');
      return { ok: false, error: msg };
    }
    if (data && (data as any).error) return { ok: false, error: (data as any).error };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Network error (auth function tak nahi pahuncha)' };
  }
}

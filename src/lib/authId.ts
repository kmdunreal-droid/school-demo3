/**
 * ID+PASSWORD AUTH HELPERS
 * User ka Login ID (jaise `ali`, `teacher1`, `STU-9012-KX`) Supabase Auth ke
 * email field me map hota hai: `<loginKey>@app.school` (fake-email pattern).
 * User ko email kabhi dikhta nahi — sirf uska ID.
 *
 * NOTE: sanitize ka rule scripts/provision-users.cjs ke SAME rakha gaya hai,
 * warna paasword provisioning aur login ek dusre se mismatch ho jayenge.
 */

export const AUTH_EMAIL_DOMAIN = '@app.school';

/** ID/username → safe login key (lowercase, sirf a-z 0-9 . _ -) */
export function sanitizeLoginKey(value: string): string {
  return (value || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
}

/** Login input → auth email. Real email (jisme '@' hai) ke liye null. */
export function toAuthEmail(loginId: string): string | null {
  if (!loginId || loginId.includes('@')) return null;
  const key = sanitizeLoginKey(loginId);
  return key ? key + AUTH_EMAIL_DOMAIN : null;
}

/** login key → display ke liye ID (jaise 'teacher1' → 'teacher1') */
export function loginKeyOf(record: { username?: string; id?: string; email?: string } | null | undefined): string {
  if (!record) return '';
  return sanitizeLoginKey(record.username || '') || sanitizeLoginKey(record.id || '') || sanitizeLoginKey((record.email || '').split('@')[0]);
}

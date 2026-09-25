# ID + PASSWORD AUTH (Supabase Auth) — Setup & Ops

App me login **ID + Password** se hota hai (email kabhi nahi). Internally ID ko

```
<loginKey>@app.school      e.g.  ali@app.school, teacher1@app.school, STU-9012-KX@app.school
```

fake-email pattern se Supabase Auth me map kiya jata hai. Role/record linking
`public.profiles` table se aata hai (`id → auth.users.id`).

## Kyun aisa?

- Supabase Auth strong password hashing (bcrypt) + session/JWT deta hai, lekin email/phone chahiye.
- Shcolar ke IDs (ali, teacher1, STU-01) user-facing identity hain → fake email banake wahi dikhate hain.
- Email delivery (SMTP) ki zaroorat nahi + free tier ke 50k MAU ke andar rehta hai.
  (Firebase phone OTP reject kiya gaya: Pakistan me ~$0.108/verification.)

## Security model

| Cheez | Kahan rehti hai |
| --- | --- |
| Service/secret key (user banane ke liye) | **Sirf** Edge Function `create-auth-user` (server-side) |
| Login passwords | `auth.users.encrypted_password` (bcrypt) |
| App record ka `password` field | Device-local (offline fallback) + DB record (provisioning ka source) |
| Browser → cloud sync | `password` field **strip** ho jata hai (`src/lib/supabaseSync.ts`) |

- Role escalation block: login par role **sirf** `profiles` table se milta hai. Jinem profile row
  nahi, unko login reject hota hai (pehle koi bhi authenticated email auto-principal ban jata tha).
- Edge Function apni permission khud check karti hai: sirf `principal`/`developer` naye users
  bana sakte hain; baaki sirf apna password update kar sakte hain (role apne aap ka nahi badal sakte).

## Files

| File | Kaam |
| --- | --- |
| `src/lib/authId.ts` | Sanitize rule + `toAuthEmail()` (login side) |
| `src/lib/authAdmin.ts` | `provisionAuthUser()` — Edge Function ko call |
| `supabase/functions/create-auth-user/index.ts` | Auth user create/update (service key yahan) |
| `scripts/profiles-schema.sql` | `profiles` table + RLS (`profiles_read_own`) |
| `scripts/provision-users.cjs` | Bulk provisioning (direct Postgres, service key ke bina) |
| `scripts/test-auth-login.cjs` | Real login test (password grant + profiles RLS) |
| `scripts/db-status.cjs` / `db-diag.cjs` | DB health / deep dump |
| `scripts/lint-check.cjs` | `tsc --noEmit` (kyunki is machine par `npx.ps1` blocked hai) |

## One-time bootstrap

1. **Schema** (Supabase SQL Editor ya psql):

   ```
   scripts/profiles-schema.sql
   ```

2. **Auth users + profiles** (direct Postgres, koi service key nahi chahiye):

   ```
   npm install                      # pg + dotenv (devDependencies)
   node scripts/provision-users.cjs
   ```

   Ye har principal/dev + DB ke teachers/students/coordinators ka auth user banata hai
   (ya mojood user ka password/profile sync karta hai). `--only=ali,teacher1` se selective,
   `--keep-passwords` se mojood users ka password na chherein, `--strip` se DB records se
   `password` field hata dein (default: records me rehne dein — wahi provisioning ka source hai).
   Passwords `.env` ke `SUPABASE_ADMIN_PASSWORD` / `DEV_PASSWORD` (defaults: `Ali@2026!`, `Km@6016!`).

3. **Supabase Dashboard → Authentication → Providers → Email**:

   - Email provider: **ON**
   - Confirm email: **OFF** (provisioning khud email_confirm karta hai)
   - Allow new sign-ups: **OFF** (users sirf principal/developer banayein)

4. **Edge Function deploy** (principal dashboard se user add karne ke liye):

   ```
   supabase functions deploy create-auth-user
   supabase secrets set SUPABASE_SECRET_KEY=sb_secret_...
   ```

   (Alternate secret name: `SUPABASE_SERVICE_ROLE_KEY` — dono support hain.)

## Roz-marra (day-to-day)

- **Naya teacher/student/coordinator**: Principal Dashboard → add form → record save hone par
  uska auth login bhi ban jata hai ("Login ban gaya: teacher7" toast).
- **Login**: ID (ya username/record id) + password. Teacher login ID = `username` (jo add form me
  name se banta hai) → sanitize ho kar `sarahjenkins@app.school` jaisa ban jata hai.
- **Logout**: cloud session bhi `supabase.auth.signOut()` se khatam hota hai.
- **Verify login (bina browser)**:

  ```
  node scripts/test-auth-login.cjs ali
  node scripts/test-auth-login.cjs teacher1
  ```

## Troubleshooting

| Error | Wajah / Fix |
| --- | --- |
| `500 Database error querying schema` (login par) | `auth.users` ke token columns (`confirmation_token`, `email_change`, `recovery_token`, ...) NULL hain. `node scripts/provision-users.cjs --no-strip` dobara chalayein — ye normalize kar deta hai. |
| `Invalid login credentials` | Password mismatch (record vs auth) — provisioning dobara chalayein (password record se sync hota hai). |
| `Auth function deploy nahi hai` | `supabase functions deploy create-auth-user`. |
| `Permission nahi hai (sirf apna password)` | Caller ki `profiles.role` principal/developer nahi hai. |
| `account kisi staff/student profile se linked nahi` | `profiles` row missing → `node scripts/provision-users.cjs`. |
| Real email provider off | Dashboard → Providers → Email ON (password grant 500/400 de sakta hai). |

## Purana behaviour (remove ho gaya)

- Hardcoded credentials `km / 6016` aur `ali / 111222` **hata diye** gaye.
- Purane: koi bhi Supabase Auth user (email verify) login karta tha aur **automatically principal**
  ban jata tha — ye privilege escalation hole tha; ab profiles + RLS se role decide hota hai.

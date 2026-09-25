-- ============================================================
-- PROFILES — ID+Password auth system (Supabase Auth ke saath)
-- Run: Supabase SQL Editor me ya `node scripts/provision-users.cjs` khud chalata hai.
--
-- id        = auth.users.id (uuid, text me)
-- login_key = sanitized Login ID jo user type karta hai (jaise 'ali', 'teacher1')
-- role      = principal | developer | teacher | student | coordinator
-- ref_id    = app record id (teachers.id / students.id / coordinators.id)
-- ============================================================
create table if not exists public.profiles (
  id           text primary key,          -- auth uid
  login_key    text not null unique,      -- sanitized ID (lowercase)
  role         text not null,
  ref_id       text,                      -- app record id (nullable for principal/dev)
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Sirf logged-in user apni profile padh sake (role check ke liye).
-- Service role (scripts + Edge Function) RLS bypass karta hai.
drop policy if exists profiles_read_own on public.profiles;
create policy profiles_read_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()::text));

-- Exam Bridge — Passkeys (biometric login)
-- Idempotent. Paste into Supabase SQL Editor → Run.

create table if not exists public.user_passkeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  credential_id text unique not null,
  public_key text not null,
  counter bigint default 0,
  transports text[],
  device_name text,
  created_at timestamptz default now(),
  last_used_at timestamptz
);

create index if not exists user_passkeys_user_id_idx
  on public.user_passkeys (user_id);

alter table public.user_passkeys enable row level security;

drop policy if exists "Users read own passkeys" on public.user_passkeys;
create policy "Users read own passkeys"
  on public.user_passkeys for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users insert own passkeys" on public.user_passkeys;
create policy "Users insert own passkeys"
  on public.user_passkeys for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users delete own passkeys" on public.user_passkeys;
create policy "Users delete own passkeys"
  on public.user_passkeys for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users update own passkeys" on public.user_passkeys;
create policy "Users update own passkeys"
  on public.user_passkeys for update to authenticated
  using (user_id = auth.uid());

create table if not exists public.passkey_challenges (
  id text primary key,
  challenge text not null,
  expires_at timestamptz not null
);

alter table public.passkey_challenges enable row level security;

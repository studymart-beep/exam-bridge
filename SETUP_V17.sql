-- ============================================
-- SETUP_V17.sql — Complete migration for Exam Bridge
-- Safe to run multiple times (idempotent).
-- Paste entire file into Supabase SQL Editor → Run.
-- ============================================

-- A. Profiles table additions
alter table public.profiles
  add column if not exists avatar_url text;

alter table public.profiles
  add column if not exists state_of_origin text;

-- B. Materials source_type (skip check if column already exists with different constraint)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'materials' and column_name = 'source_type'
  ) then
    alter table public.materials
      add column source_type text default 'supabase';
  end if;
end $$;

-- C. Storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  false,
  2097152,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- D. Storage policies (drop + create for idempotency)

-- avatars
drop policy if exists "Users upload own avatar" on storage.objects;
create policy "Users upload own avatar"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users update own avatar" on storage.objects;
create policy "Users update own avatar"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated read avatars" on storage.objects;
create policy "Authenticated read avatars"
on storage.objects for select to authenticated
using (bucket_id = 'avatars');

drop policy if exists "Users delete own avatar" on storage.objects;
create policy "Users delete own avatar"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- videos
drop policy if exists "Authenticated read videos" on storage.objects;
create policy "Authenticated read videos"
on storage.objects for select to authenticated
using (bucket_id = 'videos');

drop policy if exists "Admin upload videos" on storage.objects;
create policy "Admin upload videos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'videos'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists "Admin update videos" on storage.objects;
create policy "Admin update videos"
on storage.objects for update to authenticated
using (
  bucket_id = 'videos'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists "Admin delete videos" on storage.objects;
create policy "Admin delete videos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'videos'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- pdfs
drop policy if exists "Authenticated read pdfs" on storage.objects;
create policy "Authenticated read pdfs"
on storage.objects for select to authenticated
using (bucket_id = 'pdfs');

drop policy if exists "Admin upload pdfs" on storage.objects;
create policy "Admin upload pdfs"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'pdfs'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists "Admin update pdfs" on storage.objects;
create policy "Admin update pdfs"
on storage.objects for update to authenticated
using (
  bucket_id = 'pdfs'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists "Admin delete pdfs" on storage.objects;
create policy "Admin delete pdfs"
on storage.objects for delete to authenticated
using (
  bucket_id = 'pdfs'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- receipts
drop policy if exists "Students upload own receipt" on storage.objects;
create policy "Students upload own receipt"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Students read own receipt" on storage.objects;
create policy "Students read own receipt"
on storage.objects for select to authenticated
using (
  bucket_id = 'receipts'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
);

drop policy if exists "Admins read all receipts" on storage.objects;
create policy "Admins read all receipts"
on storage.objects for select to authenticated
using (
  bucket_id = 'receipts'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists "Admins delete receipts" on storage.objects;
create policy "Admins delete receipts"
on storage.objects for delete to authenticated
using (
  bucket_id = 'receipts'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- E. handle_new_user trigger (full_name, phone, state_of_origin)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id, email, full_name, phone, state_of_origin, role, status
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'state_of_origin', ''),
    'student',
    'inactive'
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    phone = coalesce(nullif(excluded.phone, ''), public.profiles.phone),
    state_of_origin = coalesce(nullif(excluded.state_of_origin, ''), public.profiles.state_of_origin);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- F. Settings seed
insert into public.settings (key, value) values
  ('subscription_price', '5000'),
  ('bank_name', ''),
  ('account_name', ''),
  ('account_number', '')
on conflict (key) do nothing;

-- ============================================
-- Applied changes:
--   * profiles.avatar_url
--   * profiles.state_of_origin
--   * materials.source_type (if missing)
--   * Storage buckets: avatars, videos, pdfs, receipts
--   * Storage policies for all four buckets
--   * handle_new_user trigger (updated with state_of_origin)
--   * settings seed data
-- ============================================

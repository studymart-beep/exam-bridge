-- Exam Bridge v25: material cover images
-- Paste into Supabase SQL Editor and Run. Idempotent.

alter table public.materials
  add column if not exists cover_url text;

insert into storage.buckets (id, name, public)
values ('covers', 'covers', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated read covers" on storage.objects;
create policy "Authenticated read covers" on storage.objects
  for select to authenticated
  using (bucket_id = 'covers');

drop policy if exists "Admin upload covers" on storage.objects;
create policy "Admin upload covers" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'covers'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Admin update covers" on storage.objects;
create policy "Admin update covers" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'covers'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Admin delete covers" on storage.objects;
create policy "Admin delete covers" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'covers'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

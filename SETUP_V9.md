# Exam Bridge v9 — Video + PDF storage setup

## 1. Create private buckets (Supabase Dashboard → Storage)

- `videos` — Private
- `pdfs` — Private

Optional: set max file size to 500 MB on each bucket.

## 2. SQL (paste in Supabase SQL Editor)

```sql
-- materials.source_type
alter table public.materials
  add column if not exists source_type text
  default 'supabase'
  check (source_type in ('supabase', 'cloudflare'));

-- Authenticated read
create policy "Authenticated read videos"
on storage.objects for select to authenticated
using (bucket_id = 'videos');

create policy "Authenticated read pdfs"
on storage.objects for select to authenticated
using (bucket_id = 'pdfs');

-- Admin upload
create policy "Admin upload videos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'videos'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

create policy "Admin upload pdfs"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'pdfs'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

create policy "Admin delete videos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'videos'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

create policy "Admin delete pdfs"
on storage.objects for delete to authenticated
using (
  bucket_id = 'pdfs'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);
```

If policies already exist, drop or rename duplicates first.

## 3. App env

No new env vars. Uses existing Supabase URL + service role for admin uploads.

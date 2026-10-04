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

## v10 — Signed uploads (large video/PDF)

App uploads go **direct to Supabase** via `createSignedUploadUrl` (service role).
No extra SQL is required if you already ran the v9 bucket + policy script.

If PUT still fails for authenticated clients using user tokens (not service-signed URLs), ensure:

```sql
-- Optional: allow authenticated INSERT (signed upload tokens may still need object policies)
drop policy if exists "Authenticated insert videos" on storage.objects;
drop policy if exists "Authenticated insert pdfs" on storage.objects;

create policy "Authenticated insert videos"
on storage.objects for insert to authenticated
with check (bucket_id = 'videos');

create policy "Authenticated insert pdfs"
on storage.objects for insert to authenticated
with check (bucket_id = 'pdfs');
```

Admin uploads use the **service role** signed URL from the server, so they should work after buckets exist and `SUPABASE_SERVICE_ROLE_KEY` is set on Vercel.

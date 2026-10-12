# Exam Bridge — SETUP v15

Run in Supabase SQL Editor:

```sql
-- Profile columns
alter table public.profiles
  add column if not exists avatar_url text;

alter table public.profiles
  add column if not exists state_of_origin text;

-- Create private avatars bucket in Dashboard → Storage → New bucket
-- Name: avatars, Public: OFF

-- Storage policies
create policy "Users upload own avatar"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users update own avatar"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Authenticated read avatars"
on storage.objects for select to authenticated
using (bucket_id = 'avatars');

create policy "Users delete own avatar"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

If a policy already exists, drop it first or ignore the error.

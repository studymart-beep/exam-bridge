# Setup addendum (run in Supabase if not already done)

## 1. Profile auto-create trigger

```sql
-- Ensure profiles row is created on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'student',
    'inactive'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 2. Storage bucket `receipts`

In Supabase Dashboard → Storage:
- Create bucket `receipts` (private recommended).

Policies (SQL Editor):

```sql
-- Students can upload their own receipts
create policy "Students upload own receipts"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Students can read own receipts
create policy "Students read own receipts"
on storage.objects for select to authenticated
using (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can read all receipts (requires profiles.role = admin)
create policy "Admins read receipts"
on storage.objects for select to authenticated
using (
  bucket_id = 'receipts'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);
```

## 3. Env vars (already expected)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only — payment approve / profile updates)

No new env vars beyond these.

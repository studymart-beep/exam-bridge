# Exam Bridge v23 setup notes

## Site URL
Set in Vercel / `.env`:
```
NEXT_PUBLIC_SITE_URL=https://exam-bridge-one.vercel.app
```
(no trailing slash)

Add the same host to Supabase Auth redirect URLs for password reset.

## Materials bucket (topic summary images)
In Supabase Storage, create a private bucket named **`materials`** if it does not exist.

SQL (policies — adjust as needed):

```sql
-- No new column on materials.type (text). Values used: video | pdf | image | summary_image.

insert into storage.buckets (id, name, public)
values ('materials', 'materials', false)
on conflict (id) do nothing;

create policy "Authenticated read materials"
on storage.objects for select to authenticated
using (bucket_id = 'materials');

-- Uploads use service role signed URLs from admin actions.
```

## PDF fullscreen / PWA
`manifest.json` includes `display_override: ["fullscreen","standalone"]`.
Users must **uninstall and reinstall** the PWA for the new manifest to apply.

Full-screen coverage depends on the browser. Element `requestFullscreen` hides browser chrome where supported; iOS is limited.

## Download / print blocks
These stop casual Ctrl+S / Ctrl+P / right-click / print on the custom PDF viewer.
They cannot stop DevTools or screen capture.

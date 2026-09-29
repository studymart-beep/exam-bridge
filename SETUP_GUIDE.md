# Exam Bridge v5 — Setup Guide (Supabase)

## 1. Create a Supabase project

1. Go to https://supabase.com → New project  
2. Note your **Project URL** and **API keys** under  
   **Project Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`  
     (never expose this in the browser)

## 2. Run the database schema

1. Open **SQL Editor** in Supabase  
2. Paste the full contents of **`schema.sql`** from this repo  
3. Click **Run**

## 3. Storage bucket for receipts

1. **Storage → New bucket**  
2. Name: `receipts`  
3. **Public**: off (private)  
4. Save  

Optional: add storage policies from the commented block at the bottom of `schema.sql`.

## 4. Create the admin user

1. **Authentication → Users → Add user**  
2. Enter admin email + password  
3. Confirm the user  
4. Open **SQL Editor** and run (replace the email):

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
```

## 5. Local environment

In the project root, create **`.env.local`** (do not commit it):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Then:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 6. Vercel

1. Project → **Settings → Environment Variables**  
2. Add the same three variables for Production (and Preview if you want)  
3. Redeploy after saving

## 7. Smoke test checklist

| Step | Expected |
|------|----------|
| Register student | Lands on `/dashboard` |
| Login student | `/dashboard` |
| Visit `/subjects` without sub | List visible (content locked on topic materials) |
| Admin login `/admin/login` | `/admin/dashboard` |
| Non-admin on `/admin/*` | Redirected to `/dashboard` |
| Logged-out on `/dashboard` | Redirected to `/login` |
| Subscribe + upload receipt | Row in `payments` (pending) |
| Admin Approve payment | Profile `status=active`, expiry +30 days |

## 8. Seed content

With an empty DB, subjects/topics lists are empty until an admin adds them in **Admin → Subjects**.  
You can also insert sample rows via SQL Editor.

## Notes

- Student register does **not** go to `/subscribe` — it goes to `/dashboard`.  
- There is **no** admin register page.  
- Service role is only used on the server for payment approval when needed.  
- Never commit `.env.local` or print service role keys.

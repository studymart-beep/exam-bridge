# Exam Bridge v25 setup

1. Open Supabase → **SQL Editor**
2. Paste the full contents of `SETUP_V25.sql`
3. Click **Run**

This adds:
- `materials.cover_url` (nullable text)
- Private Storage bucket **`covers`** with read/upload policies for admins

No other env vars required. After running SQL, redeploy is optional if the app is already deployed with v25 code.

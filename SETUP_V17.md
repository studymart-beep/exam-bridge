# Exam Bridge — SETUP v17

## One-time database migration

1. Open **Supabase Dashboard** → **SQL Editor** → **New query**
2. Open `SETUP_V17.sql` from this project and **paste the entire file**
3. Click **Run**
4. Confirm success (e.g. “Success. No rows returned”)

The script is **idempotent** — running it again is safe.

## What it does

- Adds `profiles.avatar_url` and `profiles.state_of_origin`
- Ensures `materials.source_type` exists
- Creates private buckets: `avatars`, `videos`, `pdfs`, `receipts`
- Applies storage RLS policies for students and admins
- Updates `handle_new_user` to save full name, phone, and state of origin from signup metadata
- Seeds default subscription settings

No manual Storage dashboard steps are required if this SQL completes successfully.

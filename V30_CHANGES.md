# Exam Bridge v30 — Password reset redirect + show/hide password

## Fixed
- Reset email now redirects via `/auth/callback?next=/reset-password` (session code exchange)
- Middleware allows `/auth/*` and does not bounce recovery users off `/reset-password`
- Reset page absorbs hash tokens if present
- Show / Hide password on student login, register, admin login, reset password

## Supabase Dashboard (required)
Site URL and Redirect URLs must include production domain (see SETUP_V30.md)

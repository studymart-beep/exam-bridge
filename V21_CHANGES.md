# Exam Bridge v21

## 1. Student PWA icons
- Edge-to-edge logo on cream (maskable keeps ~20% safe zone)

## 2. Launch behavior (`eb_visited` cookie)
- New visitor → `/`
- Returning, no session → `/login` from `/`
- Student session → `/dashboard`
- Admin session → `/admin/dashboard`
- `/subjects` list allowed for guests (preview)

## 3. Login isolation
- Student login rejects non-student with generic error
- Admin login rejects non-admin with same generic error

## 4. Forgot / reset password
- `/forgot-password`, `/reset-password`
- Links on student + admin login

## 5. Guest subjects
- GuestSubjectsList + register modal
- Authenticated subjects list unchanged

## 6. Subscription prompt
- Session popup on dashboard when inactive
- Sidebar Subscribe only when not subscribed

## 7. Logout confirmation
- LogoutButton + ConfirmDialog (student + admin profile)

## Assumptions
- Supabase Site URL must include `/reset-password` for email links
- Reinstall PWA to see new icons

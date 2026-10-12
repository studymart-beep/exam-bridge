# Exam Bridge v13A

## Added
- `src/lib/actions/student/profile.ts` — updateProfile, changePassword
- `src/components/student/ProfileHub.tsx` — profile + settings hub UI

## Changed
- `src/components/student/StudentSidebar.tsx` — removed Settings nav item
- `src/components/student/LoginForm.tsx` — removed duplicate Register link
- `src/app/(student)/profile/page.tsx` — redesigned hub + stats from Supabase
- `src/components/student/VideoPlayerSecure.tsx` — landscape orientation lock attempt + rotate hint
- `src/components/student/PDFViewerSecure.tsx` — true full-viewport dark reader (no white gaps)

## Deleted
- `src/app/(student)/settings/page.tsx`

## Notes
- Login page still has one Register link at the bottom (page.tsx)
- Screen.orientation.lock is best-effort (many mobile browsers block it)

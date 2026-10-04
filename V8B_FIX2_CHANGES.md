# v8B-fix2

## Fixed
- `src/components/admin/AdminHeader.tsx` — added optional `onMenuClick`; hamburger uses prop or layout context

## Student nav (admin-style drawer)
- `src/components/student/StudentSidebar.tsx` — mobile drawer + desktop fixed
- `src/components/student/StudentHeader.tsx` — hamburger via `useStudentMenu` / `onOpenSidebar`
- `src/app/(student)/layout.tsx` — sidebar state + context; no bottom tab bar

## Deleted
- `src/components/student/MobileTabBar.tsx`

## Assumptions
- Page-level `StudentHeader` remains; layout does not render a second header
- Admin subjects page can keep `onMenuClick={openMenu}`; other pages rely on context only

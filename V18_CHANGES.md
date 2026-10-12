# Exam Bridge v18

## Goal
Show uploaded profile picture in headers and sidebars; tap → profile.

## Changes
- `src/components/ui/Avatar.tsx` — `src` prop + onError → initials
- `src/lib/data/profile.ts` — `avatar_url` on Profile; `getCurrentProfileBrief()`
- Layouts fetch brief once and pass into menu providers
- Student/Admin headers & sidebars show Avatar + link to profile
- Menu contexts expose `useStudentUser` / `useAdminUser`

## Files
- src/components/ui/Avatar.tsx
- src/lib/data/profile.ts
- src/components/student/StudentMenuContext.tsx
- src/components/student/StudentHeader.tsx
- src/components/student/StudentSidebar.tsx
- src/components/admin/AdminMenuContext.tsx
- src/components/admin/AdminHeader.tsx
- src/components/admin/AdminSidebar.tsx
- src/app/(student)/layout.tsx
- src/app/(admin)/admin/layout.tsx
- (optional) student pages passing avatarUrl prop

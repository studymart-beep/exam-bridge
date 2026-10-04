# v8B-fix3

## Problem
Next.js layouts cannot export custom hooks (`useStudentMenu` / `useAdminMenu`).

## Fix
- `src/components/student/StudentMenuContext.tsx` — provider + `useStudentMenu`
- `src/components/admin/AdminMenuContext.tsx` — provider + `useAdminMenu`
- `src/app/(student)/layout.tsx` — default export only
- `src/app/(admin)/admin/layout.tsx` — default export only
- Updated imports in `StudentHeader`, `AdminHeader`, `admin/subjects/page.tsx`

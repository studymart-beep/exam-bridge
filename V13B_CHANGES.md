# Exam Bridge v13B

## Video
- Removed forced landscape lock; natural portrait/landscape rotation in fullscreen

## PDF
- Continuous vertical scroll of all pages
- No bottom nav bar; side page badge only; minimal zoom + X

## Images
- Fullscreen viewer with double-tap zoom, prev/next, back/Escape close

## Admin
- Sidebar: Settings → Profile
- New `/admin/profile` hub (stats, bank/price settings, password, logout)
- Deleted `/admin/settings` page
- `src/lib/actions/admin/profile.ts`

## Files changed/added
- VideoPlayerSecure, PDFViewerSecure, ImageGallery
- AdminSidebar, AdminProfileHub, admin/profile/page
- admin/profile actions, settings revalidate

## Deleted
- src/app/(admin)/admin/settings/page.tsx

# Exam Bridge v22B

## Downloads
- Removed standalone "Download for offline" cards from topic materials
- Download control is an icon (↓) inside PDF fullscreen top bar and video player chrome
- Toast: "Saved to downloads" on success
- New `/downloads` page lists IndexedDB offline files (Open / Remove with confirm)
- Student sidebar: **Downloads** item
- Middleware protects `/downloads`

## Logout
- Unchanged from v21: `LogoutButton` + ConfirmDialog modal (no dedicated page)

## PWA launch
- Unchanged from v21 middleware:
  - New visitor → `/`
  - Returning, no session on `/` → `/login`
  - Logged-in student → `/dashboard`
  - Logged-in admin → `/admin/dashboard`

## Assumptions
- Offline meta does not store subject/topic names yet (title + type + size + date only)
- Open from /downloads uses blob URL in a new tab

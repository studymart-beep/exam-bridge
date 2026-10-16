# Exam Bridge v20

## PWA icons
- Regenerated from `public/logo.png` (current book/lamp logo)
- Student: icon-192, icon-512, maskable variants, apple-touch-icon, favicon.ico
- Admin: same logo + gold ADMIN ribbon badge
- Cream background (#FFFBEB), logo centered ~85% of canvas

## Admin PWA start
- `admin-manifest.json`: start_url `/admin/login`, scope `/admin/`
- Admin layout exports `metadata.manifest = "/admin-manifest.json"`
- `AdminPwaMeta` forces admin manifest link in the document head

## Student PWA
- `manifest.json`: start_url `/`, name Exam Bridge

## Note
Existing home-screen installs keep the old icon until the user
uninstalls and reinstalls the PWA (browser cache).

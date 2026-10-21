# Exam Bridge v29 — New logo everywhere in the app UI

## What changed
- `public/logo.png` — replaced with the new green/gold book-and-lamp image
  (used by Logo component in student + admin headers, sidebars, login, landing, SEO)
- Student PWA icons regenerated from the same image (full-bleed)
- `public/sw.js` → CACHE_VERSION `eb-v29-1`

## What did NOT change
- Admin PWA home-screen icons (`admin-192.png`, `admin-512.png`, maskable)
- `public/admin-manifest.json`

## Result
- Student app UI + student PWA icon → new logo
- Admin pages inside the app → new logo (via same `/logo.png`)
- Admin installed PWA icon on phone → still the previous admin icon

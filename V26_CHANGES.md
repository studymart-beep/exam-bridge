# Exam Bridge v26

## Student PWA icons
- Regenerated icon-192, icon-512, apple-touch-icon so logo fills ~100% of canvas
- Maskable icons keep ~20% safe-zone on cream (#FFFBEB)
- favicon.ico 32x32 regenerated
- Admin icons unchanged
- `public/sw.js` CACHE_VERSION → `eb-v26-1` (forces icon refresh after reinstall)

## PDF auto-rotate
- No orientation.lock, no CSS rotate, no user rotate button
- Listens to resize + orientationchange + matchMedia(orientation)
- Clears page shells and re-renders with new width; preserves scroll ratio
- Fullscreen still uses 100vw / 100dvh

## Manifest
- Student `orientation` set to `any` so PDF/video can rotate in installed PWA

## Assumptions
- Users may need to uninstall + reinstall the PWA (or clear site data) to see new icons on home screen

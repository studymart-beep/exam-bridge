# Exam Bridge v11

## Added
- Premium 3D book+bridge logo (`src/components/brand/Logo.tsx`)
- PWA icons under `public/icons/` (192, 512, maskable, apple, favicon)
- `public/manifest.json`, `public/sw.js`, `public/offline.html`
- `src/components/pwa/ServiceWorkerRegister.tsx`
- `src/components/pwa/InstallPrompt.tsx`
- YouTube-style `VideoPlayerSecure` (custom controls, gestures, FS)

## Changed
- `src/app/layout.tsx` — manifest, theme, viewportFit, SW + install prompt
- `src/components/student/VideoPlayerSecure.tsx` — full rewrite

## Assumptions
- SW registers only in production builds
- iOS install uses Share → Add to Home Screen hint (no beforeinstallprompt)
- Admin routes are not cached by the service worker
- Icon PNGs generated from SVG via ImageMagick

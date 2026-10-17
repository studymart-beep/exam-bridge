# Exam Bridge v27 — PWA icon crop

## What was done
`public/logo.png` has a circular badge on a cream square. Icons were
generated from a **cropped circle only**:

1. Detected non-cream pixels to find the badge bounds
2. Cropped a tight square (3% margin) → `public/logo-circle.png`
3. Resized that crop to all student PWA icon sizes (edge-to-edge)
4. Maskable icons keep ~18% safe-zone padding on cream
5. `public/logo.png` is **unchanged** (header/sidebar still use it)
6. Service worker cache: `eb-v27-1`

## After deploy
Uninstall the student PWA from the phone, clear site data if the old
icon still appears, then reinstall from the browser.

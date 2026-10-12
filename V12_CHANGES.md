# Exam Bridge v12

## Logo
- Recolored official logo (navy → deep green; gold/cream kept)
- `public/logo.png` + all PWA/favicon sizes under `public/icons/`
- `Logo.tsx` uses next/image of `/logo.png` (no hand-drawn SVG)

## Video
- Materials list: preview card (logo thumbnail + play)
- Tap opens **fullscreen only** (Fullscreen API + iOS fixed overlay fallback)
- YouTube-style controls, auto-hide 3s, double-tap skip, Android back exits
- Download stays under the preview card

## PDF
- Preview card → fullscreen dark reader
- Page controls, zoom, jump, swipe, Android back / Escape exit

## Files
Added/updated: public/logo.png, public/icons/*, Logo.tsx, layout, manifest,
VideoPlayerSecure, PDFViewerSecure, MaterialsViewer, V12_CHANGES.md

## Assumptions
- Logo recolor is pixel-based navy→green mapping from attached JPG
- iOS uses fixed full-viewport overlay when requestFullscreen fails

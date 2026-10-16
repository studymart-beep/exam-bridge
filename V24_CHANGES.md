# Exam Bridge v24

## PDF online render
- Unified render path (online + offline)
- Full ArrayBuffer fetch with content-length check + one retry
- DPR-aware viewport; no CSS rotation
- Cancel in-flight page renders; re-render on resize
- requestFullscreen on open; exitFullscreen on close

## Fullscreen / PWA
- display_override: fullscreen, standalone, minimal-ui (student + admin manifests)
- Viewer z-index 99999, 100dvh, safe-area padding

## Downloads in-app
- No window.open — PDF opens PDFViewerSecure; video opens in-app player
- Grouped by Subject → Topic (labels stored when downloading from topic page)
- Offline empty-state copy

## Offline mode
- OfflineBanner under student header (session-dismissable)
- /offline fallback page with link to Downloads

## Files
- PDFViewerSecure.tsx (rewrite)
- DownloadsClient.tsx, OfflineBanner.tsx
- student layout, MaterialsViewer, topic page
- offline/page.tsx, manifests, cache meta

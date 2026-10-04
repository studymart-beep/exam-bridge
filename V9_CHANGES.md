# Exam Bridge v9 — Video + PDF system

## Library
- `pdfjs-dist` ^4.10.38

## New files
- `SETUP_V9.md`
- `src/lib/actions/student/materials.ts` — signed URL + subscription status
- `src/lib/offline/cache.ts` — IndexedDB offline cache
- `src/components/student/VideoPlayerSecure.tsx`
- `src/components/student/PDFViewerSecure.tsx`
- `src/components/student/CacheManager.tsx`

## Changed
- `package.json` — pdfjs-dist
- `src/lib/actions/admin/materials.ts` — Storage upload (videos/pdfs buckets)
- `src/components/admin/MaterialsManager.tsx` — file input + upload
- `src/components/student/MaterialsViewer.tsx` — secure players
- `src/components/student/StudentMenuContext.tsx` — mounts CacheManager

## Setup (owner)
1. Create private buckets `videos` and `pdfs`
2. Run SQL in SETUP_V9.md (`source_type` + storage policies)

## Assumptions
- `activity_logs` insert is best-effort (ignored if table missing)
- Cloudflare playback uses public-style URL until token phase
- Service role used for signed URLs and admin uploads
- Offline “download” stores blob in IndexedDB only (in-app), not OS downloads

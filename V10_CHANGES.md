# Exam Bridge v10

## Part 1 — Large file upload (fix 413)
- Removed file body from Server Actions (Vercel ~4.5 MB limit)
- `requestUploadUrl` → Supabase `createSignedUploadUrl`
- Client `PUT` with XHR progress
- `finalizeMaterial` inserts materials row
- Cloudflare/URL path still via `createMaterial`

## Part 2 — PDF mobile reader
- Mobile: "Open PDF" → full-screen `#1A1A1A` overlay
- Floating controls (auto-hide 3s), zoom, jump, swipe, offline download
- Desktop: inline canvas + controls (unchanged layout)

## Files
- `src/lib/actions/admin/materials.ts`
- `src/components/admin/MaterialsManager.tsx`
- `src/components/student/PDFViewerSecure.tsx`
- `SETUP_V9.md` (v10 note)
- `V10_CHANGES.md`

## Assumptions
- Supabase signed upload uses HTTP PUT
- Service role key required on server for signed upload URLs

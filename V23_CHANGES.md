# Exam Bridge v23

## SEO
- `src/app/sitemap.ts` — public routes only
- `public/robots.txt`
- Root `metadataBase` + title template
- Page metadata (login, register, subscribe, landing) + forgot-password layout
- Landing JSON-LD EducationalOrganization
- `.env.example` — NEXT_PUBLIC_SITE_URL

## Topic summary image
- Type `summary_image` on materials
- Admin form option + image upload (max 5 MB) via `materials` bucket
- Topic page hero image (or gradient fallback)
- Excluded from student materials list / downloads

## PDF fullscreen + blocks
- `requestFullscreen` on open; exit on close
- Container `z-index: 9999`, `pdf-viewer-wrapper`
- Block Ctrl/Cmd+S/P, context menu, user-select, canvas drag
- `@media print` hides viewer
- Manifest `display_override`

## Assumptions
- Owner creates `materials` storage bucket + policies (SETUP_V23.md)

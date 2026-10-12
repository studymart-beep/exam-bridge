# Exam Bridge v16

## PDF
- Fixed crisp high-DPI render (scale * devicePixelRatio)
- No extra rotation transforms (respects PDF page.rotate)
- Full-width pages, continuous scroll
- Removed manual rotate button; phone orientation re-renders pages
- Opaque fullscreen overlay; rotate-phone hint 2s

## Dashboard
- Soft green/gold/sky accents on stats + quick tiles
- Progress ring gold fill
- Richer Newly Added section

## Profile
- Crop UI via react-easy-crop (1:1 → 512 JPEG 0.85)
- Upload path: avatars/{userId}/{timestamp}.jpg

## Admin PWA
- Admin icons with gold ADMIN badge
- admin-manifest.json + AdminPwaMeta install prompt

## package.json
- Added react-easy-crop ^5.4.1

## Assumptions
- Avatars bucket + policies from SETUP_V15 still required
- Owner runs `npm install` after extract (new dependency)

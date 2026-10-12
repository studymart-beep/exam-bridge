# Exam Bridge v15

## Fixed
- Register: removed duplicate "Already have an account" (form no longer has link; page has one)
- Login: single Register link
- PDF: z-index 100 above shell, white page canvas, no ± zoom, bottom rotate, X top-right
- Admin session: cookie maxAge 30d + requireAdmin refreshSession

## Added
- Avatar upload (signed URL → avatars bucket)
- State of Origin on student + admin profiles
- AdminInstallPrompt + AdminPwaMeta
- SETUP_V15.md SQL

## Changed
- Larger logos (sidebars 40, auth 72)
- PWA icons regenerated (logo ~85% canvas)
- Newly Added subjects section (numbered + NEW badge + tint)

## Assumptions
- Owner creates `avatars` bucket + runs SETUP_V15.md SQL
- Orientation lock best-effort on mobile browsers

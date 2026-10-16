# Exam Bridge v25

## Cover images
- `materials.cover_url` + private `covers` bucket (SETUP_V25.sql)
- Admin: optional cover on create/edit; "Add/Edit cover" on each material row
- Signed upload via `requestCoverUploadUrl` / `setMaterialCover` / `removeMaterialCover`
- Student: CoverThumb on material cards, video poster, PDF header strip, downloads list
- No cover → green/gold gradient placeholder (never black)

## Logout on PWA
- ConfirmDialog uses `fullScreenOnMobile={false}` + `size="sm"` → small centered popup
- LogoutButton only opens modal (no route change); confirm still calls signOut

## Files
- SETUP_V25.sql / SETUP_V25.md
- admin materials actions + MaterialsManager
- CoverThumb, student viewers, DownloadsClient, ConfirmDialog, LogoutButton

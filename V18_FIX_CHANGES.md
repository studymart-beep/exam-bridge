# v18 fix — avatar still showing initials

## Root causes
1. Pages passed `avatarUrl={profile?.avatar_url ?? null}` which **overrode** the layout context with `null` or a **storage path** that `<img>` cannot load (private bucket).
2. `finalizeAvatar` stored a long signed URL; better to store **path** and sign on every layout read.
3. Layouts were not forced dynamic, so avatar updates after upload could stay stale.

## Fixes
- Store `profiles.avatar_url` as storage path (`userId/timestamp.jpg`)
- `resolveAvatarUrl()` creates a fresh 7-day signed URL on read
- Headers: only use prop if non-empty; else use layout context
- `export const dynamic = "force-dynamic"` on student + admin layouts
- `revalidatePath(..., "layout")` after avatar upload
- Avatar resets `failed` when `src` changes

## After deploy
Re-upload profile photo once (so path is stored), then navigate to dashboard — header/sidebar should show the image.

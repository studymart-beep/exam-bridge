# Exam Bridge v19

## 1. Palette
- Page background `#BBF7D0`
- Cards: green `#DCFCE7` / gold `#FEF9C3` / blue `#DBEAFE` via `Card` `tint` / `tintIndex`
- Borders: green / gold / blue soft borders
- `cardTintClass()` in utils; CSS `.card-tint-0|1|2`

## 2. CBT take
- Fixed **Submit Exam** button
- Confirm modal with unanswered count
- Time-up modal + 10s countdown + auto-submit
- Inputs locked while submitting

## 3. PWA launch
- Student `manifest.json` → `start_url: "/"` (landing)
- Admin `admin-manifest.json` → `start_url: "/admin/login"`
- Theme/background colors aligned to green palette

## Files
- tailwind.config.ts, src/app/globals.css
- src/components/ui/Card.tsx, src/lib/utils.ts
- src/components/student/TakeExamClient.tsx
- public/manifest.json, public/admin-manifest.json

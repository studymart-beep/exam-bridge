# Exam Bridge v8B — Admin redesign + mobile

## New
- `src/components/admin/ResponsiveTable.tsx` — table on md+, cards on mobile

## Shell
- `AdminSidebar.tsx` — slide-in drawer (< lg), backdrop, X close, Logo, green/gold nav
- `AdminHeader.tsx` — hamburger via `useAdminMenu`, 44px tap targets
- `admin/layout.tsx` — sidebar state + overflow-x-hidden

## Modal
- `src/components/ui/Modal.tsx` — `fullScreenOnMobile` (default true)

## Restyled / palette-patched
- Admin login (Logo + cream)
- Admin pages under `src/app/(admin)/admin/**` (class token swaps)
- Admin components: ActivityFeed, DataTable (mobile cards), UsersClient,
  QuestionsManager, MaterialsManager, forms, charts (green strokes), etc.

## Logic untouched
- All `src/lib/**`, Server Actions, payment approve/reject, CBT, student/public

## Assumptions
- Pages that list items as Cards already (UsersClient, payments) keep card layout on all sizes
- DataTable consumers get automatic mobile cards without page edits

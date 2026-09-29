# Exam Bridge v4 — Frontend subscription gating (mock)

## New files

| File | Purpose |
|------|---------|
| `src/lib/subscription/context.tsx` | SubscriptionProvider + useSubscription (localStorage) |
| `src/components/dev/SubscriptionToggle.tsx` | Floating ON/OFF toggle |
| `src/components/student/SubscriptionBanner.tsx` | Inactive subscription banner + CTA |
| `src/components/student/LockedContent.tsx` | Locked placeholder |
| `src/components/student/PageLock.tsx` | Page wrapper (banner + locked or children) |
| `src/components/student/DashboardGated.tsx` | Dashboard banner + dim + LockedChip |
| `src/components/student/GeneralCbtRedirect.tsx` | Client redirect after lock check |

## Edited (ALLOWED EDITS only)

1. `src/app/layout.tsx` — SubscriptionProvider + SubscriptionToggle  
2. `src/app/(student)/subjects/page.tsx` — PageLock  
3. `src/app/(student)/subjects/[slug]/page.tsx` — PageLock  
4. `src/app/(student)/subjects/[slug]/topics/[topicId]/page.tsx` — PageLock  
5. `src/app/(student)/subjects/[slug]/general-cbt/page.tsx` — PageLock + redirect  
6. `src/app/(student)/cbt/page.tsx` — PageLock  
7. `src/app/(student)/cbt/[examId]/page.tsx` — PageLock  
8. `src/app/(student)/progress/page.tsx` — PageLock  
9. `src/app/(student)/results/page.tsx` — PageLock  
10. `src/app/(student)/dashboard/page.tsx` — DashboardGated + chips (not fully locked)  
11. `src/app/(public)/subscribe/page.tsx` — dev note comments  

## Not modified

- Admin panel  
- UI primitives  
- Mock data files  
- Types  
- Sidebar / bottom tabs  

## Behavior

| State | Effect |
|-------|--------|
| OFF (default) | Content pages show LockedContent; dashboard shows banner + dimmed tiles |
| ON | Full access; no banner |
| Persist | `localStorage` key `exam-bridge-is-subscribed` |

## TODOs

- `// TODO: replace with API call` in setSubscribed  
- `// TODO: hide in production` on SubscriptionToggle  
- Subscribe page: enforcement after backend integration  

## Assumptions

1. Default is **not subscribed** for testing the lock UI.  
2. Toggle is always visible for now (dev).  
3. Menu items always visible; locks happen on the page.  
4. No admin changes.  

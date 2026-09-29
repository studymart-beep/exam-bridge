# Exam Bridge v3 — Admin ↔ Student Coverage Map

## Route parity

| Admin route | Student route | Purpose |
|-------------|---------------|---------|
| `/admin/dashboard` | `/dashboard` | Overview / home |
| `/admin/users` | — | Manage students (admin only) |
| `/admin/users/[userId]` | `/profile` | Student identity (student sees self) |
| `/admin/subjects` | `/subjects` | Subject list |
| `/admin/subjects/[subjectId]/topics` | `/subjects/[slug]` | Topics under a subject |
| `/admin/topics/[topicId]/materials` | `/subjects/[slug]/topics/[topicId]` | Materials (video/PDF/images) |
| `/admin/topics/[topicId]/cbt` | `/cbt/[examId]` via topic “Take CBT” | Topic-level CBT |
| `/admin/subjects/[subjectId]/cbt` | `/subjects/[slug]/general-cbt` → `/cbt/[examId]` | Subject general CBT |
| `/admin/cbt` | `/cbt` | Exam list |
| `/admin/cbt/[examId]` | `/cbt/[examId]` | Exam detail / take exam |
| `/admin/cbt/[examId]/questions` | (same exam questions) | Question bank |
| `/admin/payments` | `/subscribe` | Payment UI shell (not enforced) |
| `/admin/subscriptions` | `/subscribe` | Subscription records / CTA |
| `/admin/notifications` | `/notifications` | Messages |
| `/admin/announcements` | — | Broadcasts (admin only for now) |
| `/admin/reports` | `/results`, `/progress` | Analytics vs personal progress |
| `/admin/settings` | `/subscribe` (price + bank) | Platform config visible as payment details |

## Capability parity

| Admin capability | Student-visible result |
|------------------|------------------------|
| Add/edit subjects | Subjects list & detail |
| Add/edit topics | Topic list under subject |
| Attach materials | Video / PDF / Images tabs on topic |
| Attach topic CBT | “Take CBT” on topic |
| Attach subject general CBT | “Take General CBT” on subject page |
| Edit exam metadata | Timer, pass mark on exam start |
| Add/edit/delete questions | Questions in live CBT |
| Set price + bank details | Shown on `/subscribe` |
| Approve/reject payments | Toast only until backend (Phase 15) |
| Send notifications | Student notifications list |

## Intentionally not gated

- Subscription enforcement is **disabled**
- All content remains accessible regardless of subscription status
- Dashboard shows an info banner when inactive, with CTA to `/subscribe`

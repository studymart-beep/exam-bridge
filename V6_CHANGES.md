# Exam Bridge v6 master changes

## Mock removal
- Deleted entire `src/lib/mock/`
- Removed all `@/lib/mock` imports from student, public, and residual admin components

## New data helpers
- `src/lib/data/student/subjects.ts`
- `src/lib/data/student/materials.ts`
- `src/lib/data/student/cbt.ts`
- `src/lib/data/student/profile.ts`
- `src/lib/data/student/progress.ts`
- `src/lib/data/student/results.ts`
- `src/lib/data/student/notifications.ts`
- `src/lib/data/student/settings.ts`
- `getReceiptSignedUrl` in `src/lib/data/admin/payments.ts`

## Student / public pages rewritten
- Landing, dashboard, subjects, subject detail, topic detail, general-cbt
- CBT list + exam start, results, progress, notifications, profile, settings
- Subscribe page + SubscribeForm (mandatory receipt)

## Components
- ContentLock, SubscriptionBanner, StudentHeader, StudentSidebar, SubjectCard, SubscribeForm
- Neutralized CbtAttachPanel, ExamForm (no mock)

## Actions
- `src/lib/actions/payments.ts` — mandatory receipt upload to Storage + payments insert

## Docs
- REMAINING_WORK.md, SETUP_ADDENDUM.md, V6_CHANGES.md

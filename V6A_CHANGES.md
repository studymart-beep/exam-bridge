# Exam Bridge v6A — Admin CRUD → Supabase

## New files

### Data layer
- src/lib/data/admin/subjects.ts
- src/lib/data/admin/topics.ts
- src/lib/data/admin/materials.ts
- src/lib/data/admin/cbt.ts
- src/lib/data/admin/users.ts
- src/lib/data/admin/payments.ts
- src/lib/data/admin/settings.ts
- src/lib/data/admin/reports.ts

### Server actions
- src/lib/actions/admin/guard.ts
- src/lib/actions/admin/subjects.ts
- src/lib/actions/admin/topics.ts
- src/lib/actions/admin/materials.ts
- src/lib/actions/admin/cbt.ts
- src/lib/actions/admin/questions.ts
- src/lib/actions/admin/payments.ts
- src/lib/actions/admin/users.ts
- src/lib/actions/admin/settings.ts
- src/lib/actions/admin/notifications.ts

### Components
- src/components/admin/UsersClient.tsx
- src/components/admin/UserActions.tsx
- src/components/admin/TopicsManager.tsx
- src/components/admin/MaterialsManager.tsx
- src/components/admin/CbtListActions.tsx
- src/components/admin/ExamEditForm.tsx
- src/components/admin/QuestionsManager.tsx
- src/components/admin/TopicCbtManager.tsx
- src/components/admin/SubjectCbtManager.tsx
- src/components/admin/PaymentActions.tsx
- src/components/admin/SettingsForm.tsx
- src/components/admin/NotificationComposer.tsx

### API
- src/app/api/admin/subjects/route.ts

## Rewritten admin pages (no mock imports)

- src/app/(admin)/admin/dashboard/page.tsx
- src/app/(admin)/admin/users/page.tsx
- src/app/(admin)/admin/users/[userId]/page.tsx
- src/app/(admin)/admin/subjects/page.tsx
- src/app/(admin)/admin/subjects/[subjectId]/topics/page.tsx
- src/app/(admin)/admin/subjects/[subjectId]/cbt/page.tsx
- src/app/(admin)/admin/topics/[topicId]/materials/page.tsx
- src/app/(admin)/admin/topics/[topicId]/cbt/page.tsx
- src/app/(admin)/admin/cbt/page.tsx
- src/app/(admin)/admin/cbt/[examId]/page.tsx
- src/app/(admin)/admin/cbt/[examId]/questions/page.tsx
- src/app/(admin)/admin/payments/page.tsx
- src/app/(admin)/admin/subscriptions/page.tsx
- src/app/(admin)/admin/notifications/page.tsx
- src/app/(admin)/admin/announcements/page.tsx
- src/app/(admin)/admin/reports/page.tsx
- src/app/(admin)/admin/settings/page.tsx

## Assumptions

1. Admin role checked via requireAdmin() on every mutation.
2. Payment approve uses service-role client when available to update other profiles.
3. Empty DB shows friendly empty states.
4. Student side untouched.
5. Mock folder not deleted (still used by student header etc.).

## TODOs

- Signed URL for private receipt files (currently uses stored path/URL)
- Question reorder drag-and-drop
- Full CSV export on reports

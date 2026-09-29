# Admin Phase 2–4 (partial) — Build Notes

## Routes built

| Route | Purpose |
|-------|---------|
| `/admin/users` | Student table, search, status filter |
| `/admin/users/[userId]` | User detail, payments, CBT attempts, suspend/activate/delete |
| `/admin/subjects` | Subject list, add/edit/delete, reorder |
| `/admin/subjects/[subjectId]/topics` | Topics for a subject |
| `/admin/courses` | Course list, subject filter, CRUD |
| `/admin/courses/[courseId]` | Course detail, topic reorder |
| `/admin/cbt` | CBT exam list, create exam |
| `/admin/cbt/[examId]` | Exam detail + stats |
| `/admin/cbt/[examId]/questions` | Question editor + bulk paste import |
| `/admin/reports` | Scores chart, subject performance, CSV export |
| `/admin/notifications` | Composer + sent history |
| `/admin/settings` | Price, duration, pass mark, branding |
| `/admin/subscriptions` | Shell only — actions disabled |
| `/admin/payments` | Shell only — export disabled |
| `/admin/announcements` | List of announcements |

All admin sidebar links now resolve (no 404).

## Components created

### UI primitives (new only)
- `src/components/ui/Select.tsx`
- `src/components/ui/Textarea.tsx`
- `src/components/ui/Tabs.tsx`
- `src/components/ui/Dropdown.tsx`

### Admin
- `ConfirmDialog.tsx`
- `BulkQuestionPaste.tsx` (parse Q/A/B/C/D/Answer/Explanation format)
- `forms/SubjectForm.tsx`
- `forms/CourseForm.tsx`
- `forms/TopicForm.tsx`
- `forms/ExamForm.tsx`
- `forms/QuestionEditor.tsx`

## Mock files added

- `adminSubjects.ts`
- `adminCourses.ts`
- `adminTopics.ts`
- `adminCbtExams.ts`
- `adminCbtQuestions.ts`
- `adminNotificationsSent.ts`
- `adminSettings.ts`

(Existing: adminUsers, adminStats, adminPayments, adminSubscriptions, adminReports)

## Types appended (not modified existing)

AdminSubject, AdminCourse, AdminTopic, AdminCbtExam, AdminCbtQuestion, AdminSentNotification, PlatformSettings

## TODO markers

- All form submits / CRUD: `// TODO: replace with API call`
- Settings save: `// TODO: persist to backend`
- Subscriptions + Payments pages: `// TODO: activate when payment integration is enabled (Phase 15)`
- Notification send: mock toast only

## Assumptions

1. Admin routes live under `/admin/*` (existing shell).
2. No payment gating on student app.
3. Bulk paste supports `Q:`, `A)`, `Answer: B` / `Answer: B)`, `Explanation:` and blank lines between questions.
4. Reorder is client-side state only (mock).
5. Student files and existing admin shell/UI primitives were not modified.

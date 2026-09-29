# Exam Bridge v3 — Courses removed

## Structure change

**Before:** Subject → Course → Topic  
**After:** Subject → Topic (+ optional subject General CBT)

## Deleted

### Routes
- `/admin/courses`, `/admin/courses/[courseId]`, `/admin/courses/[courseId]/cbt`
- `/courses/[courseId]`, `/courses/[courseId]/topics/[topicId]`

### Files
- `src/lib/mock/courses.ts`
- `src/lib/mock/adminCourses.ts`
- `src/lib/mock/adminCourseCbt.ts`
- `src/components/admin/forms/CourseForm.tsx`
- Entire `src/app/(admin)/admin/courses/` tree
- Entire `src/app/(student)/courses/` tree

### Types
- `Course` interface removed
- `AdminCourse` removed
- `CourseCbtLink` replaced by `SubjectCbtLink`

## Added

### Routes
- `/admin/subjects/[subjectId]/cbt` — subject general CBT
- `/subjects/[slug]/topics/[topicId]` — student topic detail (new path)
- `/subjects/[slug]/general-cbt` — redirects to subject general CBT

### Mocks
- `src/lib/mock/adminSubjectCbt.ts`

### Docs
- `COVERAGE_MAP.md`
- `V3_CHANGES.md`

## Modified

| File | Change |
|------|--------|
| `src/types/index.ts` | Topic.subjectId/subjectSlug; Subject.generalCbtId; no Course; AdminCbtExam without course; PlatformSettings bank fields |
| `src/lib/mock/topics.ts` | Linked to subjects |
| `src/lib/mock/subjects.ts` | generalCbtId |
| `src/lib/mock/adminSubjects.ts` | generalCbtId |
| `src/lib/mock/adminTopics.ts` | subjectId only |
| `src/lib/mock/adminCbtExams.ts` | No course fields |
| `src/lib/mock/adminSettings.ts` | Bank name/account |
| `src/lib/mock/user.ts` | continueLearning.subjectSlug |
| `src/lib/mock/cbt.ts` | subjectId instead of courseId |
| `AdminSidebar.tsx` | Removed Courses nav item |
| `ExamForm.tsx` | Subject only (no course) |
| `/admin/cbt` pages | No course columns |
| `/admin/cbt/[examId]` | Full edit panel + delete |
| `/admin/settings` | Bank details section |
| `/admin/payments` | Approve/Reject → info toast |
| `/admin/subjects/.../topics` | CBT links + general CBT link |
| Student subject pages | Topics flat list + general CBT |
| TopicCard / TopicDetailClient | subjectSlug paths |
| Dashboard | Continue learning → subjects path; inactive sub banner |
| Progress | Uses topics by subject |
| SubscribeForm | Settings bank + price; enforcement note |

## TODOs

- All CRUD: `// TODO: replace with API call`
- Settings: `// TODO: persist to backend`
- Payments/subscriptions: Phase 15 activation
- Subscription: `// NOTE: Subscription enforcement is intentionally disabled.`

## Assumptions

1. Student topic paths are under `/subjects/[slug]/topics/[topicId]`
2. General CBT is optional per subject
3. No content gating by subscription in v3

# Admin v2 — Materials & CBT Attachment

## New pages

| Route | File |
|-------|------|
| `/admin/topics/[topicId]/materials` | `src/app/(admin)/admin/topics/[topicId]/materials/page.tsx` |
| `/admin/topics/[topicId]/cbt` | `src/app/(admin)/admin/topics/[topicId]/cbt/page.tsx` |
| `/admin/courses/[courseId]/cbt` | `src/app/(admin)/admin/courses/[courseId]/cbt/page.tsx` |

## New components

- `src/components/admin/MaterialForm.tsx`
- `src/components/admin/MaterialRow.tsx`
- `src/components/admin/VideoIdField.tsx`
- `src/components/admin/UploadPlaceholder.tsx`
- `src/components/admin/CbtAttachPanel.tsx`

## New mock files

- `src/lib/mock/adminMaterials.ts`
- `src/lib/mock/adminTopicCbt.ts`
- `src/lib/mock/adminCourseCbt.ts`

## New types (appended only)

- `MaterialType`, `Material`, `TopicCbtLink`, `CourseCbtLink`

## Existing files edited (ALLOWED EDITS only)

1. `src/app/(admin)/admin/subjects/[subjectId]/topics/page.tsx`  
   → Added “Manage content” link per topic row

2. `src/app/(admin)/admin/courses/[courseId]/page.tsx`  
   → Added “Manage content” per topic + “Manage course CBT” button

3. `src/app/(student)/courses/[courseId]/page.tsx`  
   → Added “Take CBT” per topic when `hasCbt`  
   → Added “Take General CBT” (disabled until all topics complete)

4. `src/app/(student)/courses/[courseId]/topics/[topicId]/page.tsx`  
   → Added “Take CBT” when topic has CBT

## TODO markers

- All material CRUD / CBT attach-detach: `// TODO: replace with API call`
- Upload buttons disabled: “Upload available once backend is connected”
- Create new CBT links to `/admin/cbt?topicId=` or `?courseId=` (no full new-exam flow)

## Assumptions

1. Student topic mock already has `hasCbt` + `cbtId` — used for student buttons.
2. Course general CBT unlock uses `topic.completed` from student mock topics.
3. Create-new CBT does not build a separate form; links to existing `/admin/cbt` list with query hint.
4. No student components other than the two route pages were modified.
5. Admin shell and UI primitives unchanged.

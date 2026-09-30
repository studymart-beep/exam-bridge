# Remaining features completed

## CBT take + score
- Page: `src/app/(student)/cbt/[examId]/take/page.tsx`
- Client: `src/components/student/TakeExamClient.tsx`
- Actions: `src/app/actions/cbt.ts` — `startExam`, `submitExam` (scores via service role / server; options without `is_correct` on client)
- Result: `src/app/(student)/cbt/[examId]/result/[attemptId]/page.tsx` loads attempt + corrections from DB

## Receipt signed URLs
- `getReceiptSignedUrl` in `src/lib/data/admin/payments.ts`
- Used on `/admin/payments`

## Material viewers
- VideoPlayer — Cloudflare Stream embed by ID or URL
- PDFViewer — iframe + open link when URL
- ImageGallery — grid + lightbox
- MaterialsViewer wraps them + mark complete

## Progress
- `src/app/actions/progress.ts` — `markTopicProgress`

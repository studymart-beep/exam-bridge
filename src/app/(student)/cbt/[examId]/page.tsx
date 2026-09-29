import { notFound } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import ContentLock from "@/components/student/ContentLock";
import Card from "@/components/ui/Card";
import { getExamById } from "@/lib/data/cbt";

interface Props {
  params: Promise<{ examId: string }>;
}

export default async function CBTExamPage({ params }: Props) {
  const { examId } = await params;
  const exam = await getExamById(examId);
  if (!exam) notFound();

  return (
    <div>
      <StudentHeader title="CBT Exam" showBack backHref="/cbt" />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        <Card>
          <h2 className="text-xl font-heading font-bold text-text-primary">{exam.title}</h2>
          <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-xs text-text-muted">Questions</dt>
              <dd className="font-medium">{exam.question_count}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Duration</dt>
              <dd className="font-medium">{exam.duration_mins} min</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Pass mark</dt>
              <dd className="font-medium">{exam.pass_mark}%</dd>
            </div>
          </dl>
        </Card>

        <ContentLock label="Subscribe to take this exam.">
          <p className="text-sm text-text-secondary text-center py-6">
            Exam player will load here once questions are available.
            {/* TODO: wire attempt start + CBTExamClient with DB questions */}
          </p>
        </ContentLock>
      </div>
    </div>
  );
}

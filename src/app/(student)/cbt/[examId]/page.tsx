import Link from "next/link";
import { notFound } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import ContentLock from "@/components/student/ContentLock";
import { getExamById } from "@/lib/data/student/cbt";
import { getCurrentProfile } from "@/lib/data/student/profile";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ examId: string }>;
}

export default async function CbtExamPage({ params }: Props) {
  const { examId } = await params;
  const exam = await getExamById(examId);
  if (!exam) notFound();
  const profile = await getCurrentProfile();

  return (
    <div>
      <StudentHeader
        title={exam.title}
        showBack
        backHref="/cbt"
        userName={profile?.full_name || "Student"}
      />
      <div className="px-4 sm:px-6 py-5 max-w-lg mx-auto space-y-4">
        <Card className="space-y-2">
          <p className="text-sm text-text-secondary">
            {exam.question_count} questions · {exam.duration_mins} minutes
          </p>
          <p className="text-sm text-text-secondary">Pass mark: {exam.pass_mark}%</p>
        </Card>
        <ContentLock label="Subscribe to start this exam.">
          <Link
            href={`/cbt/${examId}/take`}
            className="block text-center p-4 rounded-2xl bg-primary text-white font-semibold text-sm"
          >
            Start exam
          </Link>
        </ContentLock>
      </div>
    </div>
  );
}

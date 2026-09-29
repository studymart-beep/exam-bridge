import { notFound } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import CBTExamClient from "@/components/student/CBTExamClient";
import { getCbtById } from "@/lib/mock/cbt";
import PageLock from "@/components/student/PageLock";

interface Props {
  params: Promise<{ examId: string }>;
}

export default async function CBTExamPage({ params }: Props) {
  const { examId } = await params;
  const exam = getCbtById(examId);
  if (!exam) notFound();

  return (
    <div>
      <div className="lg:block">
        <StudentHeader title="CBT Exam" showBack backHref="/cbt" />
      </div>
      <PageLock label="Subscribe to take this exam.">
        <CBTExamClient exam={exam} />
      </PageLock>
    </div>
  );
}

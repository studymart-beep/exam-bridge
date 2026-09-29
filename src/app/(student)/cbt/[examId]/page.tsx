import { notFound } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import CBTExamClient from "@/components/student/CBTExamClient";
import { getCbtById } from "@/lib/mock/cbt";

interface Props {
  params: Promise<{ examId: string }>;
}

export default async function CBTExamPage({ params }: Props) {
  const { examId } = await params;
  const exam = getCbtById(examId);
  if (!exam) notFound();

  return (
    <div>
      {/* Header only shown on start screen; client hides nav during exam */}
      <div className="lg:block">
        <StudentHeader title="CBT Exam" showBack backHref="/cbt" />
      </div>
      <CBTExamClient exam={exam} />
    </div>
  );
}

import StudentHeader from "@/components/student/StudentHeader";
import CBTResultClient from "@/components/student/CBTResultClient";

interface Props {
  params: Promise<{ examId: string; attemptId: string }>;
}

export default async function CBTResultPage({ params }: Props) {
  const { examId, attemptId } = await params;

  return (
    <div>
      <StudentHeader title="CBT Result" showBack backHref="/cbt" />
      <CBTResultClient examId={examId} attemptId={attemptId} />
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import Card from "@/components/ui/Card";
import { adminGetExam } from "@/lib/data/admin/cbt";
import { adminListSubjects } from "@/lib/data/admin/subjects";
import ExamEditForm from "@/components/admin/ExamEditForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ examId: string }>;
}

export default async function AdminCbtDetailPage({ params }: Props) {
  const { examId } = await params;
  const exam = await adminGetExam(examId);
  if (!exam) notFound();
  const subjects = await adminListSubjects();

  return (
    <div>
      <AdminHeader title={exam.title} subtitle="Edit exam" />
      <div className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-4">
        <Link href="/admin/cbt" className="text-sm text-primary hover:underline">
          ← Back to exams
        </Link>
        <Card>
          <ExamEditForm exam={exam} subjects={subjects} />
        </Card>
        <Link
          href={`/admin/cbt/${examId}/questions`}
          className="flex items-center justify-center w-full h-12 rounded-2xl bg-primary text-white font-semibold text-sm"
        >
          Edit questions ({exam.question_count})
        </Link>
      </div>
    </div>
  );
}

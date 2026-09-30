import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { adminGetExam, adminListQuestions } from "@/lib/data/admin/cbt";
import QuestionsManager from "@/components/admin/QuestionsManager";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ examId: string }>;
}

export default async function AdminQuestionsPage({ params }: Props) {
  const { examId } = await params;
  const exam = await adminGetExam(examId);
  if (!exam) notFound();
  const questions = await adminListQuestions(examId);

  return (
    <div>
      <AdminHeader title="Questions" subtitle={exam.title} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">
        <Link href={`/admin/cbt/${examId}`} className="text-sm text-primary hover:underline">
          ← Back to exam
        </Link>
        <QuestionsManager examId={examId} initial={questions} />
      </div>
    </div>
  );
}

import { notFound, redirect } from "next/navigation";
import {
  getExamById,
  listQuestionsForExam,
} from "@/lib/data/student/cbt";
import {
  getCurrentProfile,
  isSubscriptionActive,
} from "@/lib/data/student/profile";
import TakeExamClient from "@/components/student/TakeExamClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ examId: string }>;
}

export default async function TakeExamPage({ params }: Props) {
  const { examId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=/cbt/${examId}/take`);
  if (!isSubscriptionActive(profile)) redirect(`/cbt/${examId}`);

  const exam = await getExamById(examId);
  if (!exam) notFound();

  const questions = await listQuestionsForExam(examId);

  return (
    <TakeExamClient
      exam={{
        id: exam.id,
        title: exam.title,
        duration_mins: exam.duration_mins,
        pass_mark: exam.pass_mark,
        question_count: exam.question_count,
      }}
      questions={questions}
    />
  );
}

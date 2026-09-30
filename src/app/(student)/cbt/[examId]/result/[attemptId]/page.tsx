import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { getCurrentProfile } from "@/lib/data/student/profile";
import { getAttemptById } from "@/lib/data/student/results";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ examId: string; attemptId: string }>;
}

export default async function CBTResultPage({ params }: Props) {
  const { examId, attemptId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const data = await getAttemptById(attemptId, profile.id);
  if (!data || data.attempt.exam_id !== examId) notFound();

  const { attempt, answers, questions } = data;
  const score = attempt.score ?? 0;
  const total = attempt.total ?? (questions.length || 1);
  const pct = Math.round((score / total) * 100);
  const passed = !!attempt.passed;
  const answerMap: Record<string, { optionId: string | null; isCorrect: boolean }> = {};
  answers.forEach(
    (a: {
      question_id: string;
      selected_option_id: string | null;
      is_correct: boolean;
    }) => {
      answerMap[a.question_id] = {
        optionId: a.selected_option_id,
        isCorrect: a.is_correct,
      };
    }
  );

  return (
    <div>
      <StudentHeader
        title="CBT Result"
        showBack
        backHref="/results"
        userName={profile.full_name || "Student"}
      />
      <div className="px-4 sm:px-6 py-5 max-w-lg mx-auto space-y-6">
        <Card className="text-center space-y-3">
          <div
            className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center font-heading font-bold text-2xl ${
              passed ? "bg-green-50 text-success" : "bg-red-50 text-error"
            }`}
          >
            {pct}%
          </div>
          <Badge variant={passed ? "success" : "error"}>
            {passed ? "Passed" : "Failed"}
          </Badge>
          <p className="font-heading font-semibold">
            {(attempt.cbt_exams as { title?: string } | null)?.title || "Exam"}
          </p>
          <p className="text-sm text-text-muted">
            {score} / {total} correct
          </p>
        </Card>

        <div className="space-y-3">
          <h3 className="font-heading font-semibold text-sm">Corrections</h3>
          {questions.map(
            (
              q: {
                id: string;
                question_text: string;
                explanation: string | null;
                options: {
                  id: string;
                  label: string;
                  option_text: string;
                  is_correct: boolean;
                }[];
              },
              i: number
            ) => {
              const ans = answerMap[q.id];
              const correctOpt = q.options.find((o) => o.is_correct);
              const selectedOpt = q.options.find((o) => o.id === ans?.optionId);
              return (
                <Card key={q.id} padding="sm" className="space-y-2">
                  <p className="text-xs text-text-muted">Q{i + 1}</p>
                  <p className="text-sm font-medium">{q.question_text}</p>
                  <p className="text-xs">
                    Your answer:{" "}
                    <span className={ans?.isCorrect ? "text-success" : "text-error"}>
                      {selectedOpt
                        ? `${selectedOpt.label}) ${selectedOpt.option_text}`
                        : "—"}
                    </span>
                  </p>
                  <p className="text-xs text-success">
                    Correct:{" "}
                    {correctOpt
                      ? `${correctOpt.label}) ${correctOpt.option_text}`
                      : "—"}
                  </p>
                  {q.explanation && (
                    <p className="text-xs text-text-muted">{q.explanation}</p>
                  )}
                </Card>
              );
            }
          )}
        </div>

        <div className="flex gap-3 pb-4">
          <Link href={`/cbt/${examId}`} className="flex-1">
            <Button variant="outline" fullWidth>
              Retake
            </Button>
          </Link>
          <Link href="/cbt" className="flex-1">
            <Button fullWidth>CBT list</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

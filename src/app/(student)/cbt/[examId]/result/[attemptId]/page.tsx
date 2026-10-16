import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import { getCurrentProfile } from "@/lib/data/student/profile";
import { getAttemptById } from "@/lib/data/student/results";
import { cn } from "@/lib/utils";

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
  const incorrect = total - score;

  const answerMap: Record<
    string,
    { optionId: string | null; isCorrect: boolean }
  > = {};
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

  const ringColor = passed
    ? "stroke-success"
    : pct >= 40
      ? "stroke-warning"
      : "stroke-error";
  const ringBg = passed
    ? "from-primary-light to-accent-light"
    : pct >= 40
      ? "from-accent-light to-cream"
      : "from-red-50 to-cream";

  const circumference = 2 * Math.PI * 54;
  const dash = (pct / 100) * circumference;

  return (
    <div>
      <StudentHeader
        title="CBT Result"
        showBack
        backHref="/results"
        userName={profile.full_name || "Student"}
      />
      <div className="px-4 sm:px-6 py-5 max-w-lg mx-auto space-y-4">
        <Section
          tint={passed ? "green" : "gold"}
          className={cn("text-center", passed && "animate-pass-pop")}
        >
          <div
            className={cn(
              "relative mx-auto w-36 h-36 rounded-full bg-gradient-to-br flex items-center justify-center",
              ringBg
            )}
          >
            <svg
              className="absolute inset-0 -rotate-90"
              viewBox="0 0 120 120"
              aria-hidden
            >
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                className={ringColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference}`}
              />
            </svg>
            <span className="relative font-heading font-extrabold text-3xl text-text-primary">
              {pct}%
            </span>
          </div>
          <div className="mt-4">
            <Badge variant={passed ? "success" : "error"}>
              {passed ? "Passed" : "Not Passed"}
            </Badge>
          </div>
          <p className="mt-3 font-heading font-bold text-lg">
            {(attempt.cbt_exams as { title?: string } | null)?.title || "Exam"}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-white/70 border border-border/50 p-2">
              <p className="text-xs text-text-muted">Correct</p>
              <p className="font-heading font-bold text-success">{score}</p>
            </div>
            <div className="rounded-xl bg-white/70 border border-border/50 p-2">
              <p className="text-xs text-text-muted">Wrong</p>
              <p className="font-heading font-bold text-error">{incorrect}</p>
            </div>
            <div className="rounded-xl bg-white/70 border border-border/50 p-2">
              <p className="text-xs text-text-muted">Total</p>
              <p className="font-heading font-bold text-text-primary">{total}</p>
            </div>
          </div>
        </Section>

        <Section title="Corrections" tint="blue">
          <div className="space-y-2.5">
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
                const selectedOpt = q.options.find(
                  (o) => o.id === ans?.optionId
                );
                const ok = !!ans?.isCorrect;
                return (
                  <div
                    key={q.id}
                    className={cn(
                      "rounded-2xl border bg-white/80 p-3.5 space-y-1.5 shadow-soft",
                      ok
                        ? "border-l-4 border-l-success border-border-green"
                        : "border-l-4 border-l-error border-red-100"
                    )}
                  >
                    <p className="text-[11px] font-semibold text-text-muted">
                      Q{i + 1}
                    </p>
                    <p className="text-sm font-medium text-text-primary">
                      {q.question_text}
                    </p>
                    <p className="text-xs">
                      Your answer:{" "}
                      <span className={ok ? "text-success" : "text-error"}>
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
                      <p className="text-xs text-text-muted pt-1 border-t border-border/40">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </Section>

        <div className="flex gap-3 pb-4">
          <Link href={`/cbt/${examId}`} className="flex-1">
            <Button variant="outline" fullWidth>
              Retake Exam
            </Button>
          </Link>
          <Link href="/cbt" className="flex-1">
            <Button fullWidth>Back to CBT</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

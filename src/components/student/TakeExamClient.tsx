"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { startExam, submitExam } from "@/app/actions/cbt";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export type TakeQuestion = {
  id: string;
  question_text: string;
  order_index: number;
  options: { id: string; label: string; option_text: string }[];
};

export type TakeExam = {
  id: string;
  title: string;
  duration_mins: number;
  pass_mark: number;
  question_count: number;
};

export default function TakeExamClient({
  exam,
  questions,
}: {
  exam: TakeExam;
  questions: TakeQuestion[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  // questionId -> optionId
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [secondsLeft, setSecondsLeft] = useState(exam.duration_mins * 60);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalSeconds = exam.duration_mins * 60;
  const current = questions[currentIndex];
  const answeredCount = Object.values(answers).filter(Boolean).length;

  const doSubmit = useCallback(async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    const payload = questions.map((q) => ({
      questionId: q.id,
      optionId: answers[q.id] || "",
    }));
    const res = await submitExam(attemptId, payload);
    if (res.error) {
      showToast(res.error, "error");
      setSubmitting(false);
      return;
    }
    router.push(`/cbt/${exam.id}/result/${attemptId}`);
  }, [attemptId, answers, exam.id, questions, router, showToast, submitting]);

  useEffect(() => {
    if (!started) return;
    if (secondsLeft <= 0) {
      void doSubmit();
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [started, secondsLeft, doSubmit]);

  function handleStart() {
    startTransition(async () => {
      const res = await startExam(exam.id);
      if (res.error || !res.attemptId) {
        showToast(res.error || "Could not start exam", "error");
        return;
      }
      setAttemptId(res.attemptId);
      setStarted(true);
    });
  }

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  if (!started) {
    return (
      <div className="px-4 sm:px-6 py-8 max-w-lg mx-auto space-y-6 text-center">
        <h2 className="font-heading text-xl font-bold text-text-primary">{exam.title}</h2>
        <p className="text-sm text-text-secondary">
          {questions.length} questions · {exam.duration_mins} minutes · Pass mark{" "}
          {exam.pass_mark}%
        </p>
        <ul className="text-left text-sm text-text-secondary space-y-2 bg-white rounded-2xl border border-border p-4">
          <li>• Answer all questions before time runs out</li>
          <li>• You can navigate between questions freely</li>
          <li>• Submitting ends the exam immediately</li>
        </ul>
        <Button fullWidth loading={pending} onClick={handleStart} disabled={!questions.length}>
          {questions.length ? "Start exam" : "No questions available"}
        </Button>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="p-8 text-center text-sm text-text-muted">No questions.</div>
    );
  }

  const sortedOpts = [...current.options].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="sticky top-0 z-20 bg-white border-b border-border px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-text-primary">
          Q{currentIndex + 1}/{questions.length}
        </span>
        <span
          className={cn(
            "font-mono text-sm font-bold tabular-nums",
            secondsLeft < 60 ? "text-error" : "text-primary"
          )}
        >
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
        <span className="text-xs text-text-muted">
          {answeredCount}/{questions.length} answered
        </span>
      </div>

      <div className="flex-1 px-4 sm:px-6 py-5 max-w-lg mx-auto w-full space-y-5">
        <div>
          <p className="text-sm text-text-muted mb-2">Question {currentIndex + 1}</p>
          <h2 className="text-lg font-heading font-semibold text-text-primary leading-snug">
            {current.question_text}
          </h2>
        </div>
        <div className="space-y-3">
          {sortedOpts.map((opt) => {
            const selected = answers[current.id] === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [current.id]: opt.id }))
                }
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
                  selected
                    ? "border-primary bg-primary-light"
                    : "border-border bg-white hover:border-border"
                )}
              >
                <span className="w-8 h-8 rounded-lg bg-primary-light/40 flex items-center justify-center text-sm font-bold text-text-secondary">
                  {opt.label}
                </span>
                <span className="text-sm text-text-primary">{opt.option_text}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-2 max-w-lg mx-auto w-full">
        <Button
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
        >
          Prev
        </Button>
        {currentIndex < questions.length - 1 ? (
          <Button
            className="flex-1"
            onClick={() =>
              setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
            }
          >
            Next
          </Button>
        ) : (
          <Button className="flex-1" onClick={() => setSubmitOpen(true)}>
            Submit
          </Button>
        )}
      </div>

      {/* Navigator dots */}
      <div className="px-4 pb-4 max-w-lg mx-auto w-full flex flex-wrap gap-1.5 justify-center">
        {questions.map((q, i) => (
          <button
            key={q.id}
            type="button"
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "w-8 h-8 rounded-lg text-xs font-medium",
              i === currentIndex
                ? "bg-primary text-white"
                : answers[q.id]
                  ? "bg-green-50 text-success"
                  : "bg-primary-light text-text-muted"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <Modal open={submitOpen} onClose={() => setSubmitOpen(false)} title="Submit exam?">
        <p className="text-sm text-text-secondary mb-4">
          You answered {answeredCount} of {questions.length} questions. You cannot change
          answers after submitting.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setSubmitOpen(false)}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            loading={submitting}
            onClick={() => {
              setSubmitOpen(false);
              void doSubmit();
            }}
          >
            Submit
          </Button>
        </div>
      </Modal>
    </div>
  );
}

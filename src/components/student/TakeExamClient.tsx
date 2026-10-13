"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
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
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [secondsLeft, setSecondsLeft] = useState(exam.duration_mins * 60);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [timeUpOpen, setTimeUpOpen] = useState(false);
  const [autoCountdown, setAutoCountdown] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);
  const timeUpShownRef = useRef(false);

  const current = questions[currentIndex];
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const unanswered = questions.length - answeredCount;

  const doSubmit = useCallback(async () => {
    if (!attemptId || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setSubmitOpen(false);
    setTimeUpOpen(false);
    const payload = questions.map((q) => ({
      questionId: q.id,
      optionId: answers[q.id] || "",
    }));
    const res = await submitExam(attemptId, payload);
    if (res.error) {
      showToast(res.error, "error");
      submittedRef.current = false;
      setSubmitting(false);
      return;
    }
    router.push(`/cbt/${exam.id}/result/${attemptId}`);
  }, [attemptId, answers, exam.id, questions, router, showToast]);

  // Exam countdown
  useEffect(() => {
    if (!started || submittedRef.current) return;
    if (secondsLeft <= 0) {
      if (!timeUpShownRef.current) {
        timeUpShownRef.current = true;
        setTimeUpOpen(true);
        setAutoCountdown(10);
      }
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [started, secondsLeft]);

  // 10s auto-submit after time up
  useEffect(() => {
    if (!timeUpOpen || submittedRef.current) return;
    if (autoCountdown <= 0) {
      void doSubmit();
      return;
    }
    const t = setTimeout(() => setAutoCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [timeUpOpen, autoCountdown, doSubmit]);

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

  const mins = Math.floor(Math.max(0, secondsLeft) / 60);
  const secs = Math.max(0, secondsLeft) % 60;
  const locked = submitting || submittedRef.current;

  if (!started) {
    return (
      <div className="px-4 sm:px-6 py-8 max-w-lg mx-auto space-y-6 text-center">
        <h2 className="font-heading text-xl font-bold text-text-primary">
          {exam.title}
        </h2>
        <p className="text-sm text-text-secondary">
          {questions.length} questions · {exam.duration_mins} minutes · Pass
          mark {exam.pass_mark}%
        </p>
        <ul className="text-left text-sm text-text-secondary space-y-2 rounded-2xl border border-border-green bg-primary-light p-4">
          <li>• Answer all questions before time runs out</li>
          <li>• You can navigate between questions freely</li>
          <li>• Use Submit Exam at any time — or it auto-submits when time ends</li>
        </ul>
        <Button
          fullWidth
          loading={pending}
          onClick={handleStart}
          disabled={!questions.length}
        >
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
    <div className="min-h-[100dvh] flex flex-col bg-background pb-28">
      <div className="sticky top-0 z-20 bg-primary-light/95 backdrop-blur border-b border-border-green px-4 py-3 flex items-center justify-between gap-3">
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

      <div className="flex-1 px-4 sm:px-6 py-5 max-w-lg mx-auto w-full space-y-4">
        <p className="text-base font-medium text-text-primary leading-relaxed">
          {current.question_text}
        </p>
        <div className="space-y-2">
          {sortedOpts.map((opt, oi) => {
            const selected = answers[current.id] === opt.id;
            const tint =
              oi % 3 === 0
                ? "bg-primary-light border-border-green"
                : oi % 3 === 1
                  ? "bg-accent-light border-border"
                  : "bg-calm-light border-border-blue";
            return (
              <button
                key={opt.id}
                type="button"
                disabled={locked}
                onClick={() =>
                  setAnswers((a) => ({ ...a, [current.id]: opt.id }))
                }
                className={cn(
                  "w-full text-left rounded-2xl border p-3 flex items-start gap-3 transition min-h-[52px]",
                  selected
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                    : tint,
                  locked && "opacity-60 pointer-events-none"
                )}
              >
                <span className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center text-sm font-bold text-text-secondary shrink-0">
                  {opt.label}
                </span>
                <span className="text-sm text-text-primary pt-1">
                  {opt.option_text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigator */}
      <div className="px-4 pb-2 max-w-lg mx-auto w-full flex flex-wrap gap-1.5 justify-center">
        {questions.map((q, i) => (
          <button
            key={q.id}
            type="button"
            disabled={locked}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "w-8 h-8 rounded-lg text-xs font-medium",
              i === currentIndex
                ? "bg-primary text-white"
                : answers[q.id]
                  ? "bg-green-100 text-success"
                  : "bg-accent-light text-text-muted"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Fixed bottom: Prev / Next / Submit Exam */}
      <div className="fixed bottom-0 inset-x-0 z-30 border-t border-border-green bg-primary-light/95 backdrop-blur p-3 safe-bottom">
        <div className="max-w-lg mx-auto flex gap-2">
          <Button
            variant="outline"
            disabled={locked || currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          >
            Prev
          </Button>
          {currentIndex < questions.length - 1 ? (
            <Button
              variant="outline"
              className="flex-1"
              disabled={locked}
              onClick={() =>
                setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
              }
            >
              Next
            </Button>
          ) : (
            <div className="flex-1" />
          )}
          <Button
            className="flex-1 min-w-[7.5rem]"
            disabled={locked}
            loading={submitting}
            onClick={() => setSubmitOpen(true)}
          >
            Submit Exam
          </Button>
        </div>
      </div>

      {/* Manual submit confirm */}
      <Modal
        open={submitOpen && !submitting}
        onClose={() => setSubmitOpen(false)}
        title="Submit exam?"
      >
        <p className="text-sm text-text-secondary mb-4">
          You have {unanswered} unanswered question
          {unanswered === 1 ? "" : "s"}. Are you sure you want to submit now?
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setSubmitOpen(false)}
          >
            Keep Writing
          </Button>
          <Button
            className="flex-1"
            loading={submitting}
            onClick={() => void doSubmit()}
          >
            Submit
          </Button>
        </div>
      </Modal>

      {/* Time up → auto submit */}
      <Modal
        open={timeUpOpen && !submitting}
        onClose={() => {}}
        title="Time is up!"
      >
        <p className="text-sm text-text-secondary mb-2">
          Your exam will be submitted automatically in{" "}
          <span className="font-bold text-primary text-lg tabular-nums">
            {autoCountdown}
          </span>{" "}
          second{autoCountdown === 1 ? "" : "s"}.
        </p>
        <p className="text-xs text-text-muted mb-4">
          You answered {answeredCount} of {questions.length} questions.
        </p>
        <Button fullWidth loading={submitting} onClick={() => void doSubmit()}>
          Submit Now
        </Button>
      </Modal>
    </div>
  );
}

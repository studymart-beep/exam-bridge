"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { CBTExam } from "@/types";
import Button from "@/components/ui/Button";
import QuestionCard from "@/components/student/QuestionCard";
import QuestionNavigator from "@/components/student/QuestionNavigator";
import CBTTimer from "@/components/student/CBTTimer";
import Modal from "@/components/ui/Modal";

interface CBTExamClientProps {
  exam: CBTExam;
}

export default function CBTExamClient({ exam }: CBTExamClientProps) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D" | null>>({});
  const [secondsLeft, setSecondsLeft] = useState(exam.durationMinutes * 60);
  const [navOpen, setNavOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const totalSeconds = exam.durationMinutes * 60;
  const questionIds = exam.questions.map((q) => q.id);
  const currentQuestion = exam.questions[currentIndex];
  const answeredCount = Object.values(answers).filter((a) => a != null).length;

  const handleSubmit = useCallback(() => {
    // Score
    let correct = 0;
    exam.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    const score = Math.round((correct / exam.questions.length) * 100);
    const timeUsed = totalSeconds - secondsLeft;
    const attemptId = `attempt-${Date.now()}`;

    // Store result in sessionStorage for the result page
    const result = {
      id: attemptId,
      examId: exam.id,
      examTitle: exam.title,
      subjectName: exam.subjectName,
      score,
      totalQuestions: exam.questions.length,
      correctCount: correct,
      passed: score >= exam.passMark,
      timeUsedSeconds: timeUsed,
      completedAt: new Date().toISOString(),
      answers,
      questions: exam.questions,
    };
    sessionStorage.setItem(`cbt-result-${attemptId}`, JSON.stringify(result));
    router.push(`/cbt/${exam.id}/result/${attemptId}`);
  }, [answers, exam, router, secondsLeft, totalSeconds]);

  // Timer
  useEffect(() => {
    if (!started) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [started, secondsLeft, handleSubmit]);

  const handleSelect = (answer: "A" | "B" | "C" | "D") => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  // Start screen
  if (!started) {
    return (
      <div className="px-4 sm:px-6 py-8 max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-light flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h2 className="text-xl font-heading font-bold text-text-primary">
            {exam.title}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">{exam.subjectName}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Questions", value: exam.questionCount },
            { label: "Duration", value: `${exam.durationMinutes} min` },
            { label: "Pass Mark", value: `${exam.passMark}%` },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-soft"
            >
              <p className="text-lg font-heading font-bold text-text-primary">
                {s.value}
              </p>
              <p className="text-xs text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
          <h3 className="font-heading font-semibold text-text-primary mb-3">
            Instructions
          </h3>
          <ul className="space-y-2">
            {exam.instructions.map((inst, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {inst}
              </li>
            ))}
          </ul>
        </div>

        <Button fullWidth size="lg" onClick={() => setStarted(true)}>
          Start Exam
        </Button>
      </div>
    );
  }

  // Exam in progress
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <CBTTimer secondsLeft={secondsLeft} totalSeconds={totalSeconds} />
        <span className="text-sm font-medium text-text-secondary">
          Question {currentIndex + 1} of {exam.questions.length}
        </span>
      </div>

      {/* Question */}
      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          selectedAnswer={answers[currentQuestion.id] ?? null}
          onSelect={handleSelect}
        />
      </div>

      {/* Bottom actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 safe-bottom space-y-3">
        <div className="flex gap-3">
          <Button
            variant="outline"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
            className="flex-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>
          {currentIndex < exam.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="flex-1"
            >
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          ) : (
            <Button
              onClick={() => setSubmitOpen(true)}
              className="flex-1"
            >
              Submit Exam
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSubmitOpen(true)}
            className="text-sm text-primary font-medium flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Submit Exam
          </button>
          <button
            onClick={() => setNavOpen(true)}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-soft"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <QuestionNavigator
        total={exam.questions.length}
        current={currentIndex}
        answers={answers}
        questionIds={questionIds}
        onSelect={setCurrentIndex}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />

      <Modal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        title="Submit Exam?"
        footer={
          <>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          You have answered {answeredCount} of {exam.questions.length} questions.
          {answeredCount < exam.questions.length && (
            <span className="block mt-1 text-warning">
              {exam.questions.length - answeredCount} unanswered question(s) will be marked incorrect.
            </span>
          )}
        </p>
      </Modal>
    </div>
  );
}

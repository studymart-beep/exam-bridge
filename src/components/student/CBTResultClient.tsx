"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ResultSummary from "@/components/student/ResultSummary";
import CorrectionCard from "@/components/student/CorrectionCard";
import type { CBTQuestion } from "@/types";

interface ResultData {
  id: string;
  examId: string;
  examTitle: string;
  subjectName: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  passed: boolean;
  timeUsedSeconds: number;
  answers: Record<string, "A" | "B" | "C" | "D" | null>;
  questions: CBTQuestion[];
}

interface CBTResultClientProps {
  examId: string;
  attemptId: string;
}

export default function CBTResultClient({
  examId,
  attemptId,
}: CBTResultClientProps) {
  const [result, setResult] = useState<ResultData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`cbt-result-${attemptId}`);
    if (raw) {
      setResult(JSON.parse(raw));
    }
  }, [attemptId]);

  if (!result) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-text-muted text-sm">Loading result...</p>
        <Link href="/cbt" className="mt-4 inline-block text-primary text-sm hover:underline">
          Back to CBT list
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-5 max-w-lg mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6">
        <ResultSummary
          score={result.score}
          passed={result.passed}
          timeUsedSeconds={result.timeUsedSeconds}
          totalQuestions={result.totalQuestions}
          correctCount={result.correctCount}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-text-primary">
            Question Corrections
          </h3>
          <span className="text-xs text-success flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Review your answers
          </span>
        </div>
        <div className="space-y-3">
          {result.questions.map((q, i) => (
            <CorrectionCard
              key={q.id}
              question={q}
              questionNumber={i + 1}
              userAnswer={result.answers[q.id] ?? null}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pb-4">
        <Link href={`/cbt/${examId}`} className="flex-1">
          <Button variant="outline" fullWidth>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retake Exam
          </Button>
        </Link>
        <Link href="/cbt" className="flex-1">
          <Button fullWidth>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
            </svg>
            Back to CBT
          </Button>
        </Link>
      </div>
    </div>
  );
}

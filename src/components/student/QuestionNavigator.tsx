"use client";

import { cn } from "@/lib/utils";

interface QuestionNavigatorProps {
  total: number;
  current: number;
  answers: Record<string, "A" | "B" | "C" | "D" | null>;
  questionIds: string[];
  onSelect: (index: number) => void;
  open: boolean;
  onClose: () => void;
}

export default function QuestionNavigator({
  total,
  current,
  answers,
  questionIds,
  onSelect,
  open,
  onClose,
}: QuestionNavigatorProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full bg-white rounded-t-2xl p-5 max-h-[60vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-text-primary">
            Question Navigator
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
          {Array.from({ length: total }, (_, i) => {
            const qId = questionIds[i];
            const answered = answers[qId] != null;
            const isCurrent = i === current;

            return (
              <button
                key={i}
                onClick={() => {
                  onSelect(i);
                  onClose();
                }}
                className={cn(
                  "w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-150",
                  isCurrent
                    ? "bg-primary text-white ring-2 ring-primary ring-offset-2"
                    : answered
                    ? "bg-primary-light text-primary"
                    : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-primary" /> Current
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-primary-light" /> Answered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-100" /> Unanswered
          </span>
        </div>
      </div>
    </div>
  );
}

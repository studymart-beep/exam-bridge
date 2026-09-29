"use client";

import { cn } from "@/lib/utils";
import type { CBTQuestion } from "@/types";

interface QuestionCardProps {
  question: CBTQuestion;
  questionNumber: number;
  selectedAnswer: "A" | "B" | "C" | "D" | null;
  onSelect: (answer: "A" | "B" | "C" | "D") => void;
}

const optionKeys = ["A", "B", "C", "D"] as const;

export default function QuestionCard({
  question,
  questionNumber,
  selectedAnswer,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-muted mb-2">
          Question {questionNumber}
        </p>
        <h2 className="text-lg font-heading font-semibold text-text-primary leading-snug">
          {question.question}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Choose the correct answer.
        </p>
      </div>

      <div className="space-y-3">
        {optionKeys.map((key) => {
          const isSelected = selectedAnswer === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150",
                isSelected
                  ? "border-primary bg-primary-light"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-text-secondary"
                )}
              >
                {key}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-primary" : "text-text-primary"
                )}
              >
                {question.options[key]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

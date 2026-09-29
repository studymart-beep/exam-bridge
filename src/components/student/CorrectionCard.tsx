import type { CBTQuestion } from "@/types";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface CorrectionCardProps {
  question: CBTQuestion;
  questionNumber: number;
  userAnswer: "A" | "B" | "C" | "D" | null;
}

export default function CorrectionCard({
  question,
  questionNumber,
  userAnswer,
}: CorrectionCardProps) {
  const isCorrect = userAnswer === question.correctAnswer;

  return (
    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-soft space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-text-primary leading-snug">
          {questionNumber}. {question.question}
        </h4>
        <Badge variant={isCorrect ? "success" : "error"}>
          {isCorrect ? "Correct" : "Incorrect"}
        </Badge>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-text-muted">Your Answer</span>
          {userAnswer ? (
            <span
              className={cn(
                "font-medium flex items-center gap-1",
                isCorrect ? "text-success" : "text-error"
              )}
            >
              {isCorrect ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {userAnswer}. {question.options[userAnswer]}
            </span>
          ) : (
            <span className="text-text-muted italic">Not answered</span>
          )}
        </div>
        {!isCorrect && (
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Correct Answer</span>
            <span className="font-medium text-success flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {question.correctAnswer}. {question.options[question.correctAnswer]}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl text-xs text-text-secondary">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {question.explanation}
      </div>
    </div>
  );
}

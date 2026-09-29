import Badge from "@/components/ui/Badge";
import { formatTime } from "@/lib/utils";

interface ResultSummaryProps {
  score: number;
  passed: boolean;
  timeUsedSeconds: number;
  totalQuestions: number;
  correctCount: number;
}

export default function ResultSummary({
  score,
  passed,
  timeUsedSeconds,
  totalQuestions,
  correctCount,
}: ResultSummaryProps) {
  return (
    <div className="text-center space-y-4">
      <div>
        <p className="text-sm text-text-secondary mb-1">CBT Result</p>
        <p className="text-xs text-text-muted">Computer-Based Test</p>
      </div>

      <div className="text-5xl font-heading font-bold text-success">
        {score}%
      </div>

      <Badge variant={passed ? "success" : "error"} size="md">
        {passed ? (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            PASS
          </span>
        ) : (
          "FAIL"
        )}
      </Badge>

      <div className="flex items-center justify-center gap-6 pt-2">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-xs text-text-muted">Time Used</p>
            <p className="font-semibold text-text-primary">{formatTime(timeUsedSeconds)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-xs text-text-muted">Questions</p>
            <p className="font-semibold text-text-primary">
              {correctCount}/{totalQuestions}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

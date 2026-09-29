import Link from "next/link";
import StudentHeader from "@/components/student/StudentHeader";
import Badge from "@/components/ui/Badge";
import { pastResults } from "@/lib/mock/results";
import { formatDate } from "@/lib/utils";

export default function ResultsPage() {
  return (
    <div>
      <StudentHeader title="Results" />

      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        <div>
          <h2 className="text-xl font-heading font-bold text-text-primary">
            Past Results
          </h2>
          <p className="text-sm text-text-secondary">
            Your CBT attempt history
          </p>
        </div>

        <div className="space-y-3">
          {pastResults.map((result) => (
            <div
              key={result.id}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-soft"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center font-heading font-bold text-lg ${
                  result.passed
                    ? "bg-green-50 text-success"
                    : "bg-red-50 text-error"
                }`}
              >
                {result.score}%
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading font-semibold text-text-primary truncate">
                  {result.examTitle}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {result.subjectName} · {formatDate(result.completedAt)}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge variant={result.passed ? "success" : "error"}>
                    {result.passed ? "Pass" : "Fail"}
                  </Badge>
                  <span className="text-xs text-text-muted">
                    {result.correctCount}/{result.totalQuestions} correct
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {pastResults.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted text-sm">No results yet. Take a CBT to get started!</p>
            <Link href="/cbt" className="mt-3 inline-block text-primary text-sm font-medium hover:underline">
              Go to CBT Practice
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

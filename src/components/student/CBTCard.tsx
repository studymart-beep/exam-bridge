import Link from "next/link";
import type { CBTExam } from "@/types";
import Badge from "@/components/ui/Badge";

interface CBTCardProps {
  exam: CBTExam;
}

export default function CBTCard({ exam }: CBTCardProps) {
  const statusVariant =
    exam.status === "completed"
      ? "success"
      : exam.status === "in_progress"
      ? "warning"
      : "default";

  const statusLabel =
    exam.status === "completed"
      ? "Completed"
      : exam.status === "in_progress"
      ? "In Progress"
      : "Not Started";

  return (
    <Link
      href={`/cbt/${exam.id}`}
      className="block p-4 bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-card hover:border-gray-200 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading font-semibold text-text-primary">
            {exam.title}
          </h3>
          <p className="mt-1 text-sm text-text-secondary">{exam.subjectName}</p>
        </div>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {exam.questionCount} questions
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {exam.durationMinutes} min
        </span>
        <span>Pass: {exam.passMark}%</span>
      </div>
    </Link>
  );
}

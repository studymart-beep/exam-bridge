import Link from "next/link";
import { cn } from "@/lib/utils";

export type ExamCardData = {
  id: string;
  title: string;
  question_count: number;
  duration_mins?: number | null;
  pass_mark?: number | null;
};

const gradients = [
  "from-accent-light via-[#FEF3C7] to-primary-light/40",
  "from-calm-light via-[#EFF6FF] to-accent-light/50",
  "from-primary-light via-primary-soft/70 to-accent-light/40",
];

export default function ExamCard({
  exam,
  index = 0,
  href,
}: {
  exam: ExamCardData;
  index?: number;
  href?: string;
}) {
  const i = ((index % 3) + 3) % 3;
  return (
    <Link
      href={href || `/cbt/${exam.id}`}
      className={cn(
        "card-gloss block p-5 rounded-[20px] border border-white/50",
        "bg-gradient-to-br shadow-[0_6px_20px_-6px_rgba(22,101,52,0.1)]",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(22,101,52,0.16)]",
        gradients[i]
      )}
    >
      <div className="relative z-10 flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-secondary/90 text-text-primary flex items-center justify-center font-heading font-extrabold text-sm shrink-0 shadow-soft">
          CBT
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading font-bold text-base text-text-primary">
            {exam.title}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {exam.question_count} question{exam.question_count === 1 ? "" : "s"}
            {exam.duration_mins != null ? ` · ${exam.duration_mins} min` : ""}
            {exam.pass_mark != null ? ` · Pass ${exam.pass_mark}%` : ""}
          </p>
        </div>
        <span className="text-text-muted shrink-0">→</span>
      </div>
    </Link>
  );
}

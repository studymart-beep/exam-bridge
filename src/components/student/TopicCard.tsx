import Link from "next/link";
import type { Topic } from "@/types";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface TopicCardProps {
  topic: Topic;
  subjectSlug: string;
  index?: number;
}

const gradients = [
  "from-primary-light to-cream",
  "from-accent-light to-cream",
  "from-calm-light to-cream",
];

export default function TopicCard({
  topic,
  subjectSlug,
  index = 0,
}: TopicCardProps) {
  const i = ((index % 3) + 3) % 3;

  return (
    <Link
      href={`/subjects/${subjectSlug}/topics/${topic.id}`}
      className={cn(
        "card-gloss block p-4 sm:p-5 rounded-[20px] border border-white/50",
        "bg-gradient-to-br shadow-[0_6px_20px_-6px_rgba(22,101,52,0.1)]",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(22,101,52,0.16)]",
        gradients[i]
      )}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading font-bold text-base text-text-primary">
            {topic.title}
          </h3>
          <p className="mt-1 text-sm text-text-secondary line-clamp-2">
            {topic.description}
          </p>
        </div>
        {topic.completed && <Badge variant="success">Done</Badge>}
      </div>
      <div className="relative z-10 mt-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
        {topic.duration && (
          <span className="px-2 py-0.5 rounded-full bg-white/70 border border-border/50">
            {topic.duration}
          </span>
        )}
        {topic.hasVideo && (
          <span className="px-2 py-0.5 rounded-full bg-white/70 border border-border/50">
            Video
          </span>
        )}
        {topic.hasPdf && (
          <span className="px-2 py-0.5 rounded-full bg-white/70 border border-border/50">
            PDF
          </span>
        )}
        {topic.hasCbt && (
          <span className="px-2 py-0.5 rounded-full bg-white/70 border border-border/50">
            CBT
          </span>
        )}
      </div>
      <div className="relative z-10 mt-3">
        <ProgressBar value={topic.progress} size="sm" showLabel />
      </div>
    </Link>
  );
}

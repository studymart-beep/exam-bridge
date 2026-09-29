import Link from "next/link";
import type { Topic } from "@/types";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";

interface TopicCardProps {
  topic: Topic;
  subjectSlug: string;
}

export default function TopicCard({ topic, subjectSlug }: TopicCardProps) {
  return (
    <Link
      href={`/subjects/${subjectSlug}/topics/${topic.id}`}
      className="block p-4 bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-card hover:border-gray-200 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading font-semibold text-text-primary">
            {topic.title}
          </h3>
          <p className="mt-1 text-sm text-text-secondary line-clamp-2">
            {topic.description}
          </p>
        </div>
        {topic.completed && <Badge variant="success">Done</Badge>}
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
        <span>{topic.duration}</span>
        {topic.hasVideo && <span>Video</span>}
        {topic.hasPdf && <span>PDF</span>}
        {topic.hasCbt && <span>CBT</span>}
      </div>
      <div className="mt-3">
        <ProgressBar value={topic.progress} size="sm" showLabel />
      </div>
    </Link>
  );
}

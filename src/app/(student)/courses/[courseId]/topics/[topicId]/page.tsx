import Link from "next/link";
import { notFound } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import ProgressBar from "@/components/ui/ProgressBar";
import TopicDetailClient from "@/components/student/TopicDetailClient";
import { getTopicById } from "@/lib/mock/topics";
import { getCourseById } from "@/lib/mock/courses";

interface Props {
  params: Promise<{ courseId: string; topicId: string }>;
}

export default async function TopicDetailPage({ params }: Props) {
  const { courseId, topicId } = await params;
  const topic = getTopicById(topicId);
  if (!topic) notFound();

  const course = getCourseById(courseId);

  return (
    <div>
      <StudentHeader
        title={topic.title}
        showBack
        backHref={`/courses/${courseId}`}
      />

      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        <div>
          <p className="text-sm text-text-muted">
            {course?.title} · {topic.duration}
          </p>
          <h2 className="text-xl font-heading font-bold text-text-primary mt-1">
            {topic.title}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {topic.description}
          </p>
          <div className="mt-3">
            <ProgressBar value={topic.progress} size="sm" showLabel />
          </div>
        </div>

        <TopicDetailClient topic={topic} courseId={courseId} />

        {topic.hasCbt && topic.cbtId && (
          <Link
            href={`/cbt/${topic.cbtId}`}
            className="flex items-center justify-center w-full h-12 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors"
          >
            Take CBT
          </Link>
        )}
      </div>
    </div>
  );
}

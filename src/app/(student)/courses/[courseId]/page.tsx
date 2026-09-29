import Link from "next/link";
import { notFound } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import TopicCard from "@/components/student/TopicCard";
import ProgressBar from "@/components/ui/ProgressBar";
import { getCourseById } from "@/lib/mock/courses";
import { getTopicsByCourseId } from "@/lib/mock/topics";
import { getSubjectBySlug } from "@/lib/mock/subjects";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage({ params }: Props) {
  const { courseId } = await params;
  const course = getCourseById(courseId);
  if (!course) notFound();

  const subject = getSubjectBySlug(course.subjectSlug);
  const topics = getTopicsByCourseId(courseId);

  return (
    <div>
      <StudentHeader
        title={course.title}
        showBack
        backHref={`/subjects/${course.subjectSlug}`}
      />

      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        <div>
          <p className="text-sm text-text-muted">
            {subject?.name} · {course.level}
          </p>
          <h2 className="text-xl font-heading font-bold text-text-primary mt-1">
            {course.title}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {course.description}
          </p>
          <div className="mt-3">
            <ProgressBar value={course.progress} size="md" showLabel />
          </div>
        </div>

        <div>
          <h3 className="font-heading font-semibold text-text-primary mb-3">
            Topics ({topics.length})
          </h3>
          <div className="space-y-3">
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                courseId={courseId}
              />
            ))}
          </div>
          {topics.length === 0 && (
            <p className="text-sm text-text-muted text-center py-8">
              No topics available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import TopicCard from "@/components/student/TopicCard";
import ProgressBar from "@/components/ui/ProgressBar";
import { getCourseById } from "@/lib/mock/courses";
import { getTopicsByCourseId } from "@/lib/mock/topics";
import { getSubjectBySlug } from "@/lib/mock/subjects";
import { getCourseCbtExamId } from "@/lib/mock/adminCourseCbt";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage({ params }: Props) {
  const { courseId } = await params;
  const course = getCourseById(courseId);
  if (!course) notFound();

  const subject = getSubjectBySlug(course.subjectSlug);
  const topics = getTopicsByCourseId(courseId);
  const courseCbtId = getCourseCbtExamId(courseId);
  const allTopicsComplete =
    topics.length > 0 && topics.every((t) => t.completed);

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
              <div key={topic.id} className="space-y-2">
                <TopicCard topic={topic} courseId={courseId} />
                {topic.hasCbt && topic.cbtId && (
                  <Link
                    href={`/cbt/${topic.cbtId}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline px-1"
                  >
                    Take CBT →
                  </Link>
                )}
              </div>
            ))}
          </div>
          {topics.length === 0 && (
            <p className="text-sm text-text-muted text-center py-8">
              No topics available yet.
            </p>
          )}
        </div>

        {courseCbtId && (
          <div className="pt-2">
            {allTopicsComplete ? (
              <Link
                href={`/cbt/${courseCbtId}`}
                className="flex items-center justify-center w-full h-12 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors"
              >
                Take General CBT
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title="Complete all topics to unlock"
                className="flex items-center justify-center w-full h-12 rounded-2xl bg-gray-200 text-text-muted font-semibold text-sm cursor-not-allowed"
              >
                Take General CBT
              </button>
            )}
            {!allTopicsComplete && (
              <p className="text-xs text-text-muted text-center mt-2">
                Complete all topics to unlock
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

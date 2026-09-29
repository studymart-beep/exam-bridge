import Link from "next/link";
import { notFound } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { getSubjectBySlug } from "@/lib/mock/subjects";
import { getCoursesBySubjectSlug } from "@/lib/mock/courses";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SubjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const subject = getSubjectBySlug(slug);
  if (!subject) notFound();

  const courses = getCoursesBySubjectSlug(slug);

  return (
    <div>
      <StudentHeader title={subject.name} showBack backHref="/subjects" />

      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-heading font-bold"
            style={{ backgroundColor: subject.bgColor, color: subject.color }}
          >
            {subject.letter}
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-text-primary">
              {subject.name}
            </h2>
            <p className="text-sm text-text-secondary mt-0.5">
              {subject.description}
            </p>
          </div>
        </div>

        {/* Courses */}
        <div>
          <h3 className="font-heading font-semibold text-text-primary mb-3">
            Courses ({courses.length})
          </h3>
          <div className="space-y-3">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="hover:shadow-card hover:border-gray-200 transition-all duration-200 cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-heading font-semibold text-text-primary">
                        {course.title}
                      </h4>
                      <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                        {course.description}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
                        <span>{course.topicCount} topics</span>
                        <span>{course.level}</span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-text-muted flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={course.progress} size="sm" showLabel />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

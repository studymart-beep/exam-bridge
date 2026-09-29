import Link from "next/link";
import { notFound } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import TopicCard from "@/components/student/TopicCard";
import { getSubjectBySlug } from "@/lib/mock/subjects";
import { getTopicsBySubjectSlug } from "@/lib/mock/topics";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SubjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const subject = getSubjectBySlug(slug);
  if (!subject) notFound();

  const topicList = getTopicsBySubjectSlug(slug);

  return (
    <div>
      <StudentHeader title={subject.name} showBack backHref="/subjects" />

      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
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

        <div>
          <h3 className="font-heading font-semibold text-text-primary mb-3">
            Topics ({topicList.length})
          </h3>
          <div className="space-y-3">
            {topicList.map((topic) => (
              <div key={topic.id} className="space-y-2">
                <TopicCard topic={topic} subjectSlug={slug} />
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
          {topicList.length === 0 && (
            <p className="text-sm text-text-muted text-center py-8">
              No topics available yet.
            </p>
          )}
        </div>

        {subject.generalCbtId && (
          <Link
            href={`/subjects/${slug}/general-cbt`}
            className="flex items-center justify-center w-full h-12 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors"
          >
            Take General CBT
          </Link>
        )}
      </div>
    </div>
  );
}

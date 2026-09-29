import Link from "next/link";
import { notFound } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import { getSubjectBySlug, getTopicsBySubjectId } from "@/lib/data/subjects";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SubjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const subject = await getSubjectBySlug(slug);
  if (!subject) notFound();

  const topics = await getTopicsBySubjectId(subject.id);

  return (
    <div>
      <StudentHeader title={subject.name} showBack backHref="/subjects" />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-heading font-bold"
            style={{
              backgroundColor: subject.bg_color || "#DBEAFE",
              color: subject.color || "#1D4ED8",
            }}
          >
            {subject.letter || subject.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-text-primary">{subject.name}</h2>
            <p className="text-sm text-text-secondary mt-0.5">{subject.description}</p>
          </div>
        </div>

        <div>
          <h3 className="font-heading font-semibold text-text-primary mb-3">
            Topics ({topics.length})
          </h3>
          <div className="space-y-3">
            {topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/subjects/${slug}/topics/${topic.id}`}
                className="block p-4 bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-card"
              >
                <h4 className="font-heading font-semibold text-text-primary">{topic.title}</h4>
                <p className="text-sm text-text-secondary mt-1 line-clamp-2">{topic.description}</p>
                <p className="text-xs text-text-muted mt-2">{topic.duration || "—"}</p>
              </Link>
            ))}
          </div>
          {topics.length === 0 && (
            <p className="text-sm text-text-muted text-center py-8">No topics yet.</p>
          )}
        </div>

        {subject.general_cbt_id && (
          <Link
            href={`/cbt/${subject.general_cbt_id}`}
            className="flex items-center justify-center w-full h-12 rounded-2xl bg-primary text-white font-semibold text-sm"
          >
            Take General CBT
          </Link>
        )}
      </div>
    </div>
  );
}

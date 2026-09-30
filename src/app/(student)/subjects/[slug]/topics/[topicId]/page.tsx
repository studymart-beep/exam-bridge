export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import ContentLock from "@/components/student/ContentLock";
import {
  getTopicById,
  getMaterialsByTopicId,
  getSubjectBySlug,
} from "@/lib/data/subjects";

interface Props {
  params: Promise<{ slug: string; topicId: string }>;
}

export default async function TopicDetailPage({ params }: Props) {
  const { slug, topicId } = await params;
  const topic = await getTopicById(topicId);
  if (!topic) notFound();
  const subject = await getSubjectBySlug(slug);
  const materials = await getMaterialsByTopicId(topicId);

  return (
    <div>
      <StudentHeader title={topic.title} showBack backHref={`/subjects/${slug}`} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        <div>
          <p className="text-sm text-text-muted">
            {subject?.name} · {topic.duration}
          </p>
          <h2 className="text-xl font-heading font-bold text-text-primary mt-1">{topic.title}</h2>
          <p className="mt-2 text-sm text-text-secondary">{topic.description}</p>
        </div>

        <ContentLock label="Subscribe to access this topic.">
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-text-primary">Materials</h3>
            {materials.length === 0 && (
              <p className="text-sm text-text-muted">No materials yet.</p>
            )}
            {materials.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-white rounded-2xl border border-gray-100 shadow-soft"
              >
                <p className="text-xs uppercase text-text-muted">{m.type}</p>
                <p className="font-medium text-text-primary">{m.title}</p>
                {m.source && (
                  <p className="text-xs text-text-muted mt-1 break-all">{m.source}</p>
                )}
              </div>
            ))}
          </div>
        </ContentLock>
      </div>
    </div>
  );
}

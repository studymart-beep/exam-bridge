import Link from "next/link";
import { notFound } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import ContentLock from "@/components/student/ContentLock";
import { getSubjectBySlug } from "@/lib/data/student/subjects";
import { getTopicById } from "@/lib/data/subjects";
import { listMaterialsByTopic } from "@/lib/data/student/materials";
import { getCurrentProfile } from "@/lib/data/student/profile";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; topicId: string }>;
}

export default async function TopicDetailPage({ params }: Props) {
  const { slug, topicId } = await params;
  const subject = await getSubjectBySlug(slug);
  if (!subject) notFound();
  const topic = await getTopicById(topicId);
  if (!topic) notFound();
  const materials = await listMaterialsByTopic(topicId);
  const profile = await getCurrentProfile();

  let topicExamId: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("cbt_exams")
      .select("id")
      .eq("topic_id", topicId)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    topicExamId = data?.id || null;
  } catch {
    topicExamId = null;
  }

  return (
    <div>
      <StudentHeader
        title={topic.title}
        showBack
        backHref={`/subjects/${slug}`}
        userName={profile?.full_name || "Student"}
      />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        {topic.description && (
          <p className="text-sm text-text-secondary">{topic.description}</p>
        )}

        <h3 className="font-heading font-semibold">Materials</h3>
        <ContentLock label="Subscribe to view videos, PDFs, and images.">
          {materials.length === 0 ? (
            <p className="text-sm text-text-muted p-4">No materials for this topic yet.</p>
          ) : (
            <div className="space-y-3 p-2">
              {materials.map((m) => (
                <Card key={m.id} padding="sm">
                  <p className="text-xs uppercase text-text-muted">{m.type}</p>
                  <p className="font-medium text-sm">{m.title}</p>
                  {m.source && (
                    <p className="text-xs text-primary mt-1 break-all">{m.source}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </ContentLock>

        {topicExamId && (
          <ContentLock label="Subscribe to start this topic CBT.">
            <Link
              href={`/cbt/${topicExamId}`}
              className="block text-center p-4 rounded-2xl bg-primary text-white font-semibold text-sm"
            >
              Start topic CBT
            </Link>
          </ContentLock>
        )}
      </div>
    </div>
  );
}

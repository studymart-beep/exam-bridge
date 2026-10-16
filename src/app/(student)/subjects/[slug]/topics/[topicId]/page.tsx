import Link from "next/link";
import { notFound } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import ContentLock from "@/components/student/ContentLock";
import MaterialsViewer from "@/components/student/MaterialsViewer";
import Section from "@/components/ui/Section";
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
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">
        {topic.description && (
          <Section tint="gold">
            <p className="text-sm text-text-secondary leading-relaxed">
              {topic.description}
            </p>
          </Section>
        )}

        <Section title="Materials" tint="green">
          <ContentLock label="Subscribe to view videos, PDFs, and images.">
            {materials.length === 0 ? (
              <p className="text-sm text-text-muted py-4 text-center">
                No materials for this topic yet.
              </p>
            ) : (
              <MaterialsViewer topicId={topicId} materials={materials} />
            )}
          </ContentLock>
        </Section>

        {topicExamId && (
          <Section title="Practice" tint="blue">
            <ContentLock label="Subscribe to start this topic CBT.">
              <Link
                href={`/cbt/${topicExamId}`}
                className="card-gloss block text-center p-4 rounded-[18px] bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-bold text-sm shadow-card hover:-translate-y-0.5 transition-all"
              >
                Start topic CBT →
              </Link>
            </ContentLock>
          </Section>
        )}
      </div>
    </div>
  );
}

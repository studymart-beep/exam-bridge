import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import Card from "@/components/ui/Card";
import { adminGetTopic } from "@/lib/data/admin/topics";
import { adminGetTopicCbt, adminListUnattachedExams } from "@/lib/data/admin/cbt";
import TopicCbtManager from "@/components/admin/TopicCbtManager";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ topicId: string }>;
}

export default async function TopicCbtPage({ params }: Props) {
  const { topicId } = await params;
  const topic = await adminGetTopic(topicId);
  if (!topic) notFound();
  const attached = await adminGetTopicCbt(topicId);
  const unattached = await adminListUnattachedExams();

  return (
    <div>
      <AdminHeader title="Topic CBT" subtitle={topic.title} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">
        <Link
          href={`/admin/subjects/${topic.subject_id}/topics`}
          className="text-sm text-primary hover:underline"
        >
          ← Back to topics
        </Link>
        <TopicCbtManager
          topicId={topicId}
          subjectId={topic.subject_id}
          attached={attached}
          unattached={unattached}
        />
      </div>
    </div>
  );
}

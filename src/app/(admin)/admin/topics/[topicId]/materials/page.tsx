import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { adminGetTopic } from "@/lib/data/admin/topics";
import { adminListMaterialsByTopic } from "@/lib/data/admin/materials";
import MaterialsManager from "@/components/admin/MaterialsManager";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ topicId: string }>;
}

export default async function TopicMaterialsPage({ params }: Props) {
  const { topicId } = await params;
  const topic = await adminGetTopic(topicId);
  if (!topic) notFound();
  const materials = await adminListMaterialsByTopic(topicId);

  return (
    <div>
      <AdminHeader title="Materials" subtitle={topic.title} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">
        <Link
          href={`/admin/subjects/${topic.subject_id}/topics`}
          className="text-sm text-primary hover:underline"
        >
          ← Back to topics
        </Link>
        <MaterialsManager topicId={topicId} initial={materials} />
      </div>
    </div>
  );
}

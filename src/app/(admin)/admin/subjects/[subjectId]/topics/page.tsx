import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { adminGetSubject } from "@/lib/data/admin/subjects";
import { adminListTopicsBySubject } from "@/lib/data/admin/topics";
import TopicsManager from "@/components/admin/TopicsManager";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ subjectId: string }>;
}

export default async function AdminSubjectTopicsPage({ params }: Props) {
  const { subjectId } = await params;
  const subject = await adminGetSubject(subjectId);
  if (!subject) notFound();
  const topics = await adminListTopicsBySubject(subjectId);

  return (
    <div>
      <AdminHeader title="Topics" subtitle={subject.name} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/subjects" className="text-sm text-primary hover:underline">
            ← Subjects
          </Link>
          <Link href={`/admin/subjects/${subjectId}/cbt`} className="text-sm text-primary hover:underline ml-auto">
            General CBT →
          </Link>
        </div>
        <TopicsManager subjectId={subjectId} initial={topics} />
      </div>
    </div>
  );
}

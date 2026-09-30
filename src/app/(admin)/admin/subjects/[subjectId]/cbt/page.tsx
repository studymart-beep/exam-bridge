import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { adminGetSubject } from "@/lib/data/admin/subjects";
import { adminGetSubjectGeneralCbt, adminListExams } from "@/lib/data/admin/cbt";
import SubjectCbtManager from "@/components/admin/SubjectCbtManager";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ subjectId: string }>;
}

export default async function SubjectCbtPage({ params }: Props) {
  const { subjectId } = await params;
  const subject = await adminGetSubject(subjectId);
  if (!subject) notFound();
  const attached = await adminGetSubjectGeneralCbt(subjectId);
  const all = await adminListExams();
  const candidates = all.filter((e) => !e.is_general || e.subject_id === subjectId);

  return (
    <div>
      <AdminHeader title="General CBT" subtitle={subject.name} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">
        <Link href={`/admin/subjects/${subjectId}/topics`} className="text-sm text-primary hover:underline">
          ← Back to topics
        </Link>
        <p className="text-sm text-text-secondary">
          General CBT for this subject (final exam).
        </p>
        <SubjectCbtManager subjectId={subjectId} attached={attached} candidates={candidates} />
      </div>
    </div>
  );
}

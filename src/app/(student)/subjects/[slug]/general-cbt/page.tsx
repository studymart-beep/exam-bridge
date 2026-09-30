import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubjectBySlug } from "@/lib/data/student/subjects";
import ContentLock from "@/components/student/ContentLock";
import GeneralCbtRedirect from "@/components/student/GeneralCbtRedirect";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SubjectGeneralCbtPage({ params }: Props) {
  const { slug } = await params;
  const subject = await getSubjectBySlug(slug);
  if (!subject) notFound();

  if (!subject.general_cbt_id) {
    return (
      <div className="p-6 text-center">
        <p className="text-text-muted">No general CBT for this subject yet.</p>
        <Link href={`/subjects/${slug}`} className="text-primary text-sm mt-2 inline-block">
          Back to {subject.name}
        </Link>
      </div>
    );
  }

  return (
    <ContentLock label="Subscribe to take this general CBT.">
      <GeneralCbtRedirect examId={subject.general_cbt_id} />
    </ContentLock>
  );
}

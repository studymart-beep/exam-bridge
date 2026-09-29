import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubjectBySlug } from "@/lib/mock/subjects";
import GeneralCbtRedirect from "@/components/student/GeneralCbtRedirect";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SubjectGeneralCbtPage({ params }: Props) {
  const { slug } = await params;
  const subject = getSubjectBySlug(slug);
  if (!subject) notFound();

  return (
      {subject.generalCbtId ? (
        <GeneralCbtRedirect examId={subject.generalCbtId} />
      ) : (
        <div className="p-6 text-center">
          <p className="text-text-muted">No general CBT for this subject yet.</p>
          <Link href={`/subjects/${slug}`} className="text-primary text-sm mt-2 inline-block">
            Back to {subject.name}
          </Link>
        </div>
      )}
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSubjectBySlug } from "@/lib/mock/subjects";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SubjectGeneralCbtPage({ params }: Props) {
  const { slug } = await params;
  const subject = getSubjectBySlug(slug);
  if (!subject) notFound();

  if (subject.generalCbtId) {
    redirect(`/cbt/${subject.generalCbtId}`);
  }

  return (
    <div className="p-6 text-center">
      <p className="text-text-muted">No general CBT for this subject yet.</p>
      <Link href={`/subjects/${slug}`} className="text-primary text-sm mt-2 inline-block">
        Back to {subject.name}
      </Link>
    </div>
  );
}

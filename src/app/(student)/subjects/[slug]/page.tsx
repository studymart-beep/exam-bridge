import Link from "next/link";
import { notFound } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import {
  getSubjectBySlug,
  getTopicsBySubject,
} from "@/lib/data/student/subjects";
import { getCurrentProfile } from "@/lib/data/student/profile";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SubjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const subject = await getSubjectBySlug(slug);
  if (!subject) notFound();
  const topics = await getTopicsBySubject(subject.id);
  const profile = await getCurrentProfile();

  return (
    <div>
      <StudentHeader
        title={subject.name}
        showBack
        backHref="/subjects"
        userName={profile?.full_name || "Student"}
      />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">
        {subject.description && (
          <p className="text-sm text-text-secondary">{subject.description}</p>
        )}
        {subject.general_cbt_id && (
          <Link
            href={`/subjects/${slug}/general-cbt`}
            className="block p-4 rounded-2xl bg-primary text-white font-semibold text-center text-sm"
          >
            Take general CBT
          </Link>
        )}
        <h3 className="font-heading font-semibold">Topics</h3>
        {topics.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-sm text-text-muted">No topics published yet.</p>
          </Card>
        ) : (
          topics.map((t) => (
            <Link key={t.id} href={`/subjects/${slug}/topics/${t.id}`}>
              <Card className="hover:shadow-card transition-shadow mb-2">
                <p className="font-medium text-sm">{t.title}</p>
                {t.duration && (
                  <p className="text-xs text-text-muted mt-0.5">{t.duration}</p>
                )}
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

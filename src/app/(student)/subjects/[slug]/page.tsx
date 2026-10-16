import Link from "next/link";
import { notFound } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import { cn } from "@/lib/utils";
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
          <Section tint="gold">
            <p className="text-sm text-text-secondary leading-relaxed">
              {subject.description}
            </p>
          </Section>
        )}

        {subject.general_cbt_id && (
          <Link
            href={`/subjects/${slug}/general-cbt`}
            className="card-gloss block p-4 rounded-[20px] bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-bold text-center text-sm shadow-card hover:-translate-y-0.5 transition-all"
          >
            Take general CBT →
          </Link>
        )}

        <Section title="Topics" tint="green">
          {topics.length === 0 ? (
            <Card className="text-center py-8" tint="green">
              <p className="text-sm text-text-muted">No topics published yet.</p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {topics.map((t, idx) => {
                const i = idx % 3;
                const gradients = [
                  "from-primary-light to-cream",
                  "from-accent-light to-cream",
                  "from-calm-light to-cream",
                ];
                return (
                  <Link
                    key={t.id}
                    href={`/subjects/${slug}/topics/${t.id}`}
                    className={cn(
                      "card-gloss block p-4 rounded-[18px] border border-white/50 bg-gradient-to-br",
                      "shadow-[0_6px_18px_-6px_rgba(22,101,52,0.1)] hover:-translate-y-0.5 transition-all",
                      gradients[i]
                    )}
                  >
                    <p className="relative z-10 font-heading font-bold text-sm text-text-primary">
                      {t.title}
                    </p>
                    {t.duration && (
                      <p className="relative z-10 text-xs text-text-muted mt-1">
                        {t.duration}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

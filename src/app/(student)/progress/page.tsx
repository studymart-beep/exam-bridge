import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import Section from "@/components/ui/Section";
import ScopeToggle from "@/components/shared/ScopeToggle";
import { getCurrentProfile } from "@/lib/data/student/profile";
import { getProgressForStudent } from "@/lib/data/student/progress";
import { listPublishedSubjects, getTopicsBySubject } from "@/lib/data/student/subjects";
import { listMySubjects } from "@/lib/data/student/mySubjects";

export const dynamic = "force-dynamic";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const { scope: rawScope } = await searchParams;
  const scope = rawScope === "all" ? "all" : "mine";
  const profile = await getCurrentProfile();
  const progressRows = profile ? await getProgressForStudent(profile.id) : [];
  const allSubjects = await listPublishedSubjects();
  const mine = await listMySubjects(profile?.id);
  const useMine = scope === "mine" && mine.length > 0;
  const subjects = useMine ? mine : allSubjects;

  const progressMap: Record<string, number> = {};
  progressRows.forEach((p: { topic_id: string; percent?: number; completed?: boolean }) => {
    progressMap[p.topic_id] = p.percent ?? (p.completed ? 100 : 0);
  });

  let totalTopics = 0;
  let sum = 0;
  const subjectProgress: { name: string; slug: string; progress: number; topicCount: number }[] = [];

  for (const s of subjects) {
    const topics = await getTopicsBySubject(s.id);
    totalTopics += topics.length;
    const avg =
      topics.length > 0
        ? Math.round(
            topics.reduce((acc, t) => acc + (progressMap[t.id] || 0), 0) / topics.length
          )
        : 0;
    sum += topics.reduce((acc, t) => acc + (progressMap[t.id] || 0), 0);
    subjectProgress.push({
      name: s.name,
      slug: s.slug,
      progress: avg,
      topicCount: topics.length,
    });
  }

  const overall = totalTopics > 0 ? Math.round(sum / totalTopics) : 0;

  return (
    <div>
      <StudentHeader title="Progress" userName={profile?.full_name || "Student"} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        <ScopeToggle
          scope={useMine ? "mine" : "all"}
          basePath="/progress"
          counts={{ mine: mine.length, all: allSubjects.length }}
        />

        <Card className="text-center">
          <p className="text-xs uppercase tracking-wide text-text-muted">
            Overall progress
          </p>
          <p className="text-5xl font-heading font-extrabold text-primary mt-1">
            {overall}%
          </p>
          <div className="mt-4 max-w-xs mx-auto">
            <ProgressBar value={overall} size="md" />
          </div>
          <p className="text-xs text-text-muted mt-2">
            {useMine
              ? "Across your selected subjects"
              : "Across all published subjects"}
          </p>
        </Card>

        {subjectProgress.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-sm text-text-muted">No subjects yet. Check back soon.</p>
          </Card>
        ) : (
          <Section
            title={useMine ? "My subjects" : "All subjects"}
            tint="green"
            goldBar
          >
            <div className="space-y-3">
              {subjectProgress.map((s) => (
                <Card key={s.slug} className="p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-text-muted font-bold">{s.progress}%</span>
                  </div>
                  <ProgressBar value={s.progress} size="sm" />
                  <p className="text-xs text-text-muted mt-1.5">
                    {s.topicCount} topic{s.topicCount === 1 ? "" : "s"}
                  </p>
                </Card>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

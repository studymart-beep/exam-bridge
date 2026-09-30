import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { getCurrentProfile } from "@/lib/data/student/profile";
import { getProgressForStudent } from "@/lib/data/student/progress";
import { listPublishedSubjects, getTopicsBySubject } from "@/lib/data/student/subjects";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const profile = await getCurrentProfile();
  const progressRows = profile ? await getProgressForStudent(profile.id) : [];
  const subjects = await listPublishedSubjects();

  const progressMap: Record<string, number> = {};
  progressRows.forEach((p: { topic_id: string; percent?: number; completed?: boolean }) => {
    progressMap[p.topic_id] = p.percent ?? (p.completed ? 100 : 0);
  });

  let totalTopics = 0;
  let sum = 0;
  const subjectProgress: { name: string; progress: number; topicCount: number }[] = [];

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
    subjectProgress.push({ name: s.name, progress: avg, topicCount: topics.length });
  }

  const overall = totalTopics > 0 ? Math.round(sum / totalTopics) : 0;

  return (
    <div>
      <StudentHeader title="Progress" userName={profile?.full_name || "Student"} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-6">
        <Card className="text-center">
          <p className="text-sm text-text-muted">Overall progress</p>
          <p className="text-4xl font-heading font-bold text-primary mt-1">{overall}%</p>
          <div className="mt-3 max-w-xs mx-auto">
            <ProgressBar value={overall} size="md" />
          </div>
        </Card>
        {subjectProgress.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-sm text-text-muted">No subjects yet. Check back soon.</p>
          </Card>
        ) : (
          subjectProgress.map((s) => (
            <Card key={s.name}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">{s.name}</span>
                <span className="text-text-muted">{s.progress}%</span>
              </div>
              <ProgressBar value={s.progress} size="sm" />
              <p className="text-xs text-text-muted mt-1">{s.topicCount} topics</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

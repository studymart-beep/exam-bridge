import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { subjects } from "@/lib/mock/subjects";
import { topics } from "@/lib/mock/topics";
import PageLock from "@/components/student/PageLock";

export default function ProgressPage() {
  const subjectProgress = subjects.map((s) => {
    const subjectTopics = topics.filter((t) => t.subjectSlug === s.slug);
    const avg =
      subjectTopics.length > 0
        ? Math.round(
            subjectTopics.reduce((sum, t) => sum + t.progress, 0) /
              subjectTopics.length
          )
        : 0;
    return { ...s, progress: avg, topicCount: subjectTopics.length };
  });

  const overall =
    topics.length > 0
      ? Math.round(topics.reduce((sum, t) => sum + t.progress, 0) / topics.length)
      : 0;

  const recent = topics
    .filter((t) => t.completed || t.progress > 50)
    .slice(0, 5);

  return (
    <div>
      <StudentHeader title="Progress" />
      <PageLock label="Subscribe to track your progress.">
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-6">
        <Card className="text-center">
          <p className="text-sm text-text-muted">Overall progress</p>
          <p className="text-4xl font-heading font-bold text-primary mt-1">{overall}%</p>
          <div className="mt-3 max-w-xs mx-auto">
            <ProgressBar value={overall} size="md" />
          </div>
        </Card>

        <div>
          <h3 className="font-heading font-semibold text-text-primary mb-3">By subject</h3>
          <div className="space-y-3">
            {subjectProgress.map((s) => (
              <Card key={s.id} padding="sm">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: s.bgColor, color: s.color }}
                  >
                    {s.letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-text-muted">{s.progress}%</span>
                    </div>
                    <ProgressBar value={s.progress} size="sm" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {recent.length > 0 && (
          <div>
            <h3 className="font-heading font-semibold text-text-primary mb-3">In progress</h3>
            <div className="space-y-2">
              {recent.map((t) => (
                <Card key={t.id} padding="sm">
                  <div className="flex justify-between text-sm gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{t.title}</p>
                      <ProgressBar value={t.progress} size="sm" className="mt-1" />
                    </div>
                    <span className="text-text-muted self-center">{t.progress}%</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      </PageLock>
    </div>
  );
}
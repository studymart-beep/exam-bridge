import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { subjects } from "@/lib/mock/subjects";
import { courses } from "@/lib/mock/courses";
import { topics } from "@/lib/mock/topics";

export default function ProgressPage() {
  const overallProgress = Math.round(
    courses.reduce((sum, c) => sum + c.progress, 0) / courses.length
  );
  const completedTopics = topics.filter((t) => t.completed).length;
  const studyStreak = 5;

  const subjectProgress = subjects.map((s) => {
    const subjectCourses = courses.filter((c) => c.subjectSlug === s.slug);
    const avg =
      subjectCourses.length > 0
        ? Math.round(
            subjectCourses.reduce((sum, c) => sum + c.progress, 0) /
              subjectCourses.length
          )
        : 0;
    return { ...s, progress: avg };
  });

  const recentCompleted = topics
    .filter((t) => t.completed || t.progress > 50)
    .slice(0, 5);

  return (
    <div>
      <StudentHeader title="Progress" />

      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-heading font-bold text-text-primary">
            Your Progress
          </h2>
          <p className="text-sm text-text-secondary">
            Track your learning journey
          </p>
        </div>

        {/* Overall ring */}
        <Card className="flex flex-col items-center py-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#1D4ED8"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(overallProgress / 100) * 327} 327`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-heading font-bold text-text-primary">
                {overallProgress}%
              </span>
              <span className="text-xs text-text-muted">Overall</span>
            </div>
          </div>
          <div className="mt-4 flex gap-6 text-center">
            <div>
              <p className="text-lg font-heading font-bold text-text-primary">
                {completedTopics}
              </p>
              <p className="text-xs text-text-muted">Topics done</p>
            </div>
            <div>
              <p className="text-lg font-heading font-bold text-text-primary">
                {studyStreak}
              </p>
              <p className="text-xs text-text-muted">Day streak</p>
            </div>
            <div>
              <p className="text-lg font-heading font-bold text-text-primary">
                {subjects.length}
              </p>
              <p className="text-xs text-text-muted">Subjects</p>
            </div>
          </div>
        </Card>

        {/* Per-subject */}
        <div>
          <h3 className="font-heading font-semibold text-text-primary mb-3">
            By Subject
          </h3>
          <div className="space-y-3">
            {subjectProgress.map((s) => (
              <Card key={s.id} padding="sm" className="!p-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: s.bgColor, color: s.color }}
                  >
                    {s.letter}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-text-primary">
                        {s.name}
                      </span>
                      <span className="text-xs text-text-muted">
                        {s.progress}%
                      </span>
                    </div>
                    <ProgressBar value={s.progress} size="sm" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recently completed */}
        <div>
          <h3 className="font-heading font-semibold text-text-primary mb-3">
            Recently Studied
          </h3>
          <div className="space-y-2">
            {recentCompleted.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-soft"
              >
                <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {t.title}
                  </p>
                  <ProgressBar value={t.progress} size="sm" className="mt-1" />
                </div>
                <span className="text-xs text-text-muted flex-shrink-0">
                  {t.progress}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

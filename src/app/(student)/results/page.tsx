import Link from "next/link";
import StudentHeader from "@/components/student/StudentHeader";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import ScopeToggle from "@/components/shared/ScopeToggle";
import { getCurrentProfile } from "@/lib/data/student/profile";
import { getResultsForStudent } from "@/lib/data/student/results";
import { getMySubjectIds } from "@/lib/data/student/mySubjects";
import { listPublishedSubjects } from "@/lib/data/student/subjects";

export const dynamic = "force-dynamic";

type Attempt = {
  id: string;
  exam_id: string;
  score: number | null;
  total: number | null;
  passed: boolean | null;
  submitted_at: string | null;
  cbt_exams?:
    | { title: string; subject_id: string | null; is_general: boolean }
    | null;
};

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const { scope: rawScope } = await searchParams;
  const scope = rawScope === "all" ? "all" : "mine";
  const profile = await getCurrentProfile();
  const rows = (profile ? await getResultsForStudent(profile.id) : []) as Attempt[];
  const mineIds = await getMySubjectIds(profile?.id);
  const mineSet = new Set(mineIds);
  const allSubjects = await listPublishedSubjects();

  const belongsToMine = (r: Attempt) => {
    const e = r.cbt_exams;
    if (!e) return true;
    if (e.is_general) return true;
    return e.subject_id ? mineSet.has(e.subject_id) : true;
  };

  const useMine = scope === "mine" && mineIds.length > 0;
  const mineCount = rows.filter(belongsToMine).length;
  const results = useMine ? rows.filter(belongsToMine) : rows;

  return (
    <div>
      <StudentHeader title="Results" userName={profile?.full_name || "Student"} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-text-primary">
            Past Results
          </h2>
          <p className="text-sm text-text-secondary">
            Your CBT attempt history —{" "}
            {useMine ? "your subjects only" : "all subjects"}
          </p>
        </div>

        <ScopeToggle
          scope={useMine ? "mine" : "all"}
          basePath="/results"
          counts={{ mine: mineCount, all: rows.length }}
        />

        {results.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-sm text-text-muted">
              No results yet. Take a practice exam to see scores here.
            </p>
          </Card>
        ) : (
          <Section
            title={useMine ? "My results" : "All results"}
            tint="blue"
            goldBar
          >
            <div className="space-y-3">
              {results.map((r) => {
                const total = r.total || 1;
                const pct =
                  r.score != null ? Math.round((r.score / total) * 100) : 0;
                return (
                  <Link
                    key={r.id}
                    href={`/cbt/${r.exam_id}/result/${r.id}`}
                    className="flex items-center gap-4 p-4 bg-surface rounded-2xl border border-border shadow-card"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-extrabold text-lg ${
                        r.passed
                          ? "bg-primary-light text-primary"
                          : "bg-coral-light text-coral-dark"
                      }`}
                    >
                      {pct}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {r.cbt_exams?.title || "Exam"}
                      </p>
                      <p className="text-xs text-text-muted">
                        {r.submitted_at
                          ? new Date(r.submitted_at).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                    <Badge variant={r.passed ? "success" : "error"}>
                      {r.passed ? "Passed" : "Failed"}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

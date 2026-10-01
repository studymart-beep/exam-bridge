import Link from "next/link";
import StudentHeader from "@/components/student/StudentHeader";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { getCurrentProfile } from "@/lib/data/student/profile";
import { getResultsForStudent } from "@/lib/data/student/results";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const profile = await getCurrentProfile();
  const results = profile ? await getResultsForStudent(profile.id) : [];

  return (
    <div>
      <StudentHeader title="Results" userName={profile?.full_name || "Student"} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        <div>
          <h2 className="text-xl font-heading font-bold text-text-primary">Past Results</h2>
          <p className="text-sm text-text-secondary">Your CBT attempt history</p>
        </div>
        {results.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-sm text-text-muted">
              No results yet. Take a practice exam to see scores here.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {results.map(
              (r: {
                id: string;
                exam_id: string;
                score: number | null;
                total: number | null;
                passed: boolean | null;
                submitted_at: string | null;
                cbt_exams?: { title: string } | null;
              }) => {
                const total = r.total || 1;
                const pct = r.score != null ? Math.round((r.score / total) * 100) : 0;
                return (
                  <Link
                    key={r.id}
                    href={`/cbt/${r.exam_id}/result/${r.id}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border shadow-soft"
                  >
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center font-heading font-bold text-lg ${
                        r.passed ? "bg-green-50 text-success" : "bg-red-50 text-error"
                      }`}
                    >
                      {pct}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{r.cbt_exams?.title || "Exam"}</p>
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
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}

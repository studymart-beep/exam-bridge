import Link from "next/link";
import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import { listExamsForStudent } from "@/lib/data/student/cbt";
import { getCurrentProfile } from "@/lib/data/student/profile";

export const dynamic = "force-dynamic";

export default async function CbtListPage() {
  const exams = await listExamsForStudent();
  const profile = await getCurrentProfile();

  return (
    <div>
      <StudentHeader title="CBT Practice" userName={profile?.full_name || "Student"} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-3">
        {exams.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-sm text-text-muted">No practice exams available yet.</p>
          </Card>
        ) : (
          exams.map((e) => (
            <Link key={e.id} href={`/cbt/${e.id}`}>
              <Card className="hover:shadow-card transition-shadow mb-2">
                <p className="font-medium">{e.title}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {e.question_count} questions · {e.duration_mins} min · Pass {e.pass_mark}%
                  {e.is_general ? " · General" : ""}
                </p>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

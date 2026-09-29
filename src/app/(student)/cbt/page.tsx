import Link from "next/link";
import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import { getExams } from "@/lib/data/cbt";

export default async function CBTListPage() {
  const exams = await getExams();

  return (
    <div>
      <StudentHeader title="CBT Practice" />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        <div>
          <h2 className="text-xl font-heading font-bold text-text-primary">CBT Practice</h2>
          <p className="text-sm text-text-secondary">Practice real exam questions</p>
        </div>
        <div className="space-y-3">
          {exams.map((exam) => (
            <Link key={exam.id} href={`/cbt/${exam.id}`}>
              <Card className="hover:shadow-card transition-shadow">
                <h3 className="font-heading font-semibold text-text-primary">{exam.title}</h3>
                <p className="text-xs text-text-muted mt-1">
                  {exam.question_count} Q · {exam.duration_mins} min · Pass {exam.pass_mark}%
                </p>
              </Card>
            </Link>
          ))}
          {exams.length === 0 && (
            <p className="text-center text-text-muted text-sm py-12">No exams yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

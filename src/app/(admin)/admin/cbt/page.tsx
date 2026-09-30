import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { adminListExams } from "@/lib/data/admin/cbt";
import CbtListActions from "@/components/admin/CbtListActions";

export const dynamic = "force-dynamic";

export default async function AdminCbtPage() {
  const exams = await adminListExams();

  return (
    <div>
      <AdminHeader title="CBT Exams" subtitle={`${exams.length} exams`} />
      <div className="px-4 sm:px-6 py-5 max-w-5xl mx-auto space-y-4">
        <CbtListActions />
        {exams.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-sm text-text-muted">Nothing here yet. Create an exam.</p>
          </Card>
        ) : (
          exams.map((e) => (
            <Card key={e.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-semibold">{e.title}</h3>
                  <Badge variant={e.is_active ? "success" : "default"} size="sm">
                    {e.is_active ? "Active" : "Off"}
                  </Badge>
                  {e.is_general && <Badge variant="info" size="sm">General</Badge>}
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  {e.subject_name || e.topic_title || "Unattached"} · {e.question_count} Q ·{" "}
                  {e.duration_mins} min · Pass {e.pass_mark}%
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/cbt/${e.id}`}>
                  <span className="text-sm font-medium text-primary hover:underline">Edit</span>
                </Link>
                <Link href={`/admin/cbt/${e.id}/questions`}>
                  <span className="text-sm font-medium text-primary hover:underline">Questions</span>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

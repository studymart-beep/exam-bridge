import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  adminGetStudent,
  adminGetStudentPayments,
  adminGetStudentAttempts,
} from "@/lib/data/admin/users";
import UserActions from "@/components/admin/UserActions";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { userId } = await params;
  const student = await adminGetStudent(userId);
  if (!student || student.role !== "student") notFound();

  const payments = await adminGetStudentPayments(userId);
  const attempts = await adminGetStudentAttempts(userId);

  return (
    <div>
      <AdminHeader title={student.full_name || "Student"} subtitle={student.email || ""} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        <Link href="/admin/users" className="text-sm text-primary hover:underline">
          ← Back to students
        </Link>
        <Card className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={student.status === "active" ? "success" : "warning"}>{student.status}</Badge>
          </div>
          <p className="text-sm"><span className="text-text-muted">Phone:</span> {student.phone || "—"}</p>
          <p className="text-sm">
            <span className="text-text-muted">Subscription expires:</span>{" "}
            {student.subscription_expires_at
              ? new Date(student.subscription_expires_at).toLocaleDateString()
              : "—"}
          </p>
          <p className="text-sm">
            <span className="text-text-muted">Joined:</span>{" "}
            {new Date(student.created_at).toLocaleDateString()}
          </p>
          <UserActions userId={student.id} status={student.status} />
        </Card>

        <Card>
          <h3 className="font-heading font-semibold mb-3">Payments</h3>
          {payments.length === 0 ? (
            <p className="text-sm text-text-muted">No payments.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {payments.map((p: { id: string; amount: number; status: string; created_at: string }) => (
                <li key={p.id} className="flex justify-between">
                  <span>₦{Number(p.amount).toLocaleString()} · {p.status}</span>
                  <span className="text-text-muted text-xs">{new Date(p.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="font-heading font-semibold mb-3">CBT attempts</h3>
          {attempts.length === 0 ? (
            <p className="text-sm text-text-muted">No attempts.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {attempts.map((a: { id: string; score: number | null; total: number | null; status: string; cbt_exams?: { title: string } | null }) => (
                <li key={a.id} className="flex justify-between">
                  <span>{a.cbt_exams?.title || "Exam"} · {a.status}</span>
                  <span className="text-text-muted">
                    {a.score != null ? `${a.score}/${a.total}` : "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

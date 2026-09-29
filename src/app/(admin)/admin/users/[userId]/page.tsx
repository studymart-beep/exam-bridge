"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../../layout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { getAdminUserById } from "@/lib/mock/adminUsers";
import { adminPayments } from "@/lib/mock/adminPayments";
import { pastResults } from "@/lib/mock/results";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const openMenu = useAdminMenu();
  const router = useRouter();
  const { showToast } = useToast();
  const user = getAdminUserById(userId);
  const [confirm, setConfirm] = useState<"suspend" | "activate" | "delete" | null>(null);

  if (!user) {
    return (
      <div>
        <AdminHeader title="User not found" onMenuClick={openMenu} />
        <div className="p-6 text-center">
          <p className="text-text-muted">Student not found.</p>
          <Link href="/admin/users" className="text-primary text-sm mt-2 inline-block">Back to students</Link>
        </div>
      </div>
    );
  }

  const payments = adminPayments.filter((p) => p.userId === user.id);
  const attempts = pastResults.slice(0, 3);

  const handleAction = () => {
    // TODO: replace with API call
    if (confirm === "delete") {
      showToast("User deleted (mock)", "success");
      router.push("/admin/users");
    } else if (confirm === "suspend") {
      showToast("User suspended (mock)", "warning");
    } else {
      showToast("User activated (mock)", "success");
    }
    setConfirm(null);
  };

  return (
    <div>
      <AdminHeader title={user.fullName} subtitle="Student detail" onMenuClick={openMenu} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        <Card className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <Avatar initials={user.initials} size="xl" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-heading font-bold text-text-primary">{user.fullName}</h2>
            <p className="text-sm text-text-secondary">{user.email}</p>
            <p className="text-sm text-text-muted">{user.phone}</p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <Badge variant={user.status === "active" ? "success" : user.status === "suspended" ? "error" : "warning"}>
                {user.status}
              </Badge>
              <Badge variant="info">{user.subscriptionStatus}</Badge>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Joined", value: formatDate(user.joinedAt) },
            { label: "Last active", value: formatDate(user.lastActiveAt) },
            { label: "Exams taken", value: String(user.examsTaken) },
            { label: "Avg score", value: `${user.avgScore}%` },
          ].map((s) => (
            <Card key={s.label} padding="sm" className="text-center">
              <p className="text-xs text-text-muted">{s.label}</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">{s.value}</p>
            </Card>
          ))}
        </div>

        <Card>
          <h3 className="font-heading font-semibold text-text-primary mb-3">Payment history</h3>
          {payments.length === 0 ? (
            <p className="text-sm text-text-muted">No payments</p>
          ) : (
            <div className="space-y-2">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium">₦{p.amount.toLocaleString()}</p>
                    <p className="text-xs text-text-muted">{formatDateTime(p.createdAt)}</p>
                  </div>
                  <Badge variant={p.status === "verified" ? "success" : p.status === "pending" ? "warning" : "error"}>
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-heading font-semibold text-text-primary mb-3">Recent CBT attempts</h3>
          <div className="space-y-2">
            {attempts.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium">{a.examTitle}</p>
                  <p className="text-xs text-text-muted">{a.subjectName}</p>
                </div>
                <Badge variant={a.passed ? "success" : "error"}>{a.score}%</Badge>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-wrap gap-3">
          {user.status === "suspended" ? (
            <Button onClick={() => setConfirm("activate")}>Activate</Button>
          ) : (
            <Button variant="outline" onClick={() => setConfirm("suspend")}>Suspend</Button>
          )}
          <Button variant="danger" onClick={() => setConfirm("delete")}>Delete</Button>
          <Link href="/admin/users">
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={handleAction}
        title={confirm === "delete" ? "Delete user?" : confirm === "suspend" ? "Suspend user?" : "Activate user?"}
        message={
          confirm === "delete"
            ? `Permanently delete ${user.fullName}? This cannot be undone.`
            : confirm === "suspend"
            ? `Suspend ${user.fullName}? They will lose access.`
            : `Re-activate ${user.fullName}?`
        }
        confirmLabel={confirm === "delete" ? "Delete" : confirm === "suspend" ? "Suspend" : "Activate"}
        danger={confirm === "delete" || confirm === "suspend"}
      />
    </div>
  );
}

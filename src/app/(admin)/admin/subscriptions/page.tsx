import AdminHeader from "@/components/admin/AdminHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { adminListSubscriptions } from "@/lib/data/admin/payments";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const rows = await adminListSubscriptions();

  return (
    <div>
      <AdminHeader title="Subscriptions" subtitle={`${rows.length} students`} />
      <div className="px-4 sm:px-6 py-5 max-w-4xl mx-auto space-y-3">
        <Card className="bg-primary-light border-blue-100 text-sm text-primary">
          Subscription activation happens through Payments approval.
        </Card>
        {rows.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-sm text-text-muted">Nothing here yet.</p>
          </Card>
        ) : (
          rows.map((s: {
            id: string;
            full_name: string | null;
            email: string | null;
            status: string;
            subscription_expires_at: string | null;
          }) => {
            const days =
              s.subscription_expires_at
                ? Math.ceil(
                    (new Date(s.subscription_expires_at).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )
                : null;
            return (
              <Card key={s.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{s.full_name || "—"}</p>
                  <p className="text-xs text-text-muted truncate">{s.email}</p>
                </div>
                <Badge variant={s.status === "active" ? "success" : "default"}>{s.status}</Badge>
                <span className="text-xs text-text-muted whitespace-nowrap">
                  {days != null ? `${days}d left` : "—"}
                </span>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

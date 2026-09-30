import AdminHeader from "@/components/admin/AdminHeader";
import Card from "@/components/ui/Card";
import { adminListNotifications } from "@/lib/data/admin/reports";
import NotificationComposer from "@/components/admin/NotificationComposer";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const list = await adminListNotifications(50);

  return (
    <div>
      <AdminHeader title="Notifications" subtitle="Send to students" />
      <div className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-5">
        <Card>
          <NotificationComposer />
        </Card>
        <div className="space-y-2">
          <h3 className="font-heading font-semibold text-sm">Recent</h3>
          {list.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">Nothing here yet.</p>
          ) : (
            list.map((n: { id: string; title: string; body: string | null; created_at: string }) => (
              <Card key={n.id} padding="sm">
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.body}</p>
                <p className="text-[10px] text-text-muted mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

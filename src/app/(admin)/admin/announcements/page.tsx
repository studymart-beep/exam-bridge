import AdminHeader from "@/components/admin/AdminHeader";
import Card from "@/components/ui/Card";
import { adminListNotifications } from "@/lib/data/admin/reports";
import NotificationComposer from "@/components/admin/NotificationComposer";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const list = await adminListNotifications(20);

  return (
    <div>
      <AdminHeader title="Announcements" subtitle="Broadcast to students" />
      <div className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-5">
        <Card>
          <p className="text-xs text-text-muted mb-3">
            Announcements use the same notifications system.
          </p>
          <NotificationComposer />
        </Card>
        <div className="space-y-2">
          {list.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">Nothing here yet.</p>
          ) : (
            list.map((n: { id: string; title: string; body: string | null; created_at: string }) => (
              <Card key={n.id} padding="sm">
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-xs text-text-muted mt-0.5">{n.body}</p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

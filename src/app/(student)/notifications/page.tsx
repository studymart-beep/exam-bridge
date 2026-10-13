import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import { getCurrentProfile } from "@/lib/data/student/profile";
import { listNotificationsForStudent } from "@/lib/data/student/notifications";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const profile = await getCurrentProfile();
  const list = profile ? await listNotificationsForStudent(profile.id) : [];

  return (
    <div>
      <StudentHeader title="Notifications" userName={profile?.full_name || "Student"} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-3">
        {list.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-sm text-text-muted">No notifications yet.</p>
          </Card>
        ) : (
          list.map((n: { id: string; title: string; body: string | null; read: boolean; created_at: string }) => (
            <Card
              key={n.id}
              className={n.read ? "opacity-70" : "border-primary/20"}
              padding="sm"
            >
              <p className="font-medium text-sm">{n.title}</p>
              {n.body && <p className="text-xs text-text-muted mt-0.5">{n.body}</p>}
              <p className="text-[10px] text-text-muted mt-1">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import StudentHeader from "@/components/student/StudentHeader";
import SubscriptionBanner from "@/components/student/SubscriptionBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  getCurrentProfile,
  isSubscriptionActive,
} from "@/lib/data/student/profile";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const quickTiles = [
  { href: "/subjects", label: "Subjects", sub: "Browse subjects" },
  { href: "/cbt", label: "CBT Practice", sub: "Practice exams" },
  { href: "/results", label: "Results", sub: "View results" },
  { href: "/progress", label: "Progress", sub: "Track performance" },
];

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const subscribed = isSubscriptionActive(profile);
  const firstName =
    profile?.full_name?.split(" ")[0] ||
    profile?.email?.split("@")[0] ||
    "Student";

  let unread = 0;
  if (profile) {
    try {
      const supabase = await createClient();
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("student_id", profile.id)
        .eq("read", false);
      unread = count || 0;
    } catch {
      unread = 0;
    }
  }

  const daysRemaining =
    profile?.subscription_expires_at
      ? Math.max(
          0,
          Math.ceil(
            (new Date(profile.subscription_expires_at).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;

  return (
    <div>
      <StudentHeader title="Home" userName={profile?.full_name || "Student"} unreadCount={unread} />
      <SubscriptionBanner show={!subscribed} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-heading font-bold text-text-primary">
            Welcome back, {firstName} 👋
          </h2>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {subscribed ? (
              <>
                <Badge variant="success">Active</Badge>
                {daysRemaining !== null && (
                  <span className="text-xs text-text-muted">
                    expires in {daysRemaining} day{daysRemaining === 1 ? "" : "s"}
                  </span>
                )}
              </>
            ) : (
              <Badge variant="warning">Inactive</Badge>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quickTiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="flex flex-col items-start p-4 bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-card transition-all"
            >
              <h3 className="font-heading font-semibold text-text-primary text-sm">{tile.label}</h3>
              <p className="text-xs text-text-muted mt-0.5">{tile.sub}</p>
            </Link>
          ))}
        </div>
        {unread > 0 && (
          <Link
            href="/notifications"
            className="flex items-center gap-3 p-4 bg-primary-light/50 rounded-2xl border border-primary/10"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm">
              {unread}
            </div>
            <div>
              <p className="text-sm font-medium">
                You have {unread} unread notification{unread > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-text-secondary">Tap to view</p>
            </div>
          </Link>
        )}
        <Card>
          <h3 className="font-heading font-semibold text-text-primary mb-2">Quick tip</h3>
          <p className="text-sm text-text-secondary">
            Browse subjects freely. Materials and CBT start require an active subscription.
          </p>
        </Card>
      </div>
    </div>
  );
}

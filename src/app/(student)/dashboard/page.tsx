import Link from "next/link";
import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { getCurrentProfile, isSubscriptionActive } from "@/lib/data/profile";
import { createClient } from "@/lib/supabase/server";

const quickTiles = [
  {
    href: "/subjects",
    label: "Subjects",
    sub: "Browse subjects",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: "/cbt",
    label: "CBT Practice",
    sub: "Practice exams",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/results",
    label: "Results",
    sub: "View Results",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/progress",
    label: "Progress",
    sub: "Track Performance",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
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
    const supabase = await createClient();
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("student_id", profile.id)
      .eq("read", false);
    unread = count || 0;
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
      <StudentHeader title="Home" />

      {!subscribed && (
        <div className="w-full bg-orange-50 border-b border-orange-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-orange-900">
                Your subscription is inactive. Subscribe to unlock materials and exams.
              </p>
              <p className="text-xs text-orange-700 mt-0.5">
                You can still browse subjects and CBT lists.
              </p>
            </div>
            <Link
              href="/subscribe"
              className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-orange-600 flex-shrink-0"
            >
              Subscribe Now
            </Link>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-heading font-bold text-text-primary">
            Welcome back, {firstName} 👋
          </h2>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {subscribed ? (
              <>
                <Badge variant="success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Active
                </Badge>
                {daysRemaining !== null && (
                  <span className="text-xs text-text-muted">
                    Subscription · expires in {daysRemaining} day
                    {daysRemaining === 1 ? "" : "s"}
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
              className="flex flex-col items-start p-4 bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-card hover:border-gray-200 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mb-3">
                {tile.icon}
              </div>
              <h3 className="font-heading font-semibold text-text-primary text-sm">
                {tile.label}
              </h3>
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
              <p className="text-sm font-medium text-text-primary">
                You have {unread} unread notification{unread > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-text-secondary">Tap to view</p>
            </div>
          </Link>
        )}

        <Card>
          <h3 className="font-heading font-semibold text-text-primary mb-2">Quick tip</h3>
          <p className="text-sm text-text-secondary">
            Browse subjects freely. Video, PDF, and CBT start require an active subscription.
          </p>
        </Card>
      </div>
    </div>
  );
}

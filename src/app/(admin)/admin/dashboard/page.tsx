import Link from "next/link";
import Image from "next/image";
import AdminHeader from "@/components/admin/AdminHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { adminGetDashboardStats } from "@/lib/data/admin/reports";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await adminGetDashboardStats();

  let recentSubjects: { id: string; name: string; created_at: string }[] = [];
  let recentNotifs: { id: string; title: string; created_at: string }[] = [];
  let pendingHint: string | null = null;

  try {
    const supabase = await createClient();
    const { data: subs } = await supabase
      .from("subjects")
      .select("id, name, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    recentSubjects = (subs as typeof recentSubjects) || [];

    const { data: notifs } = await supabase
      .from("notifications")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(3);
    recentNotifs = (notifs as typeof recentNotifs) || [];

    if (stats.pendingPayments > 0) {
      pendingHint = `${stats.pendingPayments} payment(s) awaiting review`;
    } else if (recentSubjects[0]) {
      pendingHint = `Latest subject: ${recentSubjects[0].name}`;
    }
  } catch {
    /* ok */
  }

  const activePct =
    stats.students > 0
      ? Math.round((stats.activeSubs / stats.students) * 100)
      : 0;
  const ringCirc = 2 * Math.PI * 40;
  const ringOff = ringCirc * (1 - activePct / 100);
  const maxDaily = Math.max(1, ...stats.dailyAttempts.map((x) => x.count));

  return (
    <div>
      <AdminHeader title="Dashboard" subtitle="Overview" />
      <div className="px-4 sm:px-6 py-5 max-w-5xl mx-auto space-y-5">
        <div className="relative w-full h-[200px] md:h-[280px] rounded-2xl overflow-hidden">
          <Image
            src="/images/dashboard-hero.png"
            alt=""
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/90 via-primary-dark/70 to-primary/40" />
          <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-end">
            <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-white">
              Welcome back, Admin
            </h1>
            <p className="text-sm text-white/85 mt-1">
              Here&apos;s what&apos;s happening today.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { n: stats.students, l: "Students" },
            { n: stats.activeSubs, l: "Active Subs" },
            { n: stats.pendingPayments, l: "Pending Pay" },
            { n: stats.subjects, l: "Subjects" },
          ].map((s) => (
            <Card key={s.l} className="text-center py-4">
              <p className="font-heading text-xl font-bold text-primary">{s.n}</p>
              <p className="text-xs text-text-muted mt-0.5">{s.l}</p>
            </Card>
          ))}
        </div>

        <Card className="flex flex-col sm:flex-row items-center gap-6 p-5">
          <div className="relative w-28 h-28 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                className="text-primary-light"
                stroke="currentColor"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                className="text-primary"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={ringCirc}
                strokeDashoffset={ringOff}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-heading font-bold text-lg text-primary">
                {activePct}%
              </span>
            </div>
          </div>
          <div className="flex-1 w-full">
            <p className="text-sm font-semibold mb-2">Active subscription rate</p>
            <div className="flex items-end gap-1.5 h-20">
              {stats.dailyAttempts.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-primary/30"
                    style={{
                      height: `${Math.max(8, (d.count / maxDaily) * 100)}%`,
                    }}
                  />
                  <span className="text-[9px] text-text-muted">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-text-muted">Focus next</p>
            <p className="font-semibold text-text-primary">
              {pendingHint || "All caught up"}
            </p>
          </div>
          <Link href={stats.pendingPayments > 0 ? "/admin/payments" : "/admin/subjects"}>
            <Button size="sm">
              {stats.pendingPayments > 0 ? "Review payments" : "Subjects"}
            </Button>
          </Link>
        </Card>

        {recentSubjects.length > 0 && (
          <div className="rounded-2xl bg-primary-light/40 border-l-4 border-accent p-4">
            <h2 className="font-heading font-semibold mb-3 flex items-center gap-2">
              Newly Added
              <span className="text-[10px] font-bold uppercase tracking-wide bg-secondary text-primary-dark px-2 py-0.5 rounded-full">
                NEW
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recentSubjects.map((s, i) => (
                <Link
                  key={s.id}
                  href="/admin/subjects"
                  className="relative flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
                >
                  <span className="w-8 h-8 rounded-full bg-secondary text-primary-dark text-sm font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold line-clamp-1">{s.name}</p>
                    <p className="text-[10px] text-text-muted">
                      {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold uppercase bg-accent-light text-accent-dark px-1.5 py-0.5 rounded absolute top-2 right-8">
                    NEW
                  </span>
                  <span className="text-text-muted">›</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {recentNotifs.length > 0 && (
          <div>
            <div className="flex justify-between mb-2">
              <h2 className="font-heading font-semibold">Notifications</h2>
              <Link href="/admin/notifications" className="text-xs text-primary">
                View all
              </Link>
            </div>
            <Card className="divide-y divide-border p-0 overflow-hidden">
              {recentNotifs.map((n) => (
                <div key={n.id} className="px-4 py-3">
                  <p className="text-sm font-medium line-clamp-1">{n.title}</p>
                  <p className="text-[10px] text-text-muted">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </Card>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/admin/users", label: "Students", sub: "Manage accounts" },
            { href: "/admin/payments", label: "Payments", sub: "Approvals" },
            { href: "/admin/subjects", label: "Subjects", sub: "Content" },
            { href: "/admin/reports", label: "Reports", sub: "Insights" },
          ].map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="rounded-2xl border border-border bg-surface p-4 min-h-[88px]"
            >
              <p className="text-sm font-semibold">{t.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{t.sub}</p>
            </Link>
          ))}
        </div>

        {stats.activity && stats.activity.length > 0 && (
          <Card>
            <h3 className="font-heading font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {stats.activity.slice(0, 8).map(
                (a: { id?: string; action?: string; created_at?: string }, i: number) => (
                  <div
                    key={a.id || i}
                    className="flex justify-between text-sm border-b border-border last:border-0 pb-2"
                  >
                    <span className="truncate text-text-secondary">
                      {a.action || "Activity"}
                    </span>
                    <span className="text-[10px] text-text-muted shrink-0">
                      {a.created_at
                        ? new Date(a.created_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                )
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

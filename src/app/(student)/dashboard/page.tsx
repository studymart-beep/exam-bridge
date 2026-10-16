import Link from "next/link";
import Image from "next/image";
import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SubscriptionPrompt from "@/components/student/SubscriptionPrompt";
import {
  getCurrentProfile,
  isSubscriptionActive,
} from "@/lib/data/student/profile";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const quickTiles = [
  { href: "/subjects", label: "Subjects", sub: "Browse & study" },
  { href: "/cbt", label: "CBT Practice", sub: "Timed exams" },
  { href: "/progress", label: "Progress", sub: "Track learning" },
  { href: "/results", label: "Results", sub: "Past scores" },
];

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const subscribed = isSubscriptionActive(profile);
  const firstName =
    profile?.full_name?.split(" ")[0] ||
    profile?.email?.split("@")[0] ||
    "Student";

  let subjectsCount = 0;
  let avgProgress = 0;
  let attempts = 0;
  let daysLeft: number | null = null;
  let daily: { day: string; count: number }[] = [];
  let recentSubjects: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    topicCount: number;
  }[] = [];
  let notifications: {
    id: string;
    title: string;
    created_at: string;
    read: boolean;
  }[] = [];
  let continueTopic: {
    title: string;
    subjectName: string;
    href: string;
  } | null = null;
  let activity: { id: string; action: string; created_at: string }[] = [];

  if (profile?.subscription_expires_at && subscribed) {
    daysLeft = Math.max(
      0,
      Math.ceil(
        (new Date(profile.subscription_expires_at).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    );
  }

  try {
    const supabase = await createClient();

    const { count: sc } = await supabase
      .from("subjects")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);
    subjectsCount = sc || 0;

    if (profile) {
      const { data: prog } = await supabase
        .from("progress")
        .select("percent, topic_id, last_viewed_at")
        .eq("student_id", profile.id)
        .order("last_viewed_at", { ascending: false });
      if (prog && prog.length) {
        avgProgress = Math.round(
          prog.reduce((s, p) => s + (p.percent || 0), 0) / prog.length
        );
        const last = prog[0];
        if (last?.topic_id) {
          const { data: topic } = await supabase
            .from("topics")
            .select("id, title, subject_id, subjects(name, slug)")
            .eq("id", last.topic_id)
            .maybeSingle();
          if (topic) {
            const sub = topic.subjects as
              | { name: string; slug: string }
              | { name: string; slug: string }[]
              | null;
            const subObj = Array.isArray(sub) ? sub[0] : sub;
            continueTopic = {
              title: topic.title,
              subjectName: subObj?.name || "Subject",
              href: subObj?.slug
                ? `/subjects/${subObj.slug}/topics/${topic.id}`
                : "/subjects",
            };
          }
        }
      }

      const { count: ac } = await supabase
        .from("cbt_attempts")
        .select("id", { count: "exact", head: true })
        .eq("student_id", profile.id);
      attempts = ac || 0;

      const seven = new Date();
      seven.setDate(seven.getDate() - 6);
      const { data: att } = await supabase
        .from("cbt_attempts")
        .select("started_at")
        .eq("student_id", profile.id)
        .gte("started_at", seven.toISOString());
      daily = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const count = (att || []).filter(
          (a) => a.started_at?.slice(0, 10) === key
        ).length;
        daily.push({ day: key.slice(5), count });
      }

      const { data: notifs } = await supabase
        .from("notifications")
        .select("id, title, created_at, read")
        .eq("student_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(3);
      notifications = (notifs as typeof notifications) || [];

      const { data: logs } = await supabase
        .from("activity_logs")
        .select("id, action, created_at")
        .eq("student_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5);
      activity = (logs as typeof activity) || [];
    }

    const { data: recent } = await supabase
      .from("subjects")
      .select("id, name, slug, color, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5);
    if (recent) {
      for (const s of recent) {
        const { count } = await supabase
          .from("topics")
          .select("id", { count: "exact", head: true })
          .eq("subject_id", s.id);
        recentSubjects.push({
          id: s.id,
          name: s.name,
          slug: s.slug,
          color: s.color,
          topicCount: count || 0,
        });
      }
    }
  } catch {
    /* empty ok */
  }

  const maxDaily = Math.max(1, ...daily.map((d) => d.count));
  const ringPct = Math.min(100, Math.max(0, avgProgress));
  const ringCirc = 2 * Math.PI * 40;
  const ringOff = ringCirc * (1 - ringPct / 100);

  return (
    <div>
      <StudentHeader title="Home" userName={profile?.full_name || "Student"} />
      <SubscriptionPrompt show={!subscribed} />
      <div className="px-4 sm:px-6 py-5 max-w-5xl mx-auto space-y-5">
        {/* Hero */}
        <div className="relative w-full h-[200px] md:h-[280px] rounded-2xl overflow-hidden">
          <Image
            src="/images/dashboard-hero.png"
            alt=""
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/95 via-primary/75 to-accent-dark/50" />
          <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-end">
            <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-white">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-white/85 mt-1">
              Your JAMB journey continues.
            </p>
            {!subscribed && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white">
                  Inactive
                </span>
                <Link href="/subscribe">
                  <Button size="sm" className="bg-secondary text-primary-dark hover:bg-accent">
                    Subscribe Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { n: subjectsCount, l: "Subjects", bg: "bg-primary-light/60 border-primary/20", icon: "📚" },
            { n: `${avgProgress}%`, l: "Avg Progress", bg: "bg-accent-light/70 border-accent/30", icon: "📈" },
            { n: attempts, l: "CBT Attempts", bg: "bg-sky-50 border-sky-200", icon: "✍️" },
            { n: daysLeft !== null ? daysLeft : "—", l: "Days Left", bg: "bg-amber-50 border-amber-200", icon: "⏳" },
          ].map((s) => (
            <div
              key={s.l}
              className={`text-center py-4 rounded-2xl border shadow-sm ${s.bg}`}
            >
              <div className="text-lg mb-1">{s.icon}</div>
              <p className="font-heading text-xl font-bold text-primary">{s.n}</p>
              <p className="text-xs text-text-secondary mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Progress ring + 7 day */}
        <Card className="flex flex-col sm:flex-row items-center gap-6 p-5">
          <div className="relative w-28 h-28 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                className="text-primary-light"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                className="text-primary"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={ringCirc}
                strokeDashoffset={ringOff}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading font-bold text-lg text-primary">
                {ringPct}%
              </span>
            </div>
          </div>
          <div className="flex-1 w-full min-w-0">
            <p className="text-sm font-semibold text-text-primary mb-2">
              Overall Progress
            </p>
            <div className="flex items-end gap-1.5 h-20">
              {daily.length === 0 ? (
                <p className="text-xs text-text-muted">No activity this week</p>
              ) : (
                daily.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-primary/30"
                      style={{
                        height: `${Math.max(8, (d.count / maxDaily) * 100)}%`,
                      }}
                    />
                    <span className="text-[9px] text-text-muted">{d.day}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Continue */}
        <Card className="flex flex-col sm:flex-row sm:items-center gap-3">
          {continueTopic ? (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-muted">Continue where you left off</p>
                <p className="font-semibold text-text-primary truncate">
                  {continueTopic.title}
                </p>
                <p className="text-xs text-text-secondary">{continueTopic.subjectName}</p>
              </div>
              <Link href={continueTopic.href}>
                <Button size="sm">Continue</Button>
              </Link>
            </>
          ) : (
            <>
              <div className="flex-1">
                <p className="font-semibold text-text-primary">Start with a subject</p>
                <p className="text-xs text-text-muted">Pick a subject and begin learning</p>
              </div>
              <Link href="/subjects">
                <Button size="sm">Browse</Button>
              </Link>
            </>
          )}
        </Card>

        {/* Newly added subjects */}
        {recentSubjects.length > 0 && (
          <div className="rounded-2xl bg-green-50 border border-primary/25 border-l-4 border-l-accent p-4 shadow-sm">
            <h2 className="font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
              Newly Added
              <span className="text-[10px] font-bold uppercase tracking-wide bg-secondary text-primary-dark px-2 py-0.5 rounded-full">
                NEW
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recentSubjects.map((s, i) => (
                <Link
                  key={s.id}
                  href={`/subjects/${s.slug}`}
                  className="relative flex items-center gap-3 rounded-xl border border-border bg-surface p-3 hover:border-primary/30"
                >
                  <span className="w-8 h-8 rounded-full bg-secondary text-primary-dark text-sm font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold line-clamp-1">{s.name}</p>
                    <p className="text-[10px] text-text-muted">{s.topicCount} topics</p>
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

        {/* Notifications */}
        {notifications.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-heading font-semibold text-text-primary">
                Notifications
              </h2>
              <Link href="/notifications" className="text-xs text-primary font-medium">
                View all
              </Link>
            </div>
            <Card className="divide-y divide-border p-0 overflow-hidden">
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 flex items-start gap-2">
                  {!n.read && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary line-clamp-1">
                      {n.title}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Quick tiles */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { ...quickTiles[0], iconBg: "bg-primary-light text-primary", icon: "📖" },
            { ...quickTiles[1], iconBg: "bg-accent-light text-accent-dark", icon: "📝" },
            { ...quickTiles[2], iconBg: "bg-sky-100 text-sky-700", icon: "📊" },
            { ...quickTiles[3], iconBg: "bg-amber-50 text-amber-700", icon: "🏆" },
          ].map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="rounded-2xl border border-amber-100 bg-surface p-4 hover:border-primary/30 min-h-[88px] shadow-sm"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm mb-2 ${tile.iconBg}`}>
                {tile.icon}
              </div>
              <p className="text-sm font-semibold text-text-primary">{tile.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{tile.sub}</p>
            </Link>
          ))}
        </div>

        {/* Activity */}
        {activity.length > 0 && (
          <div>
            <h2 className="font-heading font-semibold text-primary mb-2 pl-2 border-l-4 border-accent">
              Recent Activity
            </h2>
            <Card className="space-y-2">
              {activity.map((a) => (
                <div
                  key={a.id}
                  className="flex justify-between gap-2 text-sm border-b border-border last:border-0 pb-2 last:pb-0"
                >
                  <span className="text-text-secondary truncate">{a.action}</span>
                  <span className="text-[10px] text-text-muted shrink-0">
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

import AdminHeader from "@/components/admin/AdminHeader";
import Card from "@/components/ui/Card";
import StatCard from "@/components/admin/StatCard";
import { adminGetDashboardStats } from "@/lib/data/admin/reports";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await adminGetDashboardStats();

  return (
    <div>
      <AdminHeader title="Dashboard" subtitle="Overview" />
      <div className="px-4 sm:px-6 py-5 max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard label="Students" value={stats.students} icon={<span className="text-primary">👥</span>} />
          <StatCard label="Active subs" value={stats.activeSubs} iconBg="bg-green-50" icon={<span className="text-success">✓</span>} />
          <StatCard label="Subjects" value={stats.subjects} iconBg="bg-primary-light" icon={<span className="text-primary">📚</span>} />
          <StatCard label="Topics" value={stats.topics} iconBg="bg-amber-50" icon={<span className="text-warning">📝</span>} />
          <StatCard label="CBT exams" value={stats.exams} iconBg="bg-purple-50" icon={<span>❓</span>} />
          <StatCard label="Pending payments" value={stats.pendingPayments} iconBg="bg-red-50" icon={<span className="text-error">₦</span>} />
        </div>

        <Card>
          <h3 className="font-heading font-semibold text-text-primary mb-3">Attempts (last 7 days)</h3>
          <div className="flex items-end gap-2 h-32">
            {stats.dailyAttempts.map((d) => {
              const max = Math.max(1, ...stats.dailyAttempts.map((x) => x.count));
              const h = Math.round((d.count / max) * 100);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-primary/20 rounded-t" style={{ height: `${Math.max(h, 4)}%` }} />
                  <span className="text-[10px] text-text-muted">{d.day}</span>
                  <span className="text-[10px] font-medium">{d.count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="font-heading font-semibold text-text-primary mb-3">Recent activity</h3>
          {stats.activity.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">Nothing here yet.</p>
          ) : (
            <ul className="space-y-2">
              {stats.activity.map((a: { id: string; action: string; created_at: string }) => (
                <li key={a.id} className="text-sm flex justify-between gap-3 border-b border-gray-50 pb-2">
                  <span className="text-text-primary">{a.action}</span>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {new Date(a.created_at).toLocaleString()}
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

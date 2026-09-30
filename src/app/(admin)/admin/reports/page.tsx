import AdminHeader from "@/components/admin/AdminHeader";
import Card from "@/components/ui/Card";
import StatCard from "@/components/admin/StatCard";
import { adminGetReportData } from "@/lib/data/admin/reports";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const data = await adminGetReportData();

  return (
    <div>
      <AdminHeader title="Reports" subtitle="Last 30 days" />
      <div className="px-4 sm:px-6 py-5 max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Attempts" value={data.totalAttempts} icon={<span>📝</span>} />
          <StatCard label="Pass rate" value={`${data.passRate}%`} iconBg="bg-green-50" icon={<span className="text-success">✓</span>} />
          <StatCard label="Topic coverage" value={`${data.completionRate}%`} iconBg="bg-blue-50" icon={<span className="text-primary">%</span>} />
        </div>
        <Card>
          <h3 className="font-heading font-semibold mb-3">Attempts over time</h3>
          <div className="flex items-end gap-0.5 h-40 overflow-x-auto">
            {data.attemptsOverTime.map((d) => {
              const max = Math.max(1, ...data.attemptsOverTime.map((x) => x.count));
              const h = Math.round((d.count / max) * 100);
              return (
                <div key={d.day} className="flex-1 min-w-[8px] flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full bg-primary/30 rounded-t"
                    style={{ height: `${Math.max(h, 2)}%` }}
                    title={`${d.day}: ${d.count}`}
                  />
                </div>
              );
            })}
          </div>
          {data.totalAttempts === 0 && (
            <p className="text-sm text-text-muted text-center py-4">No attempt data yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

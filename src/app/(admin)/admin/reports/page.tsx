"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../layout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/admin/StatCard";
import RevenueChart from "@/components/admin/RevenueChart";
import { reportData } from "@/lib/mock/adminStats";
import { adminStats } from "@/lib/mock/adminStats";
import { useToast } from "@/components/ui/Toast";

export default function AdminReportsPage() {
  const openMenu = useAdminMenu();
  const { showToast } = useToast();

  const handleExport = () => {
    // TODO: replace with API call — mock CSV download
    const rows = [
      ["Month", "Avg Score"],
      ...reportData.scoresOverTime.map((r) => [r.month, String(r.avgScore)]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exam-bridge-scores.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exported", "success");
  };

  return (
    <div>
      <AdminHeader
        title="Reports"
        subtitle="Analytics overview"
        onMenuClick={openMenu}
        actions={<Button size="sm" variant="outline" onClick={handleExport}>Export CSV</Button>}
      />
      <div className="px-4 sm:px-6 py-5 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Avg score" value={`${adminStats.avgScore}%`} icon={<span className="text-primary">%</span>} />
          <StatCard label="Completion" value={`${adminStats.completionRate}%`} iconBg="bg-green-50" icon={<span className="text-success">✓</span>} />
          <StatCard label="Exams today" value={adminStats.examsTakenToday} iconBg="bg-amber-50" icon={<span className="text-warning">📝</span>} />
          <StatCard label="Students" value={adminStats.totalStudents.toLocaleString()} iconBg="bg-blue-50" icon={<span className="text-primary">👥</span>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-heading font-semibold text-text-primary mb-4">Scores over time</h3>
            <RevenueChart
              data={reportData.scoresOverTime.map((d) => ({ label: d.month, value: d.avgScore }))}
              height={180}
              color="#10B981"
            />
          </Card>
          <Card>
            <h3 className="font-heading font-semibold text-text-primary mb-4">Subject performance</h3>
            <div className="space-y-3">
              {reportData.subjectPerformance.map((s) => (
                <div key={s.subject}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{s.subject}</span>
                    <span className="text-text-muted">{s.avgScore}% · {s.attempts}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${s.avgScore}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <h3 className="font-heading font-semibold text-text-primary mb-4">Exam completion</h3>
          <div className="space-y-3">
            {reportData.examCompletion.map((e) => {
              const rate = e.started ? Math.round((e.completed / e.started) * 100) : 0;
              return (
                <div key={e.exam} className="flex items-center justify-between text-sm">
                  <span className="text-text-primary">{e.exam}</span>
                  <span className="text-text-muted">
                    {e.completed}/{e.started} ({rate}%)
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

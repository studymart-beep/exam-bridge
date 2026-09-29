"use client";

import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import ActivityFeed from "@/components/admin/ActivityFeed";
import RevenueChart from "@/components/admin/RevenueChart";
import Card from "@/components/ui/Card";
import { useAdminMenu } from "../layout";
import { adminStats, adminActivity, reportData } from "@/lib/mock/adminStats";

function formatNaira(amount: number): string {
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(0)}K`;
  }
  return `₦${amount.toLocaleString()}`;
}

export default function AdminDashboardPage() {
  const openMenu = useAdminMenu();

  return (
    <div>
      <AdminHeader
        title="Dashboard"
        subtitle="Platform overview"
        onMenuClick={openMenu}
      />

      <div className="px-4 sm:px-6 py-5 max-w-7xl mx-auto space-y-6">
        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            label="Total Students"
            value={adminStats.totalStudents.toLocaleString()}
            change={adminStats.studentsChange}
            icon={
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
          <StatCard
            label="Active Subscriptions"
            value={adminStats.activeSubscriptions.toLocaleString()}
            change={adminStats.subscriptionsChange}
            iconBg="bg-green-50"
            icon={
              <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            }
          />
          <StatCard
            label="Exams Today"
            value={adminStats.examsTakenToday.toLocaleString()}
            change={adminStats.examsChange}
            iconBg="bg-amber-50"
            icon={
              <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
          <StatCard
            label="Revenue (Month)"
            value={formatNaira(adminStats.revenueThisMonth)}
            change={adminStats.revenueChange}
            iconBg="bg-purple-50"
            icon={
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            label="Avg Score"
            value={`${adminStats.avgScore}%`}
            iconBg="bg-blue-50"
            icon={
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <StatCard
            label="Completion Rate"
            value={`${adminStats.completionRate}%`}
            iconBg="bg-green-50"
            icon={
              <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Charts + activity */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Weekly exams chart */}
          <Card className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-text-primary">
                Exams this week
              </h3>
              <Link
                href="/admin/reports"
                className="text-xs font-medium text-primary hover:underline"
              >
                View reports →
              </Link>
            </div>
            <RevenueChart
              data={reportData.dailyExams.map((d) => ({
                label: d.day,
                value: d.count,
              }))}
              height={180}
            />
          </Card>

          {/* Subject performance */}
          <Card className="lg:col-span-2">
            <h3 className="font-heading font-semibold text-text-primary mb-4">
              Subject performance
            </h3>
            <div className="space-y-3">
              {reportData.subjectPerformance.map((s) => (
                <div key={s.subject}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-primary">{s.subject}</span>
                    <span className="text-xs font-medium text-text-secondary">
                      {s.avgScore}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${s.avgScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {s.attempts} attempts
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent activity */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-text-primary">
              Recent activity
            </h3>
            <Link
              href="/admin/users"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all →
            </Link>
          </div>
          <ActivityFeed items={adminActivity} />
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/admin/users", label: "Manage users", icon: "👥" },
            { href: "/admin/payments", label: "Review payments", icon: "💳" },
            { href: "/admin/cbt", label: "CBT exams", icon: "📝" },
            { href: "/admin/notifications", label: "Send notice", icon: "🔔" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-card hover:border-gray-200 transition-all text-center"
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-medium text-text-primary">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

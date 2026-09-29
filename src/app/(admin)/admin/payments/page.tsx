"use client";

// TODO: activate when payment integration is enabled (Phase 15)

import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../layout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/admin/StatCard";
import DataTable, { type Column } from "@/components/admin/DataTable";
import { adminPayments } from "@/lib/mock/adminPayments";
import { formatDate } from "@/lib/utils";
import type { Payment } from "@/types";

export default function AdminPaymentsPage() {
  const openMenu = useAdminMenu();

  const verified = adminPayments.filter((p) => p.status === "verified");
  const revenue = verified.reduce((sum, p) => sum + p.amount, 0);
  const pending = adminPayments.filter((p) => p.status === "pending").length;

  const columns: Column<Payment>[] = [
    {
      key: "user",
      header: "Student",
      render: (p) => (
        <div>
          <p className="font-medium">{p.userName}</p>
          <p className="text-xs text-text-muted">{p.userEmail}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (p) => `₦${p.amount.toLocaleString()}`,
    },
    {
      key: "method",
      header: "Method",
      className: "hidden sm:table-cell",
      render: (p) => p.method.replace("_", " "),
    },
    {
      key: "date",
      header: "Date",
      className: "hidden md:table-cell",
      render: (p) => formatDate(p.createdAt),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <Badge
          variant={
            p.status === "verified" ? "success" : p.status === "pending" ? "warning" : "error"
          }
        >
          {p.status}
        </Badge>
      ),
    },
    {
      key: "proof",
      header: "Proof",
      className: "hidden lg:table-cell",
      render: () => (
        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-[10px] text-text-muted">
          img
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader
        title="Payments"
        subtitle="Payment records"
        onMenuClick={openMenu}
        actions={
          <button
            type="button"
            disabled
            title="Payment activation not enabled yet"
            className="h-9 px-3 text-sm font-medium rounded-xl border border-gray-200 text-text-muted opacity-50 cursor-not-allowed"
          >
            Export CSV
          </button>
        }
      />
      <div className="px-4 sm:px-6 py-5 max-w-7xl mx-auto space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
          Payment system is built but not yet activated.
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Verified revenue" value={`₦${(revenue / 1000).toFixed(0)}K`} icon={<span className="text-success">₦</span>} iconBg="bg-green-50" />
          <StatCard label="Pending" value={pending} iconBg="bg-amber-50" icon={<span className="text-warning">⏳</span>} />
          <StatCard label="Total records" value={adminPayments.length} iconBg="bg-blue-50" icon={<span className="text-primary">📋</span>} />
        </div>

        <Card padding="none" className="overflow-hidden">
          <div className="p-2 sm:p-4">
            <DataTable
              columns={columns}
              data={adminPayments}
              keyExtractor={(p) => p.id}
              emptyMessage="No payments"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

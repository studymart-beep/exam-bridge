"use client";

// TODO: activate when payment integration is enabled (Phase 15)

import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../layout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/admin/DataTable";
import { adminSubscriptions } from "@/lib/mock/adminSubscriptions";
import { formatDate } from "@/lib/utils";
import type { Subscription } from "@/types";

const statusVariant: Record<string, "success" | "warning" | "error" | "default"> = {
  active: "success",
  pending: "warning",
  expired: "error",
  inactive: "default",
};

export default function AdminSubscriptionsPage() {
  const openMenu = useAdminMenu();

  const columns: Column<Subscription>[] = [
    {
      key: "user",
      header: "Student",
      render: (s) => (
        <div>
          <p className="font-medium">{s.userName}</p>
          <p className="text-xs text-text-muted">{s.userEmail}</p>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      render: (s) => s.plan,
    },
    {
      key: "dates",
      header: "Period",
      className: "hidden sm:table-cell",
      render: (s) => (
        <span className="text-xs">
          {formatDate(s.startsAt)} – {formatDate(s.expiresAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <Badge variant={statusVariant[s.status] || "default"}>{s.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: () => (
        <div className="flex gap-2">
          <button
            type="button"
            disabled
            title="Payment activation not enabled yet"
            className="text-xs text-text-muted opacity-50 cursor-not-allowed"
          >
            Approve
          </button>
          <button
            type="button"
            disabled
            title="Payment activation not enabled yet"
            className="text-xs text-text-muted opacity-50 cursor-not-allowed"
          >
            Reject
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader title="Subscriptions" subtitle="Subscription records" onMenuClick={openMenu} />
      <div className="px-4 sm:px-6 py-5 max-w-7xl mx-auto space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
          Payment system is built but not yet activated.
        </div>
        <Card padding="none" className="overflow-hidden">
          <div className="p-2 sm:p-4">
            <DataTable
              columns={columns}
              data={adminSubscriptions}
              keyExtractor={(s) => s.id}
              emptyMessage="No subscriptions"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../layout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import DataTable, { type Column } from "@/components/admin/DataTable";
import { adminUsers } from "@/lib/mock/adminUsers";
import { formatDate } from "@/lib/utils";
import type { AdminUser, AdminUserStatus } from "@/types";

const statusVariant: Record<AdminUserStatus, "success" | "warning" | "error" | "default"> = {
  active: "success",
  free: "default",
  expired: "warning",
  suspended: "error",
};

export default function AdminUsersPage() {
  const openMenu = useAdminMenu();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return adminUsers.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchStatus = status === "all" || u.status === status;
      return matchSearch && matchStatus;
    });
  }, [search, status]);

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: "Student",
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar initials={u.initials} size="sm" />
          <div>
            <p className="font-medium text-text-primary">{u.fullName}</p>
            <p className="text-xs text-text-muted sm:hidden">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      className: "hidden sm:table-cell",
      render: (u) => <span className="text-text-secondary">{u.email}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <Badge variant={statusVariant[u.status]}>{u.status}</Badge>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      className: "hidden md:table-cell",
      render: (u) => formatDate(u.joinedAt),
    },
    {
      key: "exams",
      header: "Exams",
      className: "hidden lg:table-cell",
      render: (u) => `${u.examsTaken} · avg ${u.avgScore}%`,
    },
    {
      key: "actions",
      header: "",
      render: (u) => (
        <Link
          href={`/admin/users/${u.id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader title="Students" subtitle={`${filtered.length} students`} onMenuClick={openMenu} />
      <div className="px-4 sm:px-6 py-5 max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "all", label: "All statuses" },
                { value: "active", label: "Active" },
                { value: "free", label: "Free" },
                { value: "expired", label: "Expired" },
                { value: "suspended", label: "Suspended" },
              ]}
            />
          </div>
        </div>
        <Card padding="none" className="overflow-hidden">
          <div className="p-2 sm:p-4">
            <DataTable
              columns={columns}
              data={filtered}
              keyExtractor={(u) => u.id}
              emptyMessage="No students found"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

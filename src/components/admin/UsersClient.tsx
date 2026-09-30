"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";

type Student = {
  id: string;
  full_name: string | null;
  email: string | null;
  status: string;
  subscription_expires_at: string | null;
  created_at: string;
};

export default function UsersClient({ students }: { students: Student[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchQ =
        !q ||
        (s.full_name || "").toLowerCase().includes(q.toLowerCase()) ||
        (s.email || "").toLowerCase().includes(q.toLowerCase());
      const matchS = status === "all" || s.status === status;
      return matchQ && matchS;
    });
  }, [students, q, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-11 px-3 rounded-xl border border-gray-200 text-sm bg-white"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>
      <div className="space-y-2">
        {filtered.map((s) => {
          const initials = (s.full_name || s.email || "?")
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return (
            <Link key={s.id} href={`/admin/users/${s.id}`}>
              <Card className="flex items-center gap-3 hover:shadow-card transition-shadow">
                <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-bold">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{s.full_name || "—"}</p>
                  <p className="text-xs text-text-muted truncate">{s.email}</p>
                </div>
                <Badge
                  variant={
                    s.status === "active" ? "success" : s.status === "expired" ? "warning" : "default"
                  }
                >
                  {s.status}
                </Badge>
              </Card>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-text-muted py-8">No matches.</p>
        )}
      </div>
    </div>
  );
}

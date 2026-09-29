"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../layout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { announcements } from "@/lib/mock/adminReports";
import { formatDate } from "@/lib/utils";

export default function AdminAnnouncementsPage() {
  const openMenu = useAdminMenu();

  return (
    <div>
      <AdminHeader title="Announcements" subtitle="Published notices" onMenuClick={openMenu} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-3">
        {announcements.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-heading font-semibold text-text-primary">{a.title}</h3>
                <p className="text-sm text-text-secondary mt-1">{a.body}</p>
                <p className="text-xs text-text-muted mt-2">{formatDate(a.createdAt)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={a.published ? "success" : "default"}>
                  {a.published ? "Published" : "Draft"}
                </Badge>
                <Badge variant="info">{a.audience}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

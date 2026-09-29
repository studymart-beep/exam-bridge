"use client";

import { useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../layout";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { adminSentNotifications } from "@/lib/mock/adminNotificationsSent";
import { formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import type { AdminSentNotification } from "@/types";

export default function AdminNotificationsPage() {
  const openMenu = useAdminMenu();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [sent, setSent] = useState<AdminSentNotification[]>([...adminSentNotifications]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSend = () => {
    const err: Record<string, string> = {};
    if (!title.trim()) err.title = "Title required";
    if (!message.trim()) err.message = "Message required";
    setErrors(err);
    if (Object.keys(err).length) return;

    // TODO: replace with API call
    const count = audience === "all" ? 2847 : audience === "active" ? 1523 : 890;
    setSent((prev) => [
      {
        id: `sn-${Date.now()}`,
        title: title.trim(),
        message: message.trim(),
        audience: audience as AdminSentNotification["audience"],
        recipientCount: count,
        sentAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setTitle("");
    setMessage("");
    showToast(`Notification sent to ${count} students (mock)`, "success");
  };

  return (
    <div>
      <AdminHeader title="Notifications" subtitle="Send in-app messages" onMenuClick={openMenu} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-6">
        <Card className="space-y-4">
          <h3 className="font-heading font-semibold text-text-primary">Compose</h3>
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} placeholder="Notification title" />
          <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} error={errors.message} placeholder="Write your message..." />
          <Select
            label="Audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            options={[
              { value: "all", label: "All students" },
              { value: "active", label: "Active subscribers" },
              { value: "free", label: "Free users" },
              { value: "expired", label: "Expired" },
            ]}
          />
          {(title || message) && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-text-muted mb-1">Preview</p>
              <p className="text-sm font-medium">{title || "Title"}</p>
              <p className="text-sm text-text-secondary mt-0.5">{message || "Message"}</p>
            </div>
          )}
          <Button onClick={handleSend}>Send notification</Button>
        </Card>

        <div>
          <h3 className="font-heading font-semibold text-text-primary mb-3">Sent history</h3>
          <div className="space-y-2">
            {sent.map((n) => (
              <Card key={n.id} padding="sm" className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{n.title}</p>
                  <p className="text-xs text-text-muted line-clamp-1">{n.message}</p>
                  <p className="text-[11px] text-text-muted mt-1">{formatDateTime(n.sentAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge variant="info">{n.audience}</Badge>
                  <p className="text-[11px] text-text-muted mt-1">{n.recipientCount} recipients</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

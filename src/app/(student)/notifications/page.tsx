"use client";

import { useState } from "react";
import StudentHeader from "@/components/student/StudentHeader";
import NotificationItem from "@/components/student/NotificationItem";
import { notifications as mockNotifications } from "@/lib/mock/notifications";
import type { Notification } from "@/types";

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>(mockNotifications);

  const handleClick = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <div>
      <StudentHeader title="Notifications" />

      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold text-text-primary">
              Notifications
            </h2>
            <p className="text-sm text-text-secondary">
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </p>
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-primary font-medium hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>

        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={() => handleClick(n.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-text-muted text-sm">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

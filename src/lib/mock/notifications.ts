import type { Notification } from "@/types";

export const notifications: Notification[] = [
  {
    id: "notif-1",
    title: "CBT Result Ready",
    message: "Your Biology Cell Structure CBT score is ready. You scored 78%.",
    type: "exam",
    read: false,
    createdAt: "2026-09-27T16:20:00",
  },
  {
    id: "notif-2",
    title: "Subscription Active",
    message: "Your Exam Bridge Premium subscription is active and expires in 18 days.",
    type: "success",
    read: false,
    createdAt: "2026-09-26T09:00:00",
  },
  {
    id: "notif-3",
    title: "New Topic Available",
    message: "Meiosis has been added to Cell Biology. Start learning now!",
    type: "info",
    read: true,
    createdAt: "2026-09-25T12:30:00",
  },
  {
    id: "notif-4",
    title: "Study Streak",
    message: "Great job! You've studied for 5 days in a row. Keep it up!",
    type: "success",
    read: true,
    createdAt: "2026-09-24T08:15:00",
  },
  {
    id: "notif-5",
    title: "Payment Reminder",
    message: "Your subscription expires in 18 days. Renew early to avoid interruption.",
    type: "warning",
    read: false,
    createdAt: "2026-09-23T10:00:00",
  },
];

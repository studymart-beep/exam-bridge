import type { AdminSentNotification } from "@/types";

// TODO: replace with API call
export const adminSentNotifications: AdminSentNotification[] = [
  { id: "sn-1", title: "New Biology topics available", message: "We've added Meiosis and Genetics modules.", audience: "all", recipientCount: 2847, sentAt: "2026-09-25T10:00:00" },
  { id: "sn-2", title: "Subscription renewal reminder", message: "Your plan expires soon. Renew early.", audience: "active", recipientCount: 1523, sentAt: "2026-09-20T08:00:00" },
  { id: "sn-3", title: "Welcome offer for free users", message: "Subscribe this week and get 3 extra days free.", audience: "free", recipientCount: 890, sentAt: "2026-09-18T12:00:00" },
  { id: "sn-4", title: "CBT maintenance notice", message: "CBT practice will be offline Sunday 2–4 AM.", audience: "all", recipientCount: 2847, sentAt: "2026-09-15T16:00:00" },
  { id: "sn-5", title: "New Mathematics CBT", message: "Quadratic Equations CBT is now live.", audience: "active", recipientCount: 1523, sentAt: "2026-09-12T09:00:00" },
];

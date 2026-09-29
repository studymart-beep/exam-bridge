import type { Announcement } from "@/types";
import { reportData } from "./adminStats";

// Re-export report data for convenience
// TODO: replace with API call
export { reportData };

// TODO: replace with API call
export const announcements: Announcement[] = [
  {
    id: "ann-1",
    title: "New Biology topics available",
    body: "We've added Meiosis and Genetics modules. Start practicing today!",
    audience: "all",
    createdAt: "2026-09-25T10:00:00",
    published: true,
  },
  {
    id: "ann-2",
    title: "Subscription renewal reminder",
    body: "Your plan expires soon. Renew early to keep uninterrupted access.",
    audience: "active",
    createdAt: "2026-09-20T08:00:00",
    published: true,
  },
  {
    id: "ann-3",
    title: "Welcome offer for free users",
    body: "Subscribe this week and get 3 extra days free on your first month.",
    audience: "free",
    createdAt: "2026-09-18T12:00:00",
    published: false,
  },
];

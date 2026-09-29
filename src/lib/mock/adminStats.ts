import type { AdminStats, AdminActivityItem, ReportData } from "@/types";

// TODO: replace with API call
export const adminStats: AdminStats = {
  totalStudents: 2847,
  activeSubscriptions: 1523,
  examsTakenToday: 342,
  revenueThisMonth: 4_850_000,
  avgScore: 68,
  completionRate: 74,
  studentsChange: 12.4,
  subscriptionsChange: 8.2,
  examsChange: 15.6,
  revenueChange: 22.1,
};

// TODO: replace with API call
export const adminActivity: AdminActivityItem[] = [
  {
    id: "act-1",
    type: "payment",
    title: "Payment verified",
    subtitle: "Ada Okafor · ₦5,000 · Bank transfer",
    createdAt: "2026-09-28T20:15:00",
  },
  {
    id: "act-2",
    type: "user",
    title: "New student registered",
    subtitle: "Chidi Okonkwo · chidi.o@email.com",
    createdAt: "2026-09-28T19:42:00",
  },
  {
    id: "act-3",
    type: "exam",
    title: "CBT completed",
    subtitle: "Cell Structure CBT · Score 78% · Biology",
    createdAt: "2026-09-28T18:30:00",
  },
  {
    id: "act-4",
    type: "subscription",
    title: "Subscription expired",
    subtitle: "Blessing Eze · Monthly plan",
    createdAt: "2026-09-28T16:00:00",
  },
  {
    id: "act-5",
    type: "content",
    title: "New topic published",
    subtitle: "Meiosis · Cell Biology · Biology",
    createdAt: "2026-09-28T14:20:00",
  },
  {
    id: "act-6",
    type: "payment",
    title: "Payment pending review",
    subtitle: "Tunde Bakare · ₦5,000 · Awaiting proof",
    createdAt: "2026-09-28T12:05:00",
  },
  {
    id: "act-7",
    type: "exam",
    title: "High volume today",
    subtitle: "342 exams taken · +16% vs yesterday",
    createdAt: "2026-09-28T11:00:00",
  },
];

// TODO: replace with API call
export const reportData: ReportData = {
  scoresOverTime: [
    { month: "Apr", avgScore: 58 },
    { month: "May", avgScore: 61 },
    { month: "Jun", avgScore: 63 },
    { month: "Jul", avgScore: 65 },
    { month: "Aug", avgScore: 67 },
    { month: "Sep", avgScore: 68 },
  ],
  subjectPerformance: [
    { subject: "Mathematics", avgScore: 64, attempts: 890 },
    { subject: "Biology", avgScore: 72, attempts: 1120 },
    { subject: "English", avgScore: 70, attempts: 980 },
    { subject: "Chemistry", avgScore: 61, attempts: 740 },
    { subject: "Physics", avgScore: 58, attempts: 650 },
  ],
  examCompletion: [
    { exam: "Cell Structure CBT", started: 420, completed: 380 },
    { exam: "Linear Equations", started: 350, completed: 310 },
    { exam: "Atomic Structure", started: 280, completed: 245 },
    { exam: "Motion & Velocity", started: 210, completed: 175 },
  ],
  dailyExams: [
    { day: "Mon", count: 280 },
    { day: "Tue", count: 310 },
    { day: "Wed", count: 295 },
    { day: "Thu", count: 340 },
    { day: "Fri", count: 360 },
    { day: "Sat", count: 420 },
    { day: "Sun", count: 342 },
  ],
};

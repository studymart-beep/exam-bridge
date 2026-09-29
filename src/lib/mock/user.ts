import type { User, ContinueLearning, ActivityItem } from "@/types";

export const currentUser: User = {
  id: "user-1",
  fullName: "Ada Okafor",
  email: "ada.okafor@email.com",
  phone: "+234 810 123 4567",
  initials: "AO",
  subscription: {
    status: "active",
    expiresAt: "2026-10-16",
    daysRemaining: 18,
  },
};

export const continueLearning: ContinueLearning = {
  topicId: "topic-bio-1",
  courseId: "course-bio-1",
  title: "Cell Structure and Functions",
  subjectName: "Biology",
  level: "SSS 2",
  progress: 72,
  imageColor: "#D1FAE5",
};

export const recentActivity: ActivityItem[] = [
  {
    id: "act-1",
    type: "cbt",
    title: "Completed CBT Practice",
    subtitle: "Mathematics · 40 Questions",
    date: "Today · 9:30 AM",
    icon: "document",
  },
  {
    id: "act-2",
    type: "test",
    title: "Biology Test",
    subtitle: "SSS 2 · Score: 78%",
    date: "Yesterday · 4:15 PM",
    icon: "trophy",
  },
  {
    id: "act-3",
    type: "milestone",
    title: "Progress Milestone",
    subtitle: "You improved 15% this week",
    date: "May 18 · 11:20 AM",
    icon: "chart",
  },
];

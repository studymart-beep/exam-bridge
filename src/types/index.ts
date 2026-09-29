export type SubscriptionStatus = "active" | "inactive" | "pending" | "expired";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  initials: string;
  subscription: {
    status: SubscriptionStatus;
    expiresAt: string | null;
    daysRemaining: number | null;
  };
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  letter: string;
  color: string;
  bgColor: string;
  topicCount: number;
  description: string;
}

export interface Course {
  id: string;
  subjectId: string;
  subjectSlug: string;
  title: string;
  description: string;
  topicCount: number;
  progress: number;
  level: string;
}

export interface Topic {
  id: string;
  courseId: string;
  title: string;
  description: string;
  progress: number;
  duration: string;
  hasVideo: boolean;
  hasPdf: boolean;
  hasImages: boolean;
  hasCbt: boolean;
  cbtId?: string;
  completed: boolean;
}

export interface CBTQuestion {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
}

export interface CBTExam {
  id: string;
  title: string;
  courseId: string;
  topicId?: string;
  subjectName: string;
  questionCount: number;
  durationMinutes: number;
  passMark: number;
  status: "not_started" | "in_progress" | "completed";
  questions: CBTQuestion[];
  instructions: string[];
}

export interface CBTAttempt {
  id: string;
  examId: string;
  examTitle: string;
  subjectName: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  passed: boolean;
  timeUsedSeconds: number;
  completedAt: string;
  answers: Record<string, "A" | "B" | "C" | "D" | null>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "exam";
  read: boolean;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: "cbt" | "test" | "milestone" | "topic";
  title: string;
  subtitle: string;
  date: string;
  icon: "document" | "trophy" | "chart" | "book";
}

export interface ContinueLearning {
  topicId: string;
  courseId: string;
  title: string;
  subjectName: string;
  level: string;
  progress: number;
  imageColor: string;
}

/* ── Admin types ─────────────────────────────────────────── */

export type AdminRole = "super_admin" | "admin" | "content_manager";

export type AdminUserStatus = "active" | "free" | "expired" | "suspended";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  initials: string;
  status: AdminUserStatus;
  subscriptionStatus: SubscriptionStatus;
  joinedAt: string;
  lastActiveAt: string;
  examsTaken: number;
  avgScore: number;
}

export interface AdminStats {
  totalStudents: number;
  activeSubscriptions: number;
  examsTakenToday: number;
  revenueThisMonth: number;
  avgScore: number;
  completionRate: number;
  studentsChange: number;
  subscriptionsChange: number;
  examsChange: number;
  revenueChange: number;
}

export type PaymentStatus = "pending" | "verified" | "rejected";

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  method: "bank_transfer" | "card";
  status: PaymentStatus;
  reference: string;
  proofUrl?: string;
  createdAt: string;
  verifiedAt?: string;
}

export type SubscriptionPlan = "monthly" | "termly" | "yearly";

export interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  amount: number;
  startsAt: string;
  expiresAt: string;
  paymentId?: string;
}

export interface ReportData {
  scoresOverTime: { month: string; avgScore: number }[];
  subjectPerformance: { subject: string; avgScore: number; attempts: number }[];
  examCompletion: { exam: string; started: number; completed: number }[];
  dailyExams: { day: string; count: number }[];
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: "all" | "active" | "free";
  createdAt: string;
  published: boolean;
}

export interface AdminActivityItem {
  id: string;
  type: "user" | "payment" | "exam" | "subscription" | "content";
  title: string;
  subtitle: string;
  createdAt: string;
}

/* ── Admin Phase 2–4 types ───────────────────────────────── */

export interface AdminSubject {
  id: string;
  name: string;
  slug: string;
  letter: string;
  color: string;
  bgColor: string;
  description: string;
  topicCount: number;
  order: number;
  published: boolean;
}

export interface AdminCourse {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  description: string;
  level: string;
  topicCount: number;
  published: boolean;
  order: number;
}

export interface AdminTopic {
  id: string;
  courseId: string;
  subjectId: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  published: boolean;
  hasVideo: boolean;
  hasPdf: boolean;
  hasCbt: boolean;
}

export interface AdminCbtExam {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  courseId: string;
  courseName: string;
  questionCount: number;
  durationMinutes: number;
  passMark: number;
  status: "draft" | "published" | "archived";
  attemptsCount: number;
  avgScore: number;
  passRate: number;
  createdAt: string;
}

export interface AdminCbtQuestion {
  id: string;
  examId: string;
  order: number;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  imageUrl?: string;
}

export interface AdminSentNotification {
  id: string;
  title: string;
  message: string;
  audience: "all" | "active" | "free" | "expired";
  recipientCount: number;
  sentAt: string;
}

export interface PlatformSettings {
  subscriptionPrice: number;
  defaultExamDuration: number;
  defaultPassMark: number;
  appName: string;
  logoUrl?: string;
}

/* ── Admin v2 — Materials & CBT attachment ───────────────── */

export type MaterialType = "video" | "pdf" | "image";

export interface Material {
  id: string;
  topicId: string;
  type: MaterialType;
  title: string;
  /** Cloudflare Stream video ID, or filename for pdf/image */
  source: string;
  orderIndex: number;
  createdAt: string;
}

export interface TopicCbtLink {
  topicId: string;
  cbtExamId: string | null;
}

export interface CourseCbtLink {
  courseId: string;
  cbtExamId: string | null;
}

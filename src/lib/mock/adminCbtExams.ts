import type { AdminCbtExam } from "@/types";

// TODO: replace with API call
export const adminCbtExams: AdminCbtExam[] = [
  { id: "cbt-bio-1", title: "Cell Structure CBT", subjectId: "subj-bio", subjectName: "Biology", courseId: "course-bio-1", courseName: "Cell Biology", questionCount: 5, durationMinutes: 15, passMark: 50, status: "published", attemptsCount: 420, avgScore: 72, passRate: 78, createdAt: "2026-08-01T10:00:00" },
  { id: "cbt-math-1", title: "Linear Equations Practice", subjectId: "subj-math", subjectName: "Mathematics", courseId: "course-math-1", courseName: "Algebra & Equations", questionCount: 5, durationMinutes: 20, passMark: 60, status: "published", attemptsCount: 350, avgScore: 68, passRate: 71, createdAt: "2026-08-05T10:00:00" },
  { id: "cbt-math-2", title: "Quadratic Equations CBT", subjectId: "subj-math", subjectName: "Mathematics", courseId: "course-math-1", courseName: "Algebra & Equations", questionCount: 5, durationMinutes: 25, passMark: 50, status: "published", attemptsCount: 210, avgScore: 61, passRate: 65, createdAt: "2026-08-12T10:00:00" },
  { id: "cbt-phy-1", title: "Motion & Velocity CBT", subjectId: "subj-phy", subjectName: "Physics", courseId: "course-phy-1", courseName: "Mechanics", questionCount: 5, durationMinutes: 15, passMark: 50, status: "published", attemptsCount: 180, avgScore: 58, passRate: 55, createdAt: "2026-08-20T10:00:00" },
  { id: "cbt-chem-1", title: "Atomic Structure CBT", subjectId: "subj-chem", subjectName: "Chemistry", courseId: "course-chem-1", courseName: "Atomic Structure & Bonding", questionCount: 5, durationMinutes: 15, passMark: 50, status: "published", attemptsCount: 245, avgScore: 70, passRate: 74, createdAt: "2026-09-01T10:00:00" },
  { id: "cbt-eng-1", title: "Comprehension Practice", subjectId: "subj-eng", subjectName: "English Language", courseId: "course-eng-1", courseName: "Comprehension & Summary", questionCount: 10, durationMinutes: 30, passMark: 50, status: "draft", attemptsCount: 0, avgScore: 0, passRate: 0, createdAt: "2026-09-20T10:00:00" },
];

export function getAdminCbtById(id: string): AdminCbtExam | undefined {
  return adminCbtExams.find((e) => e.id === id);
}

import type { CBTAttempt } from "@/types";

export const pastResults: CBTAttempt[] = [
  {
    id: "attempt-1",
    examId: "cbt-bio-1",
    examTitle: "Cell Structure CBT",
    subjectName: "Biology",
    score: 78,
    totalQuestions: 5,
    correctCount: 4,
    passed: true,
    timeUsedSeconds: 1440,
    completedAt: "2026-09-27T16:15:00",
    answers: {
      q1: "A",
      q2: "B",
      q3: "C",
      q4: "B",
      q5: "B",
    },
  },
  {
    id: "attempt-2",
    examId: "cbt-math-1",
    examTitle: "Linear Equations Practice",
    subjectName: "Mathematics",
    score: 80,
    totalQuestions: 5,
    correctCount: 4,
    passed: true,
    timeUsedSeconds: 900,
    completedAt: "2026-09-28T09:30:00",
    answers: {
      mq1: "A",
      mq2: "B",
      mq3: "A",
      mq4: "C",
      mq5: "A",
    },
  },
  {
    id: "attempt-3",
    examId: "cbt-phy-1",
    examTitle: "Motion & Velocity CBT",
    subjectName: "Physics",
    score: 40,
    totalQuestions: 5,
    correctCount: 2,
    passed: false,
    timeUsedSeconds: 600,
    completedAt: "2026-09-25T11:00:00",
    answers: {
      pq1: "A",
      pq2: "B",
      pq3: "A",
      pq4: "B",
      pq5: "C",
    },
  },
  {
    id: "attempt-4",
    examId: "cbt-chem-1",
    examTitle: "Atomic Structure CBT",
    subjectName: "Chemistry",
    score: 100,
    totalQuestions: 5,
    correctCount: 5,
    passed: true,
    timeUsedSeconds: 480,
    completedAt: "2026-09-20T14:22:00",
    answers: {
      cq1: "B",
      cq2: "B",
      cq3: "C",
      cq4: "A",
      cq5: "C",
    },
  },
  {
    id: "attempt-5",
    examId: "cbt-math-2",
    examTitle: "Quadratic Equations CBT",
    subjectName: "Mathematics",
    score: 60,
    totalQuestions: 5,
    correctCount: 3,
    passed: true,
    timeUsedSeconds: 1100,
    completedAt: "2026-09-18T10:05:00",
    answers: {
      qq1: "A",
      qq2: "A",
      qq3: "C",
      qq4: "A",
      qq5: "B",
    },
  },
];

export function getResultById(id: string): CBTAttempt | undefined {
  return pastResults.find((r) => r.id === id);
}

export function getResultsByExamId(examId: string): CBTAttempt[] {
  return pastResults.filter((r) => r.examId === examId);
}

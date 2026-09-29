import type { CourseCbtLink } from "@/types";

// TODO: replace with API call
export const adminCourseCbtLinks: CourseCbtLink[] = [
  { courseId: "course-math-1", cbtExamId: "cbt-math-1" },
  { courseId: "course-bio-1", cbtExamId: "cbt-bio-1" },
  { courseId: "course-chem-1", cbtExamId: null },
  { courseId: "course-phy-1", cbtExamId: "cbt-phy-1" },
  { courseId: "course-eng-1", cbtExamId: null },
  { courseId: "course-math-2", cbtExamId: null },
  { courseId: "course-bio-2", cbtExamId: null },
];

export function getCourseCbtExamId(courseId: string): string | null {
  const link = adminCourseCbtLinks.find((l) => l.courseId === courseId);
  return link?.cbtExamId ?? null;
}

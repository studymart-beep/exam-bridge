import type { SubjectCbtLink } from "@/types";

// TODO: replace with API call
export const adminSubjectCbtLinks: SubjectCbtLink[] = [
  { subjectId: "subj-math", cbtExamId: "cbt-math-1" },
  { subjectId: "subj-bio", cbtExamId: "cbt-bio-1" },
  { subjectId: "subj-chem", cbtExamId: "cbt-chem-1" },
  { subjectId: "subj-phy", cbtExamId: "cbt-phy-1" },
  { subjectId: "subj-eng", cbtExamId: null },
  { subjectId: "subj-lit", cbtExamId: null },
  { subjectId: "subj-gov", cbtExamId: null },
  { subjectId: "subj-acc", cbtExamId: null },
];

export function getSubjectCbtExamId(subjectId: string): string | null {
  const link = adminSubjectCbtLinks.find((l) => l.subjectId === subjectId);
  return link?.cbtExamId ?? null;
}

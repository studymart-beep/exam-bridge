import type { TopicCbtLink } from "@/types";

// TODO: replace with API call
export const adminTopicCbtLinks: TopicCbtLink[] = [
  { topicId: "topic-math-1", cbtExamId: "cbt-math-1" },
  { topicId: "topic-math-2", cbtExamId: "cbt-math-2" },
  { topicId: "topic-math-3", cbtExamId: null },
  { topicId: "topic-bio-1", cbtExamId: "cbt-bio-1" },
  { topicId: "topic-bio-2", cbtExamId: null },
  { topicId: "topic-bio-3", cbtExamId: "cbt-bio-1" },
  { topicId: "topic-chem-1", cbtExamId: "cbt-chem-1" },
  { topicId: "topic-phy-1", cbtExamId: "cbt-phy-1" },
  { topicId: "topic-eng-1", cbtExamId: null },
];

export function getTopicCbtExamId(topicId: string): string | null {
  const link = adminTopicCbtLinks.find((l) => l.topicId === topicId);
  return link?.cbtExamId ?? null;
}

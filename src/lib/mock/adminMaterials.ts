import type { Material } from "@/types";

// TODO: replace with API call
export const adminMaterials: Material[] = [
  { id: "mat-1", topicId: "topic-math-1", type: "video", title: "Linear Equations Intro", source: "cf_vid_abc123def456", orderIndex: 1, createdAt: "2026-08-01T10:00:00" },
  { id: "mat-2", topicId: "topic-math-1", type: "pdf", title: "Linear Equations Notes", source: "linear-equations-notes.pdf", orderIndex: 2, createdAt: "2026-08-01T11:00:00" },
  { id: "mat-3", topicId: "topic-math-1", type: "image", title: "Graph of linear equation", source: "linear-graph-1.png", orderIndex: 3, createdAt: "2026-08-01T12:00:00" },
  { id: "mat-4", topicId: "topic-math-2", type: "video", title: "Quadratic Formula Walkthrough", source: "cf_vid_quad789xyz", orderIndex: 1, createdAt: "2026-08-05T10:00:00" },
  { id: "mat-5", topicId: "topic-math-2", type: "pdf", title: "Quadratic Practice Sheet", source: "quadratic-practice.pdf", orderIndex: 2, createdAt: "2026-08-05T11:00:00" },
  { id: "mat-6", topicId: "topic-bio-1", type: "video", title: "Cell Structure Tour", source: "cf_vid_cell001bio", orderIndex: 1, createdAt: "2026-08-10T09:00:00" },
  { id: "mat-7", topicId: "topic-bio-1", type: "pdf", title: "Organelle Summary", source: "organelles-summary.pdf", orderIndex: 2, createdAt: "2026-08-10T10:00:00" },
  { id: "mat-8", topicId: "topic-bio-1", type: "image", title: "Plant vs Animal Cell", source: "cell-comparison.jpg", orderIndex: 3, createdAt: "2026-08-10T11:00:00" },
  { id: "mat-9", topicId: "topic-bio-3", type: "video", title: "Mitosis Stages", source: "cf_vid_mitosis22", orderIndex: 1, createdAt: "2026-08-15T10:00:00" },
  { id: "mat-10", topicId: "topic-chem-1", type: "video", title: "Atomic Structure Basics", source: "cf_vid_atom55chem", orderIndex: 1, createdAt: "2026-09-01T10:00:00" },
  { id: "mat-11", topicId: "topic-chem-1", type: "pdf", title: "Periodic Table Handout", source: "periodic-table.pdf", orderIndex: 2, createdAt: "2026-09-01T11:00:00" },
  { id: "mat-12", topicId: "topic-phy-1", type: "video", title: "Motion Graphs Explained", source: "cf_vid_motion99phy", orderIndex: 1, createdAt: "2026-09-05T10:00:00" },
  { id: "mat-13", topicId: "topic-eng-1", type: "pdf", title: "Comprehension Passage Pack", source: "comprehension-pack.pdf", orderIndex: 1, createdAt: "2026-09-10T10:00:00" },
];

export function getMaterialsByTopicId(topicId: string): Material[] {
  return adminMaterials
    .filter((m) => m.topicId === topicId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

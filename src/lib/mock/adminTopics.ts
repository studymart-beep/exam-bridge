import type { AdminTopic } from "@/types";

// TODO: replace with API call
export const adminTopics: AdminTopic[] = [
  { id: "topic-math-1", courseId: "course-math-1", subjectId: "subj-math", title: "Linear Equations", description: "Solving ax + b = c.", duration: "25 min", order: 1, published: true, hasVideo: true, hasPdf: true, hasCbt: true },
  { id: "topic-math-2", courseId: "course-math-1", subjectId: "subj-math", title: "Quadratic Equations", description: "Factorisation and formula.", duration: "35 min", order: 2, published: true, hasVideo: true, hasPdf: true, hasCbt: true },
  { id: "topic-math-3", courseId: "course-math-1", subjectId: "subj-math", title: "Simultaneous Equations", description: "Two variables.", duration: "30 min", order: 3, published: true, hasVideo: true, hasPdf: true, hasCbt: false },
  { id: "topic-bio-1", courseId: "course-bio-1", subjectId: "subj-bio", title: "Cell Structure and Functions", description: "Organelles and roles.", duration: "30 min", order: 1, published: true, hasVideo: true, hasPdf: true, hasCbt: true },
  { id: "topic-bio-2", courseId: "course-bio-1", subjectId: "subj-bio", title: "Cell Membrane & Transport", description: "Diffusion and osmosis.", duration: "25 min", order: 2, published: true, hasVideo: true, hasPdf: true, hasCbt: false },
  { id: "topic-bio-3", courseId: "course-bio-1", subjectId: "subj-bio", title: "Mitosis", description: "Stages of mitosis.", duration: "28 min", order: 3, published: true, hasVideo: true, hasPdf: true, hasCbt: true },
  { id: "topic-chem-1", courseId: "course-chem-1", subjectId: "subj-chem", title: "Atomic Structure", description: "Protons, neutrons, electrons.", duration: "28 min", order: 1, published: true, hasVideo: true, hasPdf: true, hasCbt: true },
  { id: "topic-phy-1", courseId: "course-phy-1", subjectId: "subj-phy", title: "Motion & Velocity", description: "Speed and velocity graphs.", duration: "30 min", order: 1, published: true, hasVideo: true, hasPdf: true, hasCbt: true },
  { id: "topic-eng-1", courseId: "course-eng-1", subjectId: "subj-eng", title: "Reading Comprehension Skills", description: "Skimming and scanning.", duration: "25 min", order: 1, published: true, hasVideo: true, hasPdf: true, hasCbt: true },
];

export function getAdminTopicsByCourse(courseId: string): AdminTopic[] {
  return adminTopics.filter((t) => t.courseId === courseId).sort((a, b) => a.order - b.order);
}

export function getAdminTopicsBySubject(subjectId: string): AdminTopic[] {
  return adminTopics.filter((t) => t.subjectId === subjectId).sort((a, b) => a.order - b.order);
}

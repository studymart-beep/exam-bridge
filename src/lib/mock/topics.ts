import type { Topic } from "@/types";

export const topics: Topic[] = [
  { id: "topic-math-1", subjectId: "subj-math", subjectSlug: "mathematics", title: "Linear Equations", description: "Solving equations of the form ax + b = c and word problems.", progress: 100, duration: "25 min", order: 1, hasVideo: true, hasPdf: true, hasImages: true, hasCbt: true, cbtId: "cbt-math-1", completed: true },
  { id: "topic-math-2", subjectId: "subj-math", subjectSlug: "mathematics", title: "Quadratic Equations", description: "Factorisation, completing the square and quadratic formula.", progress: 80, duration: "35 min", order: 2, hasVideo: true, hasPdf: true, hasImages: false, hasCbt: true, cbtId: "cbt-math-2", completed: false },
  { id: "topic-math-3", subjectId: "subj-math", subjectSlug: "mathematics", title: "Simultaneous Equations", description: "Elimination and substitution methods for two variables.", progress: 40, duration: "30 min", order: 3, hasVideo: true, hasPdf: true, hasImages: true, hasCbt: false, completed: false },
  { id: "topic-math-4", subjectId: "subj-math", subjectSlug: "mathematics", title: "Inequalities", description: "Linear inequalities and graphical representation.", progress: 0, duration: "20 min", order: 4, hasVideo: true, hasPdf: true, hasImages: false, hasCbt: false, completed: false },
  { id: "topic-math-5", subjectId: "subj-math", subjectSlug: "mathematics", title: "Indices & Logarithms", description: "Laws of indices and introduction to logarithms.", progress: 0, duration: "40 min", order: 5, hasVideo: true, hasPdf: true, hasImages: true, hasCbt: true, cbtId: "cbt-math-1", completed: false },
  { id: "topic-bio-1", subjectId: "subj-bio", subjectSlug: "biology", title: "Cell Structure and Functions", description: "Animal and plant cells, organelles and their roles.", progress: 72, duration: "30 min", order: 1, hasVideo: true, hasPdf: true, hasImages: true, hasCbt: true, cbtId: "cbt-bio-1", completed: false },
  { id: "topic-bio-2", subjectId: "subj-bio", subjectSlug: "biology", title: "Cell Membrane & Transport", description: "Diffusion, osmosis and active transport.", progress: 50, duration: "25 min", order: 2, hasVideo: true, hasPdf: true, hasImages: false, hasCbt: false, completed: false },
  { id: "topic-bio-3", subjectId: "subj-bio", subjectSlug: "biology", title: "Mitosis", description: "Stages of mitosis and significance.", progress: 20, duration: "28 min", order: 3, hasVideo: true, hasPdf: true, hasImages: true, hasCbt: true, cbtId: "cbt-bio-1", completed: false },
  { id: "topic-chem-1", subjectId: "subj-chem", subjectSlug: "chemistry", title: "Atomic Structure", description: "Protons, neutrons, electrons and isotopes.", progress: 60, duration: "28 min", order: 1, hasVideo: true, hasPdf: true, hasImages: true, hasCbt: true, cbtId: "cbt-chem-1", completed: false },
  { id: "topic-phy-1", subjectId: "subj-phy", subjectSlug: "physics", title: "Motion & Velocity", description: "Speed, velocity and distance-time graphs.", progress: 30, duration: "30 min", order: 1, hasVideo: true, hasPdf: true, hasImages: true, hasCbt: true, cbtId: "cbt-phy-1", completed: false },
  { id: "topic-eng-1", subjectId: "subj-eng", subjectSlug: "english-language", title: "Reading Comprehension Skills", description: "Skimming, scanning and inference.", progress: 10, duration: "25 min", order: 1, hasVideo: true, hasPdf: true, hasImages: false, hasCbt: false, completed: false },
];

export function getTopicById(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}

export function getTopicsBySubjectId(subjectId: string): Topic[] {
  return topics.filter((t) => t.subjectId === subjectId).sort((a, b) => a.order - b.order);
}

export function getTopicsBySubjectSlug(slug: string): Topic[] {
  return topics.filter((t) => t.subjectSlug === slug).sort((a, b) => a.order - b.order);
}

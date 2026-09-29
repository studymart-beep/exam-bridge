import type { Subject } from "@/types";

export const subjects: Subject[] = [
  { id: "subj-math", name: "Mathematics", slug: "mathematics", letter: "M", color: "#7C3AED", bgColor: "#EDE9FE", topicCount: 5, description: "Algebra, Geometry, Trigonometry, Calculus and more for JAMB & WAEC.", generalCbtId: "cbt-math-1" },
  { id: "subj-bio", name: "Biology", slug: "biology", letter: "B", color: "#059669", bgColor: "#D1FAE5", topicCount: 3, description: "Cell biology, Genetics, Ecology, Human physiology and more.", generalCbtId: "cbt-bio-1" },
  { id: "subj-eng", name: "English Language", slug: "english-language", letter: "E", color: "#2563EB", bgColor: "#DBEAFE", topicCount: 1, description: "Comprehension, Lexis & Structure, Oral English and Essay writing.", generalCbtId: null },
  { id: "subj-chem", name: "Chemistry", slug: "chemistry", letter: "C", color: "#D97706", bgColor: "#FEF3C7", topicCount: 1, description: "Organic, Inorganic, Physical chemistry and practicals.", generalCbtId: "cbt-chem-1" },
  { id: "subj-phy", name: "Physics", slug: "physics", letter: "P", color: "#0891B2", bgColor: "#CFFAFE", topicCount: 1, description: "Mechanics, Waves, Electricity and Modern physics.", generalCbtId: "cbt-phy-1" },
  { id: "subj-lit", name: "Literature in English", slug: "literature-in-english", letter: "L", color: "#DB2777", bgColor: "#FCE7F3", topicCount: 0, description: "Prose, Drama, Poetry and literary appreciation.", generalCbtId: null },
  { id: "subj-gov", name: "Government", slug: "government", letter: "G", color: "#4B5563", bgColor: "#F3F4F6", topicCount: 0, description: "Political systems, Nigerian government and international relations.", generalCbtId: null },
  { id: "subj-acc", name: "Accounting", slug: "accounting", letter: "A", color: "#EA580C", bgColor: "#FFEDD5", topicCount: 0, description: "Financial and cost accounting for WAEC & JAMB.", generalCbtId: null },
];

export function getSubjectBySlug(slug: string): Subject | undefined {
  return subjects.find((s) => s.slug === slug);
}

export function getSubjectById(id: string): Subject | undefined {
  return subjects.find((s) => s.id === id);
}

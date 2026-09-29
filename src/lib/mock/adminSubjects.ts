import type { AdminSubject } from "@/types";

// TODO: replace with API call
export const adminSubjects: AdminSubject[] = [
  { id: "subj-math", name: "Mathematics", slug: "mathematics", letter: "M", color: "#7C3AED", bgColor: "#EDE9FE", description: "Algebra, Geometry, Trigonometry for JAMB & WAEC.", topicCount: 12, order: 1, published: true },
  { id: "subj-bio", name: "Biology", slug: "biology", letter: "B", color: "#059669", bgColor: "#D1FAE5", description: "Cell biology, Genetics, Ecology.", topicCount: 12, order: 2, published: true },
  { id: "subj-eng", name: "English Language", slug: "english-language", letter: "E", color: "#2563EB", bgColor: "#DBEAFE", description: "Comprehension, Lexis & Structure.", topicCount: 12, order: 3, published: true },
  { id: "subj-chem", name: "Chemistry", slug: "chemistry", letter: "C", color: "#D97706", bgColor: "#FEF3C7", description: "Organic, Inorganic, Physical chemistry.", topicCount: 12, order: 4, published: true },
  { id: "subj-phy", name: "Physics", slug: "physics", letter: "P", color: "#0891B2", bgColor: "#CFFAFE", description: "Mechanics, Waves, Electricity.", topicCount: 12, order: 5, published: true },
  { id: "subj-lit", name: "Literature in English", slug: "literature-in-english", letter: "L", color: "#DB2777", bgColor: "#FCE7F3", description: "Prose, Drama, Poetry.", topicCount: 12, order: 6, published: true },
  { id: "subj-gov", name: "Government", slug: "government", letter: "G", color: "#4B5563", bgColor: "#F3F4F6", description: "Political systems, Nigerian government.", topicCount: 12, order: 7, published: true },
  { id: "subj-acc", name: "Accounting", slug: "accounting", letter: "A", color: "#EA580C", bgColor: "#FFEDD5", description: "Financial and cost accounting.", topicCount: 12, order: 8, published: false },
];

export function getAdminSubjectById(id: string): AdminSubject | undefined {
  return adminSubjects.find((s) => s.id === id);
}

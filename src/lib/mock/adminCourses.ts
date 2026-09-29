import type { AdminCourse } from "@/types";

// TODO: replace with API call
export const adminCourses: AdminCourse[] = [
  { id: "course-math-1", subjectId: "subj-math", subjectName: "Mathematics", title: "Algebra & Equations", description: "Linear and quadratic equations.", level: "SSS 1–3", topicCount: 5, published: true, order: 1 },
  { id: "course-math-2", subjectId: "subj-math", subjectName: "Mathematics", title: "Geometry & Mensuration", description: "Plane and solid geometry.", level: "SSS 1–3", topicCount: 4, published: true, order: 2 },
  { id: "course-bio-1", subjectId: "subj-bio", subjectName: "Biology", title: "Cell Biology", description: "Cell structure and functions.", level: "SSS 1–2", topicCount: 4, published: true, order: 1 },
  { id: "course-bio-2", subjectId: "subj-bio", subjectName: "Biology", title: "Human Physiology", description: "Body systems.", level: "SSS 2–3", topicCount: 5, published: true, order: 2 },
  { id: "course-eng-1", subjectId: "subj-eng", subjectName: "English Language", title: "Comprehension & Summary", description: "Reading and summary skills.", level: "SSS 1–3", topicCount: 4, published: true, order: 1 },
  { id: "course-chem-1", subjectId: "subj-chem", subjectName: "Chemistry", title: "Atomic Structure & Bonding", description: "Atoms and bonding.", level: "SSS 1–2", topicCount: 4, published: true, order: 1 },
  { id: "course-phy-1", subjectId: "subj-phy", subjectName: "Physics", title: "Mechanics", description: "Motion, forces, energy.", level: "SSS 1–2", topicCount: 5, published: true, order: 1 },
  { id: "course-lit-1", subjectId: "subj-lit", subjectName: "Literature in English", title: "Prose & Drama", description: "Set texts analysis.", level: "SSS 1–3", topicCount: 4, published: false, order: 1 },
];

export function getAdminCourseById(id: string): AdminCourse | undefined {
  return adminCourses.find((c) => c.id === id);
}

export function getAdminCoursesBySubject(subjectId: string): AdminCourse[] {
  return adminCourses.filter((c) => c.subjectId === subjectId);
}

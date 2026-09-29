import type { AdminCbtQuestion } from "@/types";

// TODO: replace with API call
export const adminCbtQuestions: AdminCbtQuestion[] = [
  { id: "q1", examId: "cbt-bio-1", order: 1, question: "Which of the following is a primary function of the liver?", options: { A: "Detoxification", B: "Pumping blood", C: "Producing hormones", D: "Filtering waste from lungs" }, correctAnswer: "A", explanation: "The liver helps remove toxins and waste from the body." },
  { id: "q2", examId: "cbt-bio-1", order: 2, question: "What is the SI unit of electric current?", options: { A: "Ampere", B: "Volt", C: "Ohm", D: "Watt" }, correctAnswer: "A", explanation: "The SI unit of electric current is Ampere (A)." },
  { id: "q3", examId: "cbt-bio-1", order: 3, question: "Which planet is known as the Red Planet?", options: { A: "Venus", B: "Jupiter", C: "Mars", D: "Mercury" }, correctAnswer: "C", explanation: "Mars is often called the Red Planet due to its reddish appearance." },
  { id: "q4", examId: "cbt-bio-1", order: 4, question: "What is the chemical symbol for Gold?", options: { A: "Go", B: "Gd", C: "Ag", D: "Au" }, correctAnswer: "D", explanation: "The chemical symbol for Gold is Au." },
  { id: "q5", examId: "cbt-bio-1", order: 5, question: "Which process describes water changing to vapor?", options: { A: "Condensation", B: "Evaporation", C: "Freezing", D: "Sublimation" }, correctAnswer: "B", explanation: "Evaporation is the process where liquid water turns into vapor." },
  { id: "mq1", examId: "cbt-math-1", order: 1, question: "Solve for x: 2x + 5 = 15", options: { A: "x = 5", B: "x = 10", C: "x = 7.5", D: "x = 2.5" }, correctAnswer: "A", explanation: "2x + 5 = 15 → 2x = 10 → x = 5" },
  { id: "mq2", examId: "cbt-math-1", order: 2, question: "If 3x − 7 = 8, what is x?", options: { A: "3", B: "5", C: "1", D: "15" }, correctAnswer: "B", explanation: "3x − 7 = 8 → 3x = 15 → x = 5" },
  { id: "mq3", examId: "cbt-math-1", order: 3, question: "Solve: x/4 + 3 = 7", options: { A: "x = 16", B: "x = 28", C: "x = 4", D: "x = 10" }, correctAnswer: "A", explanation: "x/4 + 3 = 7 → x/4 = 4 → x = 16" },
  { id: "mq4", examId: "cbt-math-1", order: 4, question: "What is the value of x if 5x = 45?", options: { A: "5", B: "8", C: "9", D: "10" }, correctAnswer: "C", explanation: "5x = 45 → x = 9" },
  { id: "mq5", examId: "cbt-math-1", order: 5, question: "Solve: 4(x − 2) = 20", options: { A: "x = 3", B: "x = 5", C: "x = 7", D: "x = 6" }, correctAnswer: "C", explanation: "4(x − 2) = 20 → x − 2 = 5 → x = 7" },
  { id: "cq1", examId: "cbt-chem-1", order: 1, question: "The number of protons in an atom is equal to its:", options: { A: "Mass number", B: "Atomic number", C: "Neutron number", D: "Valency" }, correctAnswer: "B", explanation: "Atomic number equals the number of protons." },
  { id: "cq2", examId: "cbt-chem-1", order: 2, question: "Electrons are found in:", options: { A: "Nucleus", B: "Shells/orbitals", C: "Protons", D: "Neutrons" }, correctAnswer: "B", explanation: "Electrons occupy energy levels around the nucleus." },
  { id: "pq1", examId: "cbt-phy-1", order: 1, question: "Which of the following is a primary function of the human heart?", options: { A: "To digest food", B: "To pump blood", C: "To filter waste", D: "To produce hormones" }, correctAnswer: "B", explanation: "The heart pumps blood throughout the body." },
  { id: "pq2", examId: "cbt-phy-1", order: 2, question: "Speed is a:", options: { A: "Vector quantity", B: "Scalar quantity", C: "Force", D: "Momentum" }, correctAnswer: "B", explanation: "Speed has magnitude only." },
  { id: "pq3", examId: "cbt-phy-1", order: 3, question: "The SI unit of velocity is:", options: { A: "m/s", B: "km/h", C: "m/s²", D: "N" }, correctAnswer: "A", explanation: "Velocity is measured in metres per second." },
];

export function getQuestionsByExamId(examId: string): AdminCbtQuestion[] {
  return adminCbtQuestions.filter((q) => q.examId === examId).sort((a, b) => a.order - b.order);
}

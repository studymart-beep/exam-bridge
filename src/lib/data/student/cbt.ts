import { createClient } from "@/lib/supabase/server";

export type StudentExam = {
  id: string;
  title: string;
  subject_id: string | null;
  topic_id: string | null;
  is_general: boolean;
  duration_mins: number;
  question_count: number;
  pass_mark: number;
  is_active: boolean;
};

export type StudentQuestion = {
  id: string;
  exam_id: string;
  question_text: string;
  explanation: string | null;
  image_url: string | null;
  order_index: number;
  options: { id: string; label: string; option_text: string }[];
};

export async function listExamsForStudent(): Promise<StudentExam[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("cbt_exams")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    return (data as StudentExam[]) || [];
  } catch {
    return [];
  }
}

export async function getExamById(id: string): Promise<StudentExam | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("cbt_exams")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();
    return (data as StudentExam) || null;
  } catch {
    return null;
  }
}

/** Options without is_correct for taking the exam */
export async function listQuestionsForExam(examId: string): Promise<StudentQuestion[]> {
  try {
    const supabase = await createClient();
    const { data: questions } = await supabase
      .from("cbt_questions")
      .select("id, exam_id, question_text, explanation, image_url, order_index")
      .eq("exam_id", examId)
      .order("order_index");
    if (!questions?.length) return [];

    const ids = questions.map((q: { id: string }) => q.id);
    const { data: options } = await supabase
      .from("cbt_options")
      .select("id, question_id, label, option_text")
      .in("question_id", ids);

    return questions.map((q: StudentQuestion & { id: string }) => ({
      id: q.id,
      exam_id: q.exam_id,
      question_text: q.question_text,
      explanation: q.explanation,
      image_url: q.image_url,
      order_index: q.order_index,
      options: (options || [])
        .filter((o: { question_id: string }) => o.question_id === q.id)
        .map((o: { id: string; label: string; option_text: string }) => ({
          id: o.id,
          label: o.label,
          option_text: o.option_text,
        })),
    }));
  } catch {
    return [];
  }
}

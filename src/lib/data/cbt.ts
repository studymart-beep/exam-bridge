import { createClient } from "@/lib/supabase/server";

export type DbExam = {
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

export type DbQuestion = {
  id: string;
  exam_id: string;
  question_text: string;
  explanation: string | null;
  image_url: string | null;
  order_index: number;
};

export type DbOption = {
  id: string;
  question_id: string;
  label: string;
  option_text: string;
  is_correct: boolean;
};

function hasEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getExams(): Promise<DbExam[]> {
  if (!hasEnv()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("cbt_exams")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    return (data as DbExam[]) || [];
  } catch {
    return [];
  }
}

export async function getExamById(id: string): Promise<DbExam | null> {
  if (!hasEnv()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("cbt_exams")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as DbExam) || null;
  } catch {
    return null;
  }
}

export async function getQuestionsWithOptions(examId: string) {
  if (!hasEnv()) return [];
  try {
    const supabase = await createClient();
    const { data: questions } = await supabase
      .from("cbt_questions")
      .select("*")
      .eq("exam_id", examId)
      .order("order_index");
    if (!questions?.length) return [];
    const ids = questions.map((q: { id: string }) => q.id);
    const { data: options } = await supabase
      .from("cbt_options")
      .select("*")
      .in("question_id", ids);
    return (questions as DbQuestion[]).map((q) => ({
      ...q,
      options: ((options as DbOption[]) || []).filter(
        (o) => o.question_id === q.id
      ),
    }));
  } catch {
    return [];
  }
}

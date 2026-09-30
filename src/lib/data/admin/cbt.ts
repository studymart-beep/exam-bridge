import { createClient } from "@/lib/supabase/server";

export type AdminExamRow = {
  id: string;
  title: string;
  subject_id: string | null;
  topic_id: string | null;
  is_general: boolean;
  duration_mins: number;
  question_count: number;
  pass_mark: number;
  is_active: boolean;
  created_at: string;
  subject_name?: string | null;
  topic_title?: string | null;
};

export type AdminQuestionRow = {
  id: string;
  exam_id: string;
  question_text: string;
  explanation: string | null;
  image_url: string | null;
  order_index: number;
  options: {
    id: string;
    label: string;
    option_text: string;
    is_correct: boolean;
  }[];
};

export async function adminListExams(): Promise<AdminExamRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cbt_exams")
    .select("*")
    .order("created_at", { ascending: false });
  if (!data?.length) return [];

  const subjectIds = [...new Set(data.map((e: AdminExamRow) => e.subject_id).filter(Boolean))] as string[];
  const topicIds = [...new Set(data.map((e: AdminExamRow) => e.topic_id).filter(Boolean))] as string[];

  const subjects: Record<string, string> = {};
  const topics: Record<string, string> = {};

  if (subjectIds.length) {
    const { data: s } = await supabase.from("subjects").select("id, name").in("id", subjectIds);
    (s || []).forEach((x: { id: string; name: string }) => {
      subjects[x.id] = x.name;
    });
  }
  if (topicIds.length) {
    const { data: t } = await supabase.from("topics").select("id, title").in("id", topicIds);
    (t || []).forEach((x: { id: string; title: string }) => {
      topics[x.id] = x.title;
    });
  }

  return data.map((e: AdminExamRow) => ({
    ...e,
    subject_name: e.subject_id ? subjects[e.subject_id] || null : null,
    topic_title: e.topic_id ? topics[e.topic_id] || null : null,
  }));
}

export async function adminGetExam(id: string): Promise<AdminExamRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("cbt_exams").select("*").eq("id", id).maybeSingle();
  return data as AdminExamRow | null;
}

export async function adminListQuestions(examId: string): Promise<AdminQuestionRow[]> {
  const supabase = await createClient();
  const { data: questions } = await supabase
    .from("cbt_questions")
    .select("*")
    .eq("exam_id", examId)
    .order("order_index");
  if (!questions?.length) return [];

  const ids = questions.map((q: { id: string }) => q.id);
  const { data: options } = await supabase.from("cbt_options").select("*").in("question_id", ids);

  return questions.map((q: {
    id: string;
    exam_id: string;
    question_text: string;
    explanation: string | null;
    image_url: string | null;
    order_index: number;
  }) => ({
    ...q,
    options: (options || [])
      .filter((o: { question_id: string }) => o.question_id === q.id)
      .map((o: { id: string; label: string; option_text: string; is_correct: boolean }) => ({
        id: o.id,
        label: o.label,
        option_text: o.option_text,
        is_correct: o.is_correct,
      })),
  }));
}

export async function adminGetTopicCbt(topicId: string): Promise<AdminExamRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cbt_exams")
    .select("*")
    .eq("topic_id", topicId)
    .eq("is_general", false)
    .limit(1)
    .maybeSingle();
  return data as AdminExamRow | null;
}

export async function adminGetSubjectGeneralCbt(subjectId: string): Promise<AdminExamRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cbt_exams")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("is_general", true)
    .limit(1)
    .maybeSingle();
  return data as AdminExamRow | null;
}

export async function adminListUnattachedExams(): Promise<AdminExamRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cbt_exams")
    .select("*")
    .is("topic_id", null)
    .eq("is_general", false)
    .order("created_at", { ascending: false });
  return (data as AdminExamRow[]) || [];
}

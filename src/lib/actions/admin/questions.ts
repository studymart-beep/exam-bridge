"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/actions/admin/guard";

export type QuestionInput = {
  question_text: string;
  explanation?: string;
  correct: "A" | "B" | "C" | "D";
  options: { A: string; B: string; C: string; D: string };
};

export async function createQuestion(examId: string, input: QuestionInput) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };
  if (!input.question_text.trim()) {
    return { success: false as const, error: "Question text is required" };
  }

  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("cbt_questions")
    .select("order_index")
    .eq("exam_id", examId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: q, error } = await supabase
    .from("cbt_questions")
    .insert({
      exam_id: examId,
      question_text: input.question_text.trim(),
      explanation: input.explanation || null,
      order_index: (maxRow?.order_index ?? -1) + 1,
    })
    .select("id")
    .single();
  if (error || !q) return { success: false as const, error: error?.message || "Failed" };

  const labels = ["A", "B", "C", "D"] as const;
  await supabase.from("cbt_options").insert(
    labels.map((label) => ({
      question_id: q.id,
      label,
      option_text: input.options[label],
      is_correct: input.correct === label,
    }))
  );

  const { count } = await supabase
    .from("cbt_questions")
    .select("*", { count: "exact", head: true })
    .eq("exam_id", examId);
  await supabase.from("cbt_exams").update({ question_count: count || 0 }).eq("id", examId);

  revalidatePath(`/admin/cbt/${examId}/questions`);
  revalidatePath(`/admin/cbt/${examId}`);
  return { success: true as const };
}

export async function updateQuestion(
  questionId: string,
  examId: string,
  input: QuestionInput
) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const supabase = await createClient();
  await supabase
    .from("cbt_questions")
    .update({
      question_text: input.question_text.trim(),
      explanation: input.explanation || null,
    })
    .eq("id", questionId);

  await supabase.from("cbt_options").delete().eq("question_id", questionId);
  const labels = ["A", "B", "C", "D"] as const;
  await supabase.from("cbt_options").insert(
    labels.map((label) => ({
      question_id: questionId,
      label,
      option_text: input.options[label],
      is_correct: input.correct === label,
    }))
  );

  revalidatePath(`/admin/cbt/${examId}/questions`);
  return { success: true as const };
}

export async function deleteQuestion(questionId: string, examId: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const supabase = await createClient();
  await supabase.from("cbt_questions").delete().eq("id", questionId);
  const { count } = await supabase
    .from("cbt_questions")
    .select("*", { count: "exact", head: true })
    .eq("exam_id", examId);
  await supabase.from("cbt_exams").update({ question_count: count || 0 }).eq("id", examId);

  revalidatePath(`/admin/cbt/${examId}/questions`);
  revalidatePath(`/admin/cbt/${examId}`);
  return { success: true as const };
}

export async function bulkCreateQuestions(examId: string, items: QuestionInput[]) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };
  if (!items.length) return { success: false as const, error: "No questions" };

  for (const item of items) {
    const res = await createQuestion(examId, item);
    if (!res.success) return res;
  }
  return { success: true as const };
}

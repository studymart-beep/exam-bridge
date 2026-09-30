"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/actions/admin/guard";

export async function createExam(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const title = String(formData.get("title") || "").trim() || "Untitled exam";
  const duration_mins = Number(formData.get("duration_mins") || 30);
  const pass_mark = Number(formData.get("pass_mark") || 50);
  const subject_id = String(formData.get("subject_id") || "") || null;
  const topic_id = String(formData.get("topic_id") || "") || null;
  const is_general = String(formData.get("is_general") || "") === "true";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cbt_exams")
    .insert({
      title,
      duration_mins,
      pass_mark,
      subject_id,
      topic_id,
      is_general,
      is_active: true,
      question_count: 0,
    })
    .select("id")
    .single();
  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/cbt");
  if (topic_id) revalidatePath(`/admin/topics/${topic_id}/cbt`);
  if (subject_id) revalidatePath(`/admin/subjects/${subject_id}/cbt`);
  return { success: true as const, id: data.id };
}

export async function createExamForTopic(topicId: string, subjectId?: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const supabase = await createClient();
  const { data: topic } = await supabase
    .from("topics")
    .select("title, subject_id")
    .eq("id", topicId)
    .single();

  const { data, error } = await supabase
    .from("cbt_exams")
    .insert({
      title: `${topic?.title || "Topic"} CBT`,
      topic_id: topicId,
      subject_id: subjectId || topic?.subject_id || null,
      is_general: false,
      duration_mins: 30,
      pass_mark: 50,
      is_active: true,
      question_count: 0,
    })
    .select("id")
    .single();
  if (error) return { success: false as const, error: error.message };

  revalidatePath(`/admin/topics/${topicId}/cbt`);
  revalidatePath("/admin/cbt");
  redirect(`/admin/cbt/${data.id}/questions`);
}

export async function createGeneralExamForSubject(subjectId: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const supabase = await createClient();
  const { data: subject } = await supabase
    .from("subjects")
    .select("name")
    .eq("id", subjectId)
    .single();

  const { data, error } = await supabase
    .from("cbt_exams")
    .insert({
      title: `${subject?.name || "Subject"} General CBT`,
      subject_id: subjectId,
      is_general: true,
      duration_mins: 45,
      pass_mark: 50,
      is_active: true,
      question_count: 0,
    })
    .select("id")
    .single();
  if (error) return { success: false as const, error: error.message };

  await supabase
    .from("subjects")
    .update({ general_cbt_id: data.id })
    .eq("id", subjectId);

  revalidatePath(`/admin/subjects/${subjectId}/cbt`);
  revalidatePath("/admin/cbt");
  redirect(`/admin/cbt/${data.id}/questions`);
}

export async function attachExamToTopic(examId: string, topicId: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("cbt_exams")
    .update({ topic_id: topicId, is_general: false })
    .eq("id", examId);
  if (error) return { success: false as const, error: error.message };

  revalidatePath(`/admin/topics/${topicId}/cbt`);
  revalidatePath("/admin/cbt");
  return { success: true as const };
}

export async function detachExamFromTopic(examId: string, topicId: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("cbt_exams")
    .update({ topic_id: null })
    .eq("id", examId);
  if (error) return { success: false as const, error: error.message };

  revalidatePath(`/admin/topics/${topicId}/cbt`);
  revalidatePath("/admin/cbt");
  return { success: true as const };
}

export async function attachGeneralExam(examId: string, subjectId: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const supabase = await createClient();
  await supabase
    .from("cbt_exams")
    .update({ subject_id: subjectId, is_general: true })
    .eq("id", examId);
  await supabase
    .from("subjects")
    .update({ general_cbt_id: examId })
    .eq("id", subjectId);

  revalidatePath(`/admin/subjects/${subjectId}/cbt`);
  return { success: true as const };
}

export async function detachGeneralExam(examId: string, subjectId: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const supabase = await createClient();
  await supabase.from("cbt_exams").update({ is_general: false }).eq("id", examId);
  await supabase.from("subjects").update({ general_cbt_id: null }).eq("id", subjectId);

  revalidatePath(`/admin/subjects/${subjectId}/cbt`);
  return { success: true as const };
}

export async function updateExam(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const duration_mins = Number(formData.get("duration_mins") || 30);
  const pass_mark = Number(formData.get("pass_mark") || 50);
  const is_active = String(formData.get("is_active") || "") === "true";
  const is_general = String(formData.get("is_general") || "") === "true";
  const subject_id = String(formData.get("subject_id") || "") || null;
  const topic_id = String(formData.get("topic_id") || "") || null;

  if (!id || !title) return { success: false as const, error: "Title is required" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("cbt_exams")
    .update({
      title,
      duration_mins,
      pass_mark,
      is_active,
      is_general,
      subject_id,
      topic_id,
    })
    .eq("id", id);
  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/cbt");
  revalidatePath(`/admin/cbt/${id}`);
  return { success: true as const };
}

export async function deleteExam(id: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase.from("cbt_exams").delete().eq("id", id);
  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/cbt");
  return { success: true as const };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile, isSubscriptionActive } from "@/lib/auth/session";

export type ActionResult = {
  error?: string;
  attemptId?: string;
  success?: boolean;
};

export async function startExam(examId: string): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { error: "Not authenticated" };
  if (!isSubscriptionActive(profile)) {
    return { error: "Subscription required to start this exam." };
  }

  const supabase = await createClient();
  const { data: exam } = await supabase
    .from("cbt_exams")
    .select("id, is_active")
    .eq("id", examId)
    .maybeSingle();
  if (!exam || !exam.is_active) return { error: "Exam not found" };

  const { data, error } = await supabase
    .from("cbt_attempts")
    .insert({
      exam_id: examId,
      student_id: profile.id,
      status: "in_progress",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { success: true, attemptId: data.id };
}

export async function submitExam(
  attemptId: string,
  answers: { questionId: string; optionId: string }[]
): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { error: "Not authenticated" };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    admin = await createClient();
  }

  const { data: attempt } = await admin
    .from("cbt_attempts")
    .select("*, cbt_exams(pass_mark, question_count)")
    .eq("id", attemptId)
    .eq("student_id", profile.id)
    .single();

  if (!attempt) return { error: "Attempt not found" };
  if (attempt.status === "submitted") return { success: true, attemptId };

  let correct = 0;
  const rows: {
    attempt_id: string;
    question_id: string;
    selected_option_id: string | null;
    is_correct: boolean;
  }[] = [];

  for (const a of answers) {
    if (!a.optionId) {
      rows.push({
        attempt_id: attemptId,
        question_id: a.questionId,
        selected_option_id: null,
        is_correct: false,
      });
      continue;
    }
    const { data: opt } = await admin
      .from("cbt_options")
      .select("is_correct, question_id")
      .eq("id", a.optionId)
      .single();
    const isCorrect = !!opt?.is_correct && opt.question_id === a.questionId;
    if (isCorrect) correct += 1;
    rows.push({
      attempt_id: attemptId,
      question_id: a.questionId,
      selected_option_id: a.optionId,
      is_correct: isCorrect,
    });
  }

  if (rows.length) {
    await admin.from("student_answers").delete().eq("attempt_id", attemptId);
    await admin.from("student_answers").insert(rows);
  }

  const total =
    (attempt.cbt_exams as { question_count?: number } | null)?.question_count ||
    answers.length ||
    1;
  const scorePct = Math.round((correct / total) * 100);
  const passMark =
    (attempt.cbt_exams as { pass_mark?: number } | null)?.pass_mark ?? 50;
  const passed = scorePct >= passMark;

  await admin
    .from("cbt_attempts")
    .update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
      score: correct,
      total,
      passed,
    })
    .eq("id", attemptId);

  try {
    await admin.from("results").insert({
      attempt_id: attemptId,
      student_id: profile.id,
      score: correct,
      total,
      passed,
    });
  } catch {
    /* optional table */
  }

  try {
    await admin.from("activity_logs").insert({
      student_id: profile.id,
      action: "cbt_submitted",
      metadata: { attemptId, score: correct, total, passed },
    });
  } catch {
    /* optional */
  }

  revalidatePath("/results");
  revalidatePath("/progress");
  revalidatePath(`/cbt/${attempt.exam_id}/result/${attemptId}`);
  return { success: true, attemptId };
}

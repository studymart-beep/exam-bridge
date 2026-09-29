"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSubscriptionActive, getProfile } from "@/lib/auth/session";

export type ActionResult = { error?: string; attemptId?: string; success?: boolean };

export async function startExam(examId: string): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { error: "Not authenticated" };
  if (!isSubscriptionActive(profile)) {
    return { error: "Subscription required to start this exam." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cbt_attempts")
    .insert({
      exam_id: examId,
      student_id: profile.id,
      status: "in_progress",
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

  // Score with service role so is_correct is trusted server-side
  const admin = createAdminClient();

  const { data: attempt } = await admin
    .from("cbt_attempts")
    .select("*, cbt_exams(pass_mark)")
    .eq("id", attemptId)
    .eq("student_id", profile.id)
    .single();

  if (!attempt) return { error: "Attempt not found" };
  if (attempt.status === "submitted") return { error: "Already submitted" };

  let correct = 0;
  const rows = [];

  for (const a of answers) {
    const { data: opt } = await admin
      .from("cbt_options")
      .select("is_correct")
      .eq("id", a.optionId)
      .single();
    const isCorrect = !!opt?.is_correct;
    if (isCorrect) correct += 1;
    rows.push({
      attempt_id: attemptId,
      question_id: a.questionId,
      selected_option_id: a.optionId,
      is_correct: isCorrect,
    });
  }

  if (rows.length) {
    await admin.from("student_answers").insert(rows);
  }

  const total = answers.length;
  const scorePct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passMark = (attempt.cbt_exams as { pass_mark?: number })?.pass_mark ?? 50;
  const passed = scorePct >= passMark;

  await admin
    .from("cbt_attempts")
    .update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
      score: scorePct,
      total,
      passed,
    })
    .eq("id", attemptId);

  await admin.from("results").insert({
    attempt_id: attemptId,
    student_id: profile.id,
    score: scorePct,
    total,
    passed,
  });

  await admin.from("activity_logs").insert({
    student_id: profile.id,
    action: "cbt_submitted",
    metadata: { attemptId, score: scorePct, passed },
  });

  return { success: true, attemptId };
}

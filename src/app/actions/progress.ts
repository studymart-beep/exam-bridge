"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/session";

export async function markTopicProgress(
  topicId: string,
  percent: number,
  completed = false
) {
  const profile = await getProfile();
  if (!profile) return { success: false as const, error: "Not authenticated" };

  const supabase = await createClient();
  const pct = Math.min(100, Math.max(0, Math.round(percent)));

  const { data: existing } = await supabase
    .from("progress")
    .select("id")
    .eq("student_id", profile.id)
    .eq("topic_id", topicId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("progress")
      .update({
        percent: pct,
        completed: completed || pct >= 100,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) return { success: false as const, error: error.message };
  } else {
    const { error } = await supabase.from("progress").insert({
      student_id: profile.id,
      topic_id: topicId,
      percent: pct,
      completed: completed || pct >= 100,
    });
    if (error) return { success: false as const, error: error.message };
  }

  revalidatePath("/progress");
  return { success: true as const };
}

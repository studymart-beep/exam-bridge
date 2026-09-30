import { createClient } from "@/lib/supabase/server";

export async function getResultsForStudent(studentId: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("cbt_attempts")
      .select("*, cbt_exams(title)")
      .eq("student_id", studentId)
      .eq("status", "submitted")
      .order("submitted_at", { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}

export async function getAttemptById(attemptId: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("cbt_attempts")
      .select("*, cbt_exams(title, pass_mark)")
      .eq("id", attemptId)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

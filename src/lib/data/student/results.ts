import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

export async function getAttemptById(attemptId: string, studentId: string) {
  try {
    const supabase = await createClient();
    const { data: attempt } = await supabase
      .from("cbt_attempts")
      .select("*, cbt_exams(title, pass_mark, duration_mins)")
      .eq("id", attemptId)
      .eq("student_id", studentId)
      .maybeSingle();
    if (!attempt) return null;

    // Answers + correct options only after submit (server)
    let admin;
    try {
      admin = createAdminClient();
    } catch {
      admin = supabase;
    }

    const { data: answers } = await admin
      .from("student_answers")
      .select("question_id, selected_option_id, is_correct")
      .eq("attempt_id", attemptId);

    const { data: questions } = await admin
      .from("cbt_questions")
      .select("id, question_text, explanation, order_index")
      .eq("exam_id", attempt.exam_id)
      .order("order_index");

    const qIds = (questions || []).map((q: { id: string }) => q.id);
    const { data: options } = qIds.length
      ? await admin
          .from("cbt_options")
          .select("id, question_id, label, option_text, is_correct")
          .in("question_id", qIds)
      : { data: [] };

    return {
      attempt,
      answers: answers || [],
      questions: (questions || []).map(
        (q: {
          id: string;
          question_text: string;
          explanation: string | null;
          order_index: number;
        }) => ({
          ...q,
          options: (options || []).filter(
            (o: { question_id: string }) => o.question_id === q.id
          ),
        })
      ),
    };
  } catch {
    return null;
  }
}

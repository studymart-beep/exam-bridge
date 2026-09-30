import { createClient } from "@/lib/supabase/server";

export async function getProgressForStudent(studentId: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("progress")
      .select("*")
      .eq("student_id", studentId);
    return data || [];
  } catch {
    return [];
  }
}

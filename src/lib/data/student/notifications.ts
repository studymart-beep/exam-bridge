import { createClient } from "@/lib/supabase/server";

export async function listNotificationsForStudent(studentId: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(50);
    return data || [];
  } catch {
    return [];
  }
}

export async function markNotificationRead(id: string) {
  try {
    const supabase = await createClient();
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  } catch {
    /* ignore */
  }
}

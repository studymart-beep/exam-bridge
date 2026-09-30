"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/actions/admin/guard";

export async function sendNotification(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const audience = String(formData.get("audience") || "all");
  if (!title || !body) {
    return { success: false as const, error: "Title and body are required" };
  }

  const supabase = await createClient();
  let query = supabase.from("profiles").select("id").eq("role", "student");
  if (audience === "active") query = query.eq("status", "active");
  if (audience === "inactive") query = query.eq("status", "inactive");

  const { data: students } = await query;
  if (!students?.length) {
    // Broadcast row with null student_id is not allowed by FK — insert none
    return { success: false as const, error: "No recipients found" };
  }

  const rows = students.map((s: { id: string }) => ({
    student_id: s.id,
    title,
    body,
    read: false,
  }));

  const { error } = await supabase.from("notifications").insert(rows);
  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/notifications");
  revalidatePath("/admin/announcements");
  return { success: true as const, count: rows.length };
}

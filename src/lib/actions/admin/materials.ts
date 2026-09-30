"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/actions/admin/guard";

export async function createMaterial(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const topic_id = String(formData.get("topic_id") || "");
  const type = String(formData.get("type") || "") as "video" | "pdf" | "image";
  const title = String(formData.get("title") || "").trim();
  const source = String(formData.get("source") || "").trim();
  if (!topic_id || !title || !type) {
    return { success: false as const, error: "Title and type are required" };
  }
  if (!source) return { success: false as const, error: "Source is required" };

  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("materials")
    .select("order_index")
    .eq("topic_id", topic_id)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("materials").insert({
    topic_id,
    type,
    title,
    source,
    order_index: (maxRow?.order_index ?? -1) + 1,
  });
  if (error) return { success: false as const, error: error.message };

  revalidatePath(`/admin/topics/${topic_id}/materials`);
  return { success: true as const };
}

export async function updateMaterial(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const id = String(formData.get("id") || "");
  const topic_id = String(formData.get("topic_id") || "");
  const type = String(formData.get("type") || "") as "video" | "pdf" | "image";
  const title = String(formData.get("title") || "").trim();
  const source = String(formData.get("source") || "").trim();
  if (!id || !title) return { success: false as const, error: "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("materials")
    .update({ type, title, source })
    .eq("id", id);
  if (error) return { success: false as const, error: error.message };

  revalidatePath(`/admin/topics/${topic_id}/materials`);
  return { success: true as const };
}

export async function deleteMaterial(id: string, topicId: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) return { success: false as const, error: error.message };

  revalidatePath(`/admin/topics/${topicId}/materials`);
  return { success: true as const };
}

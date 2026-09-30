"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/actions/admin/guard";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createTopic(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const subject_id = String(formData.get("subject_id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const duration = String(formData.get("duration") || "30 min").trim();
  if (!subject_id || !title) return { success: false as const, error: "Title is required" };

  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("topics")
    .select("order_index")
    .eq("subject_id", subject_id)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("topics").insert({
    subject_id,
    title,
    slug: slugify(title),
    description,
    duration,
    order_index: (maxRow?.order_index ?? -1) + 1,
    is_published: true,
  });
  if (error) return { success: false as const, error: error.message };

  revalidatePath(`/admin/subjects/${subject_id}/topics`);
  revalidatePath("/admin/subjects");
  return { success: true as const };
}

export async function updateTopic(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const id = String(formData.get("id") || "");
  const subject_id = String(formData.get("subject_id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const duration = String(formData.get("duration") || "30 min").trim();
  if (!id || !title) return { success: false as const, error: "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("topics")
    .update({
      title,
      slug: slugify(title),
      description,
      duration,
    })
    .eq("id", id);
  if (error) return { success: false as const, error: error.message };

  revalidatePath(`/admin/subjects/${subject_id}/topics`);
  return { success: true as const };
}

export async function deleteTopic(id: string, subjectId: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase.from("topics").delete().eq("id", id);
  if (error) return { success: false as const, error: error.message };

  revalidatePath(`/admin/subjects/${subjectId}/topics`);
  revalidatePath("/admin/subjects");
  return { success: true as const };
}

export async function toggleTopicPublished(id: string, subjectId: string, is_published: boolean) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase.from("topics").update({ is_published }).eq("id", id);
  if (error) return { success: false as const, error: error.message };

  revalidatePath(`/admin/subjects/${subjectId}/topics`);
  return { success: true as const };
}

export async function reorderTopic(id: string, subjectId: string, direction: "up" | "down") {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("topics")
    .select("id, order_index")
    .eq("subject_id", subjectId)
    .order("order_index");
  if (!rows?.length) return { success: false as const, error: "No topics" };

  const idx = rows.findIndex((r: { id: string }) => r.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= rows.length) return { success: true as const };

  const a = rows[idx];
  const b = rows[swapIdx];
  await supabase.from("topics").update({ order_index: b.order_index }).eq("id", a.id);
  await supabase.from("topics").update({ order_index: a.order_index }).eq("id", b.id);

  revalidatePath(`/admin/subjects/${subjectId}/topics`);
  return { success: true as const };
}

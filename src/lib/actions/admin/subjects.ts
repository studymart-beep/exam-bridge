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

export async function createSubject(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!name) return { success: false as const, error: "Name is required" };

  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("subjects")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  const order_index = (maxRow?.order_index ?? -1) + 1;

  const { error } = await supabase.from("subjects").insert({
    name,
    slug: slugify(name),
    description,
    letter: name.charAt(0).toUpperCase(),
    order_index,
    is_active: true,
  });
  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/subjects");
  revalidatePath("/admin/dashboard");
  return { success: true as const };
}

export async function updateSubject(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!id || !name) return { success: false as const, error: "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("subjects")
    .update({
      name,
      slug: slugify(name),
      description,
      letter: name.charAt(0).toUpperCase(),
    })
    .eq("id", id);
  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/subjects");
  return { success: true as const };
}

export async function deleteSubject(id: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/subjects");
  revalidatePath("/admin/dashboard");
  return { success: true as const };
}

export async function reorderSubject(id: string, direction: "up" | "down") {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("subjects")
    .select("id, order_index")
    .order("order_index");
  if (!rows?.length) return { success: false as const, error: "No subjects" };

  const idx = rows.findIndex((r: { id: string }) => r.id === id);
  if (idx < 0) return { success: false as const, error: "Not found" };
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= rows.length) {
    return { success: true as const };
  }

  const a = rows[idx];
  const b = rows[swapIdx];
  await supabase.from("subjects").update({ order_index: b.order_index }).eq("id", a.id);
  await supabase.from("subjects").update({ order_index: a.order_index }).eq("id", b.id);

  revalidatePath("/admin/subjects");
  return { success: true as const };
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPublicSettings } from "@/lib/data/student/settings";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX = 5 * 1024 * 1024;

export async function submitPayment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: "Not signed in" };

  const receipt_name = String(formData.get("receipt_name") || "").trim();
  const file = formData.get("receipt") as File | null;

  if (!receipt_name) {
    return { success: false as const, error: "Full name is required" };
  }
  if (!file || file.size === 0) {
    return { success: false as const, error: "Receipt file is required" };
  }
  if (file.size > MAX) {
    return { success: false as const, error: "File must be under 5 MB" };
  }
  if (!ALLOWED.includes(file.type)) {
    return {
      success: false as const,
      error: "File must be JPEG, PNG, WebP, or PDF",
    };
  }

  // Block if pending already
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("student_id", user.id)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();
  if (existing) {
    return { success: false as const, error: "You already have a pending payment" };
  }

  const settings = await getPublicSettings();
  const amount = Number(settings.subscription_price || 0) || 0;

  const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error: upErr } = await supabase.storage
    .from("receipts")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (upErr) return { success: false as const, error: upErr.message };

  const { error } = await supabase.from("payments").insert({
    student_id: user.id,
    amount,
    method: "bank_transfer",
    status: "pending",
    receipt_url: path,
    receipt_name,
  });
  if (error) return { success: false as const, error: error.message };

  revalidatePath("/subscribe");
  revalidatePath("/admin/payments");
  redirect("/subscribe/pending");
}

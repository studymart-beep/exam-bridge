"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function submitPayment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const amount = Number(formData.get("amount") || 0);
  const receipt_name = String(formData.get("receipt_name") || "").trim();
  const file = formData.get("receipt") as File | null;

  if (!amount || !receipt_name) {
    return { error: "Amount and transfer name are required." };
  }

  let receipt_url: string | null = null;
  if (file && file.size > 0) {
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage
      .from("receipts")
      .upload(path, file, { upsert: false });
    if (upErr) return { error: upErr.message };
    const { data: pub } = supabase.storage.from("receipts").getPublicUrl(path);
    receipt_url = pub?.publicUrl || path;
  }

  const { error } = await supabase.from("payments").insert({
    student_id: user.id,
    amount,
    method: "bank_transfer",
    status: "pending",
    receipt_url,
    receipt_name,
  });

  if (error) return { error: error.message };

  revalidatePath("/subscribe");
  revalidatePath("/admin/payments");
  return { success: true };
}

export async function approvePayment(paymentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { error: "Not admin" };

  // Use service role for cross-table update if needed
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    admin = supabase;
  }

  const { data: payment, error: pErr } = await admin
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .single();
  if (pErr || !payment) return { error: "Payment not found" };

  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  await admin
    .from("payments")
    .update({
      status: "approved",
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  await admin
    .from("profiles")
    .update({
      status: "active",
      subscription_expires_at: expires.toISOString(),
    })
    .eq("id", payment.student_id);

  revalidatePath("/admin/payments");
  revalidatePath("/admin/users");
  return { success: true };
}

export async function rejectPayment(paymentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { error: "Not admin" };

  await supabase
    .from("payments")
    .update({
      status: "rejected",
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  revalidatePath("/admin/payments");
  return { success: true };
}

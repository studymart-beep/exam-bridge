"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult = { error?: string; success?: boolean };

export async function submitPayment(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const amount = Number(formData.get("amount") || 0);
  const receiptName = String(formData.get("receiptName") || "").trim();
  const file = formData.get("receipt") as File | null;

  if (!amount || amount <= 0) return { error: "Invalid amount" };
  if (!receiptName) return { error: "Enter the name used for the transfer" };
  if (!file || file.size === 0) return { error: "Upload a receipt image" };

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(path);
  // Private bucket — store path; admin uses signed URL later
  const receipt_url = path;

  const { error: insertError } = await supabase.from("payments").insert({
    student_id: user.id,
    amount,
    method: "bank_transfer",
    status: "pending",
    receipt_url,
    receipt_name: receiptName,
  });

  if (insertError) return { error: insertError.message };

  revalidatePath("/subscribe");
  return { success: true };
}

export async function approvePayment(paymentId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { error: "Forbidden" };

  const admin = createAdminClient();
  const { data: payment, error: fetchErr } = await admin
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .single();
  if (fetchErr || !payment) return { error: "Payment not found" };

  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  const { error: payErr } = await admin
    .from("payments")
    .update({
      status: "approved",
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq("id", paymentId);
  if (payErr) return { error: payErr.message };

  const { error: profErr } = await admin
    .from("profiles")
    .update({
      status: "active",
      subscription_expires_at: expires.toISOString(),
    })
    .eq("id", payment.student_id);
  if (profErr) return { error: profErr.message };

  revalidatePath("/admin/payments");
  return { success: true };
}

export async function rejectPayment(paymentId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { error: "Forbidden" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("payments")
    .update({
      status: "rejected",
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq("id", paymentId);
  if (error) return { error: error.message };

  revalidatePath("/admin/payments");
  return { success: true };
}

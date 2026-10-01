"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/actions/admin/guard";

export async function approvePayment(paymentId: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return {
      success: false as const,
      error: `Admin client failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  const { data: payment, error: pErr } = await admin
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .single();

  if (pErr || !payment) {
    return { success: false as const, error: pErr?.message || "Payment not found" };
  }

  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  const { error: updatePayErr } = await admin
    .from("payments")
    .update({
      status: "approved",
      verified_by: auth.userId,
      verified_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  if (updatePayErr) {
    return { success: false as const, error: `Payment update failed: ${updatePayErr.message}` };
  }

  const { error: updateProfErr } = await admin
    .from("profiles")
    .update({
      status: "active",
      subscription_expires_at: expires.toISOString(),
    })
    .eq("id", payment.student_id);

  if (updateProfErr) {
    return { success: false as const, error: `Profile update failed: ${updateProfErr.message}` };
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
  return { success: true as const };
}

export async function rejectPayment(paymentId: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return {
      success: false as const,
      error: `Admin client failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  const { error } = await admin
    .from("payments")
    .update({
      status: "rejected",
      verified_by: auth.userId,
      verified_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/payments");
  return { success: true as const };
}
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/actions/admin/guard";

export async function approvePayment(paymentId: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    admin = await createClient();
  }

  const { data: payment, error: pErr } = await admin
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .single();
  if (pErr || !payment) return { success: false as const, error: "Payment not found" };

  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  await admin
    .from("payments")
    .update({
      status: "approved",
      verified_by: auth.userId,
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
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
  return { success: true as const };
}

export async function rejectPayment(paymentId: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase
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

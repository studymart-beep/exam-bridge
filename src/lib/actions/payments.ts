"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPublicSettings } from "@/lib/data/student/settings";
import { getFlutterwaveSecret } from "@/lib/data/platformSettings";
import { initFlutterwavePayment } from "@/lib/payments/flutterwave";

function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "");
  return (raw || "http://localhost:3000").replace(/\/$/, "");
}

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

/**
 * v31 — Automated payment. Starts a Flutterwave transaction for the signed-in
 * student, records it as `processing`, and returns the hosted checkout URL.
 * The admin's payment_mode toggle decides whether this is offered at all.
 */
export async function startFlutterwavePayment(): Promise<
  { ok: true; redirectUrl: string } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, error: "Please sign in first." };

  const settings = await getPublicSettings();
  if (settings.payment_mode !== "flutterwave") {
    return {
      ok: false,
      error: "Card payment is currently disabled. Pay by bank transfer instead.",
    };
  }

  const amount = Number(settings.subscription_price || 0) || 0;
  if (amount <= 0) return { ok: false, error: "Invalid subscription price." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const name = (profile?.full_name || user.email).trim();

  // Reuse an abandoned checkout for this student rather than stacking rows.
  const { data: openRow } = await supabase
    .from("payments")
    .select("flw_ref")
    .eq("student_id", user.id)
    .eq("status", "processing")
    .eq("method", "flutterwave")
    .not("flw_ref", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const txRef =
    (openRow?.flw_ref as string | undefined) ||
    `EB-${user.id.slice(0, 8)}-${Date.now()}`;
  const base = siteUrl();

  const { secretKey } = await getFlutterwaveSecret();
  const init = await initFlutterwavePayment({
    secretKey,
    email: user.email,
    name,
    amount,
    txRef,
    title: `${settings.app_name || "Exam Bridge"} Subscription`,
    description: "30-day access to lessons, notes and CBT practice",
    redirectUrl: `${base}/api/flutterwave/callback?tx_ref=${txRef}`,
  });
  if (!init.ok) return init;

  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("flw_ref", txRef)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("payments")
      .update({ amount, receipt_name: name, status: "processing" })
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("payments").insert({
      student_id: user.id,
      amount,
      method: "flutterwave",
      status: "processing",
      receipt_name: name,
      flw_ref: txRef,
    });
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true, redirectUrl: init.redirectUrl };
}

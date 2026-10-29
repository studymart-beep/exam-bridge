import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFlutterwaveSecret } from "@/lib/data/platformSettings";
import {
  verifyFlutterwavePayment,
  webhookHashMatches,
} from "@/lib/payments/flutterwave";

export const dynamic = "force-dynamic";

/** Activate a paid student: 30 days from today. */
async function activate(txRef: string, flwTxId?: string) {
  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("id, student_id, amount, status")
    .eq("flw_ref", txRef)
    .maybeSingle();

  if (!payment) return { ok: false as const, reason: "no-payment" as const };
  if (payment.status === "approved") return { ok: true as const };

  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  const { error: payErr } = await admin
    .from("payments")
    .update({
      status: "approved",
      flw_status: "successful",
      flw_tx_id: flwTxId ?? null,
      verified_at: new Date().toISOString(),
      notes: "Auto-approved by Flutterwave",
    })
    .eq("id", payment.id);
  if (payErr) return { ok: false as const, reason: payErr.message };

  const { error: profErr } = await admin
    .from("profiles")
    .update({ status: "active", subscription_expires_at: expires.toISOString() })
    .eq("id", payment.student_id);
  if (profErr) return { ok: false as const, reason: profErr.message };

  try {
    await admin.from("notifications").insert({
      student_id: payment.student_id,
      title: "Payment received",
      body: "Your Exam Bridge subscription is active for 30 days.",
    });
  } catch {
    /* non-fatal */
  }

  return { ok: true as const };
}

/** GET — Flutterwave sends the customer back here after checkout. */
export async function GET(req: NextRequest) {
  const txRef = req.nextUrl.searchParams.get("tx_ref") || "";
  const status = (req.nextUrl.searchParams.get("status") || "").toLowerCase();
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "") ||
    req.nextUrl.origin
  ).replace(/\/$/, "");

  if (!txRef) {
    return NextResponse.redirect(`${base}/subscribe?err=missing_ref`);
  }

  const { secretKey } = await getFlutterwaveSecret();
  const verified = await verifyFlutterwavePayment({ secretKey, txRef });

  if (!verified.ok || verified.data.status !== "successful") {
    // mark the row so the admin can see what happened
    try {
      const admin = createAdminClient();
      await admin
        .from("payments")
        .update({
          flw_status: verified.ok ? verified.data.status : "verify_failed",
          status: "pending",
        })
        .eq("flw_ref", txRef);
    } catch {
      /* ignore */
    }
    return NextResponse.redirect(
      `${base}/subscribe/pending?flw=${encodeURIComponent(status || "pending")}`
    );
  }

  const res = await activate(txRef, verified.data.flwTxId);
  if (!res.ok) {
    return NextResponse.redirect(`${base}/subscribe/pending?flw=record_error`);
  }
  return NextResponse.redirect(`${base}/subscribe/success`);
}

/**
 * POST — Flutterwave server-to-server webhook.
 *
 * The body alone is never trusted: the hash (when configured) must match, and
 * the transaction is re-verified against the Flutterwave API before anything is
 * activated. Without a secret key configured we reject rather than trust the
 * caller — otherwise anyone could POST a fake "charge.completed" and get a free
 * subscription.
 */
export async function POST(req: NextRequest) {
  let body: {
    event?: string;
    data?: { id?: number | string; status?: string; tx_ref?: string };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { secretKey, webhookSecret } = await getFlutterwaveSecret();
  if (!secretKey) {
    return NextResponse.json({ ok: false, error: "not configured" }, { status: 503 });
  }

  const received =
    req.headers.get("x-verif-hash") || req.headers.get("verif-hash") || "";
  if (webhookSecret && !webhookHashMatches(received, webhookSecret)) {
    return NextResponse.json({ ok: false, error: "bad hash" }, { status: 401 });
  }

  const txRef = body.data?.tx_ref || "";
  if (body.event !== "charge.completed" || !txRef) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Second factor: ask Flutterwave itself whether this reference succeeded.
  const verified = await verifyFlutterwavePayment({ secretKey, txRef });
  if (!verified.ok || verified.data.status !== "successful") {
    return NextResponse.json({ ok: false, error: "verification failed" }, { status: 400 });
  }

  await activate(txRef, verified.data.flwTxId);
  return NextResponse.json({ ok: true });
}

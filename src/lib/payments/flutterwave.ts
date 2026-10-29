/**
 * Flutterwave integration (v31).
 *
 * Server-to-server only: the secret key never reaches the browser.
 * Flow: initFlutterwavePayment -> hosted checkout -> /api/flutterwave/callback
 *       -> verify by tx_ref -> activate subscription -> /subscribe/success
 */

const FW_BASE = "https://api.flutterwave.com/v3";

export type FlwInitResult =
  | { ok: true; redirectUrl: string; txRef: string }
  | { ok: false; error: string };

export type FlwVerifyResult = {
  status: "successful" | "failed" | "cancelled" | "pending";
  amount: number;
  email: string;
  txRef: string;
  flwTxId?: string;
};

function env(name: string): string {
  return (process.env[name] || "").trim();
}

/** Env wins over the DB value so a bad DB key can't silently break payments. */
export function resolveSecretKey(dbValue?: string | null): string {
  return env("FLUTTERWAVE_SECRET_KEY") || (dbValue || "").trim();
}

export function resolvePublicKey(dbValue?: string | null): string {
  return env("FLUTTERWAVE_PUBLIC_KEY") || (dbValue || "").trim();
}

export function resolveWebhookSecret(dbValue?: string | null): string {
  return env("FLUTTERWAVE_WEBHOOK_SECRET") || (dbValue || "").trim();
}

export function isFlutterwaveConfigured(secretKey: string): boolean {
  return Boolean(resolveSecretKey(secretKey));
}

export async function initFlutterwavePayment(args: {
  secretKey: string;
  email: string;
  name: string;
  amount: number;
  txRef: string;
  title: string;
  description: string;
  redirectUrl: string;
  currency?: string;
}): Promise<FlwInitResult> {
  const secret = resolveSecretKey(args.secretKey);
  if (!secret) {
    return {
      ok: false,
      error: "Card payment is not configured yet. Ask the admin to add a Flutterwave key.",
    };
  }

  try {
    const res = await fetch(`${FW_BASE}/payments/initialise`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: args.txRef,
        amount: args.amount,
        currency: args.currency || "NGN",
        redirect_url: args.redirectUrl,
        customer: { email: args.email, name: args.name },
        customization: {
          title: args.title,
          description: args.description,
        },
        meta: { student_email: args.email },
      }),
    });

    const json = (await res.json()) as {
      status?: string;
      message?: string;
      data?: { redirect_url?: string };
    };

    if (!res.ok || json.status !== "success" || !json.data?.redirect_url) {
      return { ok: false, error: json.message || "Could not start the payment." };
    }
    return { ok: true, redirectUrl: json.data.redirect_url, txRef: args.txRef };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Flutterwave request failed",
    };
  }
}

export async function verifyFlutterwavePayment(args: {
  secretKey: string;
  txRef: string;
}): Promise<{ ok: true; data: FlwVerifyResult } | { ok: false; error: string }> {
  const secret = resolveSecretKey(args.secretKey);
  if (!secret) return { ok: false, error: "Flutterwave is not configured." };

  try {
    const res = await fetch(
      `${FW_BASE}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(
        args.txRef
      )}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${secret}` },
      }
    );
    const json = (await res.json()) as {
      status?: string;
      message?: string;
      data?: {
        status?: string;
        amount?: number;
        email?: string;
        tx_ref?: string;
        id?: number | string;
      };
    };
    if (!res.ok || json.status !== "success" || !json.data) {
      return { ok: false, error: json.message || "Verification failed." };
    }
    const d = json.data;
    const status = (d.status || "pending").toLowerCase();
    return {
      ok: true,
      data: {
        status:
          status === "successful" || status === "failed" || status === "cancelled"
            ? (status as FlwVerifyResult["status"])
            : "pending",
        amount: Number(d.amount || 0),
        email: d.email || "",
        txRef: d.tx_ref || args.txRef,
        flwTxId: d.id != null ? String(d.id) : undefined,
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Flutterwave verify failed",
    };
  }
}

/** Constant-time-ish compare for the webhook hash. */
export function webhookHashMatches(received: string, expected: string): boolean {
  if (!received || !expected) return false;
  const a = String(received);
  const b = String(expected);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

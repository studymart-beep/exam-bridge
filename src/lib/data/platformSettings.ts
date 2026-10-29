import { createClient } from "@/lib/supabase/server";

export type PaymentMode = "manual" | "flutterwave";

export type PlatformSettings = {
  subscription_price: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  app_name: string;
  /** Telegram (or any) support link opened by the floating support button */
  telegram_support_url: string;
  payment_mode: PaymentMode;
  flutterwave_public_key: string;
};

const defaults: PlatformSettings = {
  subscription_price: "5000",
  bank_name: "",
  account_name: "",
  account_number: "",
  app_name: "Exam Bridge",
  telegram_support_url: "",
  payment_mode: "manual",
  flutterwave_public_key: "",
};

async function readSettings(): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("settings").select("key, value");
    (data || []).forEach((r: { key: string; value: string | null }) => {
      map[r.key] = r.value || "";
    });
  } catch {
    /* anon / empty db */
  }
  return map;
}

/** Everything the student-facing UI needs from settings. */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const map = await readSettings();
  const mode = (map.payment_mode || "manual").trim().toLowerCase();
  return {
    subscription_price: map.subscription_price || defaults.subscription_price,
    bank_name: map.bank_name || defaults.bank_name,
    account_name: map.account_name || defaults.account_name,
    account_number: map.account_number || defaults.account_number,
    app_name: map.app_name || defaults.app_name,
    telegram_support_url: map.telegram_support_url || "",
    payment_mode: mode === "flutterwave" ? "flutterwave" : "manual",
    flutterwave_public_key: map.flutterwave_public_key || "",
  };
}

/**
 * Server-only secrets, read from app_secrets (service role) or env.
 * Never rendered into a page and never sent to the browser.
 */
export async function getFlutterwaveSecret(): Promise<{
  secretKey: string;
  webhookSecret: string;
}> {
  const { readSecret } = await import("@/lib/data/secrets");
  const [secretKey, webhookSecret] = await Promise.all([
    readSecret("flutterwave_secret_key"),
    readSecret("flutterwave_webhook_secret"),
  ]);
  return { secretKey, webhookSecret };
}

/** Just the support link (landing page + dashboard FAB). */
export async function getSupportUrl(): Promise<string | null> {
  const map = await readSettings();
  const url = (map.telegram_support_url || "").trim();
  return url ? url : null;
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/actions/admin/guard";
import { writeSecret } from "@/lib/data/secrets";

// Public, non-sensitive settings — readable by any signed-in user (RLS).
const KEYS = [
  "subscription_price",
  "bank_name",
  "account_name",
  "account_number",
  "app_name",
  "telegram_support_url",
  "payment_mode",
  "flutterwave_public_key",
] as const;

// Secrets live in app_secrets (no public read policy) — see lib/data/secrets.ts
const SECRET_KEYS = ["flutterwave_secret_key", "flutterwave_webhook_secret"] as const;

export type SaveSettingsResult = { success?: boolean; error?: string };

export async function saveSettings(formData: FormData): Promise<SaveSettingsResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  for (const key of KEYS) {
    const raw = formData.get(key);
    if (raw === null) continue; // only save what the form actually sent
    let value = String(raw).trim();

    if (key === "payment_mode") value = value === "flutterwave" ? "flutterwave" : "manual";
    if (key === "telegram_support_url" && value && !/^https?:\/\//i.test(value)) {
      value = `https://${value}`;
    }

    const { error } = await supabase.from("settings").upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
    if (error) return { success: false, error: error.message };
  }

  for (const key of SECRET_KEYS) {
    const raw = formData.get(key);
    if (raw === null || !String(raw).trim()) continue;
    const res = await writeSecret(key, String(raw));
    if (res.error) return { success: false, error: res.error };
  }

  revalidatePath("/admin/profile");
  revalidatePath("/admin/settings");
  revalidatePath("/subscribe");
  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true };
}

/** Read one setting (admin only). */
export async function readSetting(key: string): Promise<string> {
  const auth = await requireAdmin();
  if (!auth.ok) return "";
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return (data?.value as string) || "";
}

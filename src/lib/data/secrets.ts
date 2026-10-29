import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Server-only secrets.
 *
 * Stored in public.app_secrets, which has RLS enabled and NO policies, so the
 * anon/authenticated key can never read it — unlike the `settings` table, which
 * every signed-in user can SELECT. Only the service-role client (server code)
 * touches these rows, and values are never rendered into a page.
 */
const SECRET_KEYS = [
  "flutterwave_secret_key",
  "flutterwave_webhook_secret",
] as const;

export type SecretKey = (typeof SECRET_KEYS)[number];

async function table(): Promise<ReturnType<typeof createAdminClient> | null> {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

export async function readSecret(key: SecretKey): Promise<string> {
  const envName: Record<SecretKey, string> = {
    flutterwave_secret_key: "FLUTTERWAVE_SECRET_KEY",
    flutterwave_webhook_secret: "FLUTTERWAVE_WEBHOOK_SECRET",
  };
  const fromEnv = (process.env[envName[key]] || "").trim();
  if (fromEnv) return fromEnv;

  const admin = await table();
  if (!admin) return "";
  try {
    const { data } = await admin
      .from("app_secrets")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    return ((data?.value as string) || "").trim();
  } catch {
    return "";
  }
}

export async function writeSecret(key: SecretKey, value: string): Promise<{ error?: string }> {
  const admin = await table();
  if (!admin) return { error: "Service role key is not configured." };
  const trimmed = value.trim();
  if (!trimmed) return {}; // never blank a stored secret by accident
  try {
    const { error } = await admin
      .from("app_secrets")
      .upsert(
        { key, value: trimmed, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
    return error ? { error: error.message } : {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not store secret" };
  }
}

/** True when a secret is already stored — used so the UI never echoes it back. */
export async function hasSecret(key: SecretKey): Promise<boolean> {
  return Boolean(await readSecret(key));
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/actions/admin/guard";

export async function saveSettings(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const pairs: [string, string][] = [
    ["subscription_price", String(formData.get("subscription_price") || "")],
    ["bank_name", String(formData.get("bank_name") || "")],
    ["account_name", String(formData.get("account_name") || "")],
    ["account_number", String(formData.get("account_number") || "")],
  ];

  const supabase = await createClient();
  for (const [key, value] of pairs) {
    const { error } = await supabase.from("settings").upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
    if (error) return { success: false as const, error: error.message };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/subscribe");
  return { success: true as const };
}

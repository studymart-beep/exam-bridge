import { createClient } from "@/lib/supabase/server";

export type AdminSettingsMap = Record<string, string>;

export async function adminGetSettings(): Promise<AdminSettingsMap> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key, value");
  const map: AdminSettingsMap = {};
  (data || []).forEach((r: { key: string; value: string | null }) => {
    map[r.key] = r.value || "";
  });
  return map;
}

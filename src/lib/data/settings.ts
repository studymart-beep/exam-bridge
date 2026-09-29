import { createClient } from "@/lib/supabase/server";

export type AppSettings = {
  subscription_price: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  app_name: string;
};

export async function getSettings(): Promise<AppSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key, value");
  const map: Record<string, string> = {};
  (data || []).forEach((row: { key: string; value: string | null }) => {
    map[row.key] = row.value || "";
  });
  return {
    subscription_price: map.subscription_price || "5000",
    bank_name: map.bank_name || "",
    account_name: map.account_name || "",
    account_number: map.account_number || "",
    app_name: map.app_name || "Exam Bridge",
  };
}

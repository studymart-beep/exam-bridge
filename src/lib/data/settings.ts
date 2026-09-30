import { createClient } from "@/lib/supabase/server";

export type AppSettings = {
  subscription_price: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  app_name: string;
};

const defaults: AppSettings = {
  subscription_price: "5000",
  bank_name: "",
  account_name: "",
  account_number: "",
  app_name: "Exam Bridge",
};

export async function getSettings(): Promise<AppSettings> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return defaults;
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("settings").select("key, value");
    const map: Record<string, string> = {};
    (data || []).forEach((row: { key: string; value: string | null }) => {
      map[row.key] = row.value || "";
    });
    return {
      subscription_price: map.subscription_price || defaults.subscription_price,
      bank_name: map.bank_name || defaults.bank_name,
      account_name: map.account_name || defaults.account_name,
      account_number: map.account_number || defaults.account_number,
      app_name: map.app_name || defaults.app_name,
    };
  } catch {
    return defaults;
  }
}

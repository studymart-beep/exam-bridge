import { createClient } from "@/lib/supabase/server";

export type PublicSettings = {
  subscription_price: string;
  bank_name: string;
  account_name: string;
  account_number: string;
};

export async function getPublicSettings(): Promise<PublicSettings> {
  const defaults: PublicSettings = {
    subscription_price: "",
    bank_name: "",
    account_name: "",
    account_number: "",
  };
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("settings").select("key, value");
    const map: Record<string, string> = {};
    (data || []).forEach((r: { key: string; value: string | null }) => {
      map[r.key] = r.value || "";
    });
    return {
      subscription_price: map.subscription_price || defaults.subscription_price,
      bank_name: map.bank_name || defaults.bank_name,
      account_name: map.account_name || defaults.account_name,
      account_number: map.account_number || defaults.account_number,
    };
  } catch {
    return defaults;
  }
}

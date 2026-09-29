import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: "student" | "admin";
  status: "inactive" | "active" | "expired";
  subscription_expires_at: string | null;
  created_at: string;
};

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data as Profile | null;
}

/** True when subscription_expires_at is in the future */
export function isSubscriptionActive(profile: Profile | null): boolean {
  if (!profile?.subscription_expires_at) return false;
  return new Date(profile.subscription_expires_at) > new Date();
}

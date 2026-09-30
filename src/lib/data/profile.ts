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

export function isSubscriptionActive(profile: Profile | null): boolean {
  if (!profile) return false;
  if (profile.status === "active" && profile.subscription_expires_at) {
    return new Date(profile.subscription_expires_at) > new Date();
  }
  return false;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error || !data) return null;
    return data as Profile;
  } catch {
    return null;
  }
}

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: "student" | "admin";
  status: "inactive" | "active" | "expired";
  subscription_expires_at: string | null;
  created_at: string;
  avatar_url?: string | null;
  state_of_origin?: string | null;
};

export type ProfileBrief = {
  fullName: string;
  avatarUrl: string | null;
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

/**
 * Resolve profiles.avatar_url (storage path OR old signed URL) to a
 * usable image URL for <img src>.
 */
export async function resolveAvatarUrl(
  stored: string | null | undefined
): Promise<string | null> {
  if (!stored || !stored.trim()) return null;
  const value = stored.trim();

  // Already a full URL (legacy signed URLs kept working)
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  // Storage path: "userId/timestamp.jpg"
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from("avatars")
      .createSignedUrl(value, 60 * 60 * 24 * 7); // 7 days
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

/** Lightweight name + avatar for headers/sidebars (fresh signed URL) */
export async function getCurrentProfileBrief(): Promise<ProfileBrief> {
  const p = await getCurrentProfile();
  const avatarUrl = await resolveAvatarUrl(p?.avatar_url);
  return {
    fullName:
      p?.full_name?.trim() ||
      (p?.role === "admin" ? "Admin" : "Student"),
    avatarUrl,
  };
}

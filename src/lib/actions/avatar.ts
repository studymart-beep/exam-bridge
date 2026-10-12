"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX = 2 * 1024 * 1024;

export async function getAvatarUploadUrl(contentType: string) {
  if (!ALLOWED.includes(contentType)) {
    return { error: "Only JPEG, PNG or WebP allowed" as const };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" as const };

  const ext =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : "jpg";
  const path = `${user.id}/avatar.${ext}`;

  // TODO: replace with API call when using client-only signed uploads
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("avatars")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return { error: error?.message || "Could not create upload URL" as const };
  }

  return {
    path,
    token: data.token,
    signedUrl: data.signedUrl,
    contentType,
  };
}

export async function finalizeAvatar(path: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: "Not signed in" };

  if (!path.startsWith(`${user.id}/`)) {
    return { success: false as const, error: "Invalid path" };
  }

  const admin = createAdminClient();
  const { data: signed } = await admin.storage
    .from("avatars")
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  const avatar_url = signed?.signedUrl || path;

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url })
    .eq("id", user.id);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/profile");
  revalidatePath("/admin/profile");
  revalidatePath("/dashboard");
  return { success: true as const, avatarUrl: avatar_url };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export type AvatarUploadResult =
  | {
      path: string;
      token: string;
      signedUrl: string;
      contentType: string;
    }
  | { error: string };

export async function getAvatarUploadUrl(
  contentType: string
): Promise<AvatarUploadResult> {
  const type = ALLOWED.includes(contentType) ? contentType : "image/jpeg";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const ext =
    type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("avatars")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return { error: error?.message ?? "Could not create upload URL" };
  }

  return {
    path,
    token: data.token,
    signedUrl: data.signedUrl,
    contentType: type,
  };
}

export async function finalizeAvatar(
  path: string
): Promise<
  { success: true; avatarUrl: string } | { success: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in" };

  if (!path.startsWith(`${user.id}/`)) {
    return { success: false, error: "Invalid path" };
  }

  // Store storage PATH only (stable). Display layer signs on read.
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: path })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  const admin = createAdminClient();
  const { data: signed } = await admin.storage
    .from("avatars")
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  const displayUrl = signed?.signedUrl || path;

  // Revalidate layouts so headers/sidebars pick up new avatar
  revalidatePath("/", "layout");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/profile");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/profile");
  revalidatePath("/admin/dashboard");

  return { success: true, avatarUrl: displayUrl };
}

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
  // Cropped output is always JPEG
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

  const admin = createAdminClient();
  const { data: signed } = await admin.storage
    .from("avatars")
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  const avatar_url = signed?.signedUrl || path;

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/profile");
  revalidatePath("/admin/profile");
  revalidatePath("/dashboard");
  return { success: true, avatarUrl: avatar_url };
}

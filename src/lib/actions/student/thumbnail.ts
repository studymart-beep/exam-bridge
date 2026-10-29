"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BYTES = 2 * 1024 * 1024;
const DATA_PREFIX = "data:";

/**
 * Stores a subject thumbnail (sent as a base64 data URL) into the
 * "subject-thumbnails" bucket and records the path on subjects.thumbnail_url.
 * Only an admin can do this. Uses the service-role client so the file write is
 * not blocked by RLS, and separately verifies the caller is an admin.
 */
export async function saveSubjectThumbnail(
  subjectId: string,
  dataUrl: string | null
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in" };

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (me?.role !== "admin") return { success: false, error: "Not authorized" };

  const { data: subject } = await supabase
    .from("subjects")
    .select("id")
    .eq("id", subjectId)
    .maybeSingle();
  if (!subject) return { success: false, error: "Subject not found" };

  const admin = createAdminClient();

  const clearExisting = async () => {
    const { data: cur } = await admin
      .from("subjects")
      .select("thumbnail_url")
      .eq("id", subjectId)
      .maybeSingle();
    const prev = cur?.thumbnail_url as string | null | undefined;
    if (prev && !prev.startsWith(DATA_PREFIX)) {
      await admin.storage.from("subject-thumbnails").remove([prev]);
    }
  };

  // Removing the thumbnail
  if (!dataUrl) {
    await clearExisting();
    const { error } = await admin
      .from("subjects")
      .update({ thumbnail_url: null })
      .eq("id", subjectId);
    if (error) return { success: false, error: error.message };
    invalidate();
    return { success: true };
  }

  if (!dataUrl.startsWith(DATA_PREFIX)) {
    return { success: false, error: "Invalid thumbnail payload" };
  }
  const comma = dataUrl.indexOf(",");
  const meta = dataUrl.slice(0, comma);
  const mime = meta.match(/data:(image\/[a-z+]+)/i)?.[1] || "image/jpeg";
  const base64 = dataUrl.slice(comma + 1);
  const buf = Buffer.from(base64, "base64");
  if (buf.length === 0 || buf.length > MAX_BYTES) {
    return { success: false, error: "Thumbnail must be under 2 MB." };
  }

  let ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";

  await clearExisting();

  const path = `${subjectId}/${Date.now()}.${ext}`;
  const { error: upErr } = await admin.storage
    .from("subject-thumbnails")
    .upload(path, buf, { contentType: mime, upsert: false });
  if (upErr) return { success: false, error: upErr.message };

  const { error } = await admin
    .from("subjects")
    .update({ thumbnail_url: path })
    .eq("id", subjectId);
  if (error) {
    await admin.storage.from("subject-thumbnails").remove([path]);
    return { success: false, error: error.message };
  }

  invalidate();
  return { success: true };
}

function invalidate() {
  revalidatePath("/admin/subjects");
  revalidatePath("/admin/dashboard");
  revalidatePath("/subjects");
  revalidatePath("/");
}

/** Resolve a stored thumbnail path to a usable client URL (signed). */
export async function resolveSubjectThumbnail(
  path: string | null | undefined
): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith(DATA_PREFIX)) return path;
  const admin = createAdminClient();
  const { data } = await admin.storage
    .from("subject-thumbnails")
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  return data?.signedUrl || null;
}

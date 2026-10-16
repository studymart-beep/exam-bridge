"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/actions/admin/guard";

const MAX_BYTES = 500 * 1024 * 1024;

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

function bucketForMime(
  contentType: string
): "videos" | "pdfs" | "materials" | null {
  if (contentType.startsWith("video/")) return "videos";
  if (contentType === "application/pdf") return "pdfs";
  if (
    contentType === "image/jpeg" ||
    contentType === "image/png" ||
    contentType === "image/webp"
  ) {
    return "materials";
  }
  return null;
}

function typeFromMime(
  contentType: string
): "video" | "pdf" | "image" | null {
  if (contentType.startsWith("video/")) return "video";
  if (contentType === "application/pdf") return "pdf";
  if (contentType.startsWith("image/")) return "image";
  return null;
}

/** Signed upload URL — file goes direct to Supabase (bypasses Vercel 4.5 MB limit). */
export async function requestUploadUrl(input: {
  topicId: string;
  fileName: string;
  contentType: string;
  size: number;
}): Promise<
  | { signedUrl: string; path: string; token: string; bucket: string }
  | { error: string }
> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const { topicId, fileName, contentType, size } = input;
  if (!topicId || !fileName || !contentType) {
    return { error: "Missing upload metadata" };
  }
  if (size <= 0 || size > MAX_BYTES) {
    return { error: "File must be between 1 byte and 500 MB" };
  }

  const bucket = bucketForMime(contentType);
  if (!bucket) {
    return { error: "Unsupported file type. Use video, PDF, or JPEG/PNG/WebP." };
  }

  const path = `${topicId}/${Date.now()}-${sanitizeFilename(fileName)}`;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error || !data) {
      return { error: error?.message || "Could not create upload URL" };
    }

    return {
      signedUrl: data.signedUrl,
      path: data.path || path,
      token: data.token,
      bucket,
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Upload URL request failed",
    };
  }
}

/** Insert materials row after client finished PUT to signed URL. */
export async function finalizeMaterial(input: {
  topicId: string;
  title: string;
  path: string;
  sourceType?: "supabase" | "cloudflare";
  mimeType: string;
  size?: number;
  /** Force type e.g. summary_image */
  materialType?: "video" | "pdf" | "image" | "summary_image";
}): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };

  const title = input.title.trim();
  if (!input.topicId || !title || !input.path) {
    return { success: false, error: "Title and path are required" };
  }

  let materialType = input.materialType || null;
  if (!materialType) {
    const type = typeFromMime(input.mimeType);
    if (type && type !== "image") materialType = type;
    else if (input.mimeType.startsWith("image/")) materialType = "image";
  }

  if (!materialType) {
    return { success: false, error: "Could not determine material type" };
  }

  try {
    const supabase = await createClient();
    const { data: maxRow } = await supabase
      .from("materials")
      .select("order_index")
      .eq("topic_id", input.topicId)
      .order("order_index", { ascending: false })
      .limit(1)
      .maybeSingle();

    const row: Record<string, unknown> = {
      topic_id: input.topicId,
      type: materialType,
      title,
      source: input.path,
      source_type: input.sourceType || "supabase",
      order_index: (maxRow?.order_index ?? -1) + 1,
    };

    const { data: inserted, error } = await supabase
      .from("materials")
      .insert(row)
      .select("id")
      .single();
    if (error) {
      if (error.message.includes("source_type")) {
        delete row.source_type;
        const { data: inserted2, error: e2 } = await supabase
          .from("materials")
          .insert(row)
          .select("id")
          .single();
        if (e2 || !inserted2?.id) {
          return { success: false, error: e2?.message || "Insert failed" };
        }
        revalidatePath(`/admin/topics/${input.topicId}/materials`);
        return { success: true, id: inserted2.id as string };
      }
      return { success: false, error: error.message };
    }
    if (!inserted?.id) {
      return { success: false, error: "Insert failed" };
    }

    revalidatePath(`/admin/topics/${input.topicId}/materials`);
    return { success: true, id: inserted.id as string };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Finalize failed",
    };
  }
}

/** Create material from Cloudflare ID / URL (no file). */
export async function createMaterial(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const topic_id = String(formData.get("topic_id") || "");
  const type = String(formData.get("type") || "") as "video" | "pdf" | "image";
  const title = String(formData.get("title") || "").trim();
  let source = String(formData.get("source") || "").trim();
  let source_type = String(formData.get("source_type") || "supabase");

  if (!topic_id || !title || !type) {
    return { success: false as const, error: "Title and type are required" };
  }
  if (!source) {
    return { success: false as const, error: "Source is required" };
  }

  if (type === "video" && !source.startsWith("http") && !source.includes("/")) {
    source_type = "cloudflare";
  }

  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("materials")
    .select("order_index")
    .eq("topic_id", topic_id)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const row: Record<string, unknown> = {
    topic_id,
    type,
    title,
    source,
    source_type,
    order_index: (maxRow?.order_index ?? -1) + 1,
  };

  const { error } = await supabase.from("materials").insert(row);
  if (error) {
    if (error.message.includes("source_type")) {
      delete row.source_type;
      const { error: e2 } = await supabase.from("materials").insert(row);
      if (e2) return { success: false as const, error: e2.message };
    } else {
      return { success: false as const, error: error.message };
    }
  }

  revalidatePath(`/admin/topics/${topic_id}/materials`);
  return { success: true as const };
}

export async function updateMaterial(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const id = String(formData.get("id") || "");
  const topic_id = String(formData.get("topic_id") || "");
  const type = String(formData.get("type") || "") as "video" | "pdf" | "image";
  const title = String(formData.get("title") || "").trim();
  const source = String(formData.get("source") || "").trim();
  if (!id || !title) return { success: false as const, error: "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("materials")
    .update({ type, title, source })
    .eq("id", id);
  if (error) return { success: false as const, error: error.message };

  revalidatePath(`/admin/topics/${topic_id}/materials`);
  return { success: true as const };
}

export async function deleteMaterial(id: string, topicId: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const supabase = await createClient();
  const { data: mat } = await supabase
    .from("materials")
    .select("source, type, source_type")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) return { success: false as const, error: error.message };

  if (mat?.source && (mat.source_type === "supabase" || !mat.source_type)) {
    try {
      const bucket = mat.type === "pdf" ? "pdfs" : "videos";
      let path = mat.source as string;
      if (path.startsWith("videos/")) path = path.slice(7);
      if (path.startsWith("pdfs/")) path = path.slice(5);
      if (mat.type === "video" || mat.type === "pdf") {
        const admin = createAdminClient();
        await admin.storage.from(bucket).remove([path]);
      }
    } catch {
      /* ignore */
    }
  }

  revalidatePath(`/admin/topics/${topicId}/materials`);
  return { success: true as const };
}

/** Signed upload URL for cover images (covers bucket). */
export async function requestCoverUploadUrl(input: {
  materialId: string;
  fileName: string;
  contentType: string;
  size: number;
}): Promise<
  | { signedUrl: string; path: string; bucket: string }
  | { error: string }
> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(input.contentType)) {
    return { error: "Cover must be JPEG, PNG, or WebP" };
  }
  if (input.size <= 0 || input.size > 5 * 1024 * 1024) {
    return { error: "Cover must be between 1 byte and 5 MB" };
  }
  if (!input.materialId) return { error: "Missing material id" };

  const ext =
    input.contentType === "image/png"
      ? "png"
      : input.contentType === "image/webp"
        ? "webp"
        : "jpg";
  const path = `${input.materialId}/${Date.now()}-cover.${ext}`;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from("covers")
      .createSignedUploadUrl(path);
    if (error || !data) {
      return { error: error?.message || "Could not create cover upload URL" };
    }
    return {
      signedUrl: data.signedUrl,
      path: data.path || path,
      bucket: "covers",
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Cover upload URL failed",
    };
  }
}

/** Set cover_url after client finished PUT to covers bucket. */
export async function setMaterialCover(input: {
  materialId: string;
  topicId: string;
  path: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };
  if (!input.materialId || !input.path) {
    return { success: false, error: "Missing material or path" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("materials")
      .update({ cover_url: input.path })
      .eq("id", input.materialId);
    if (error) return { success: false, error: error.message };
    revalidatePath(`/admin/topics/${input.topicId}/materials`);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to save cover",
    };
  }
}

export async function removeMaterialCover(input: {
  materialId: string;
  topicId: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const supabase = await createClient();
    const { data: mat } = await supabase
      .from("materials")
      .select("cover_url")
      .eq("id", input.materialId)
      .maybeSingle();

    const { error } = await supabase
      .from("materials")
      .update({ cover_url: null })
      .eq("id", input.materialId);
    if (error) return { success: false, error: error.message };

    if (mat?.cover_url) {
      try {
        let path = mat.cover_url as string;
        if (path.startsWith("covers/")) path = path.slice("covers/".length);
        const admin = createAdminClient();
        await admin.storage.from("covers").remove([path]);
      } catch {
        /* ignore storage cleanup */
      }
    }

    revalidatePath(`/admin/topics/${input.topicId}/materials`);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to remove cover",
    };
  }
}

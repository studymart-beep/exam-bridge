"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/actions/admin/guard";

const MAX_BYTES = 500 * 1024 * 1024;

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

function bucketForMime(contentType: string): "videos" | "pdfs" | null {
  if (contentType.startsWith("video/")) return "videos";
  if (contentType === "application/pdf") return "pdfs";
  return null;
}

function typeFromMime(contentType: string): "video" | "pdf" | "image" | null {
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
    return { error: "Unsupported file type. Use video/* or application/pdf." };
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
}): Promise<{ success: true } | { success: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };

  const title = input.title.trim();
  if (!input.topicId || !title || !input.path) {
    return { success: false, error: "Title and path are required" };
  }

  const type = typeFromMime(input.mimeType);
  if (!type || type === "image") {
    // image still via source URL path below if needed
  }
  const materialType =
    type && type !== "image"
      ? type
      : input.mimeType.startsWith("image/")
        ? "image"
        : null;

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

    const { error } = await supabase.from("materials").insert(row);
    if (error) {
      if (error.message.includes("source_type")) {
        delete row.source_type;
        const { error: e2 } = await supabase.from("materials").insert(row);
        if (e2) return { success: false, error: e2.message };
      } else {
        return { success: false, error: error.message };
      }
    }

    revalidatePath(`/admin/topics/${input.topicId}/materials`);
    return { success: true };
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

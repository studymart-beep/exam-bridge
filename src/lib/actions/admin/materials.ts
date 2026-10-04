"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/actions/admin/guard";

const MAX_BYTES = 500 * 1024 * 1024;

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export async function createMaterial(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const topic_id = String(formData.get("topic_id") || "");
  const type = String(formData.get("type") || "") as "video" | "pdf" | "image";
  const title = String(formData.get("title") || "").trim();
  let source = String(formData.get("source") || "").trim();
  let source_type = String(formData.get("source_type") || "supabase");
  const file = formData.get("file");

  if (!topic_id || !title || !type) {
    return { success: false as const, error: "Title and type are required" };
  }

  try {
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_BYTES) {
        return { success: false as const, error: "File must be 500 MB or smaller" };
      }
      if (type === "video" && !file.type.startsWith("video/")) {
        return { success: false as const, error: "Invalid video file type" };
      }
      if (type === "pdf" && file.type !== "application/pdf") {
        return { success: false as const, error: "Invalid PDF file type" };
      }

      const bucket = type === "pdf" ? "pdfs" : "videos";
      const path = `${topic_id}/${Date.now()}-${sanitizeFilename(file.name)}`;
      const admin = createAdminClient();
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: upErr } = await admin.storage
        .from(bucket)
        .upload(path, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
      if (upErr) return { success: false as const, error: upErr.message };
      source = path;
      source_type = "supabase";
    } else if (source && (type === "video" || type === "pdf")) {
      // Cloudflare ID or external URL
      if (!source.startsWith("http") && !source.includes("/")) {
        source_type = "cloudflare";
      }
    }

    if (!source) {
      return { success: false as const, error: "Upload a file or provide a source" };
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
      order_index: (maxRow?.order_index ?? -1) + 1,
    };
    // source_type may not exist until SETUP_V9 SQL is run
    row.source_type = source_type;

    const { error } = await supabase.from("materials").insert(row);
    if (error) {
      // retry without source_type if column missing
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
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : "Upload failed",
    };
  }
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
      /* ignore storage cleanup errors */
    }
  }

  revalidatePath(`/admin/topics/${topicId}/materials`);
  return { success: true as const };
}

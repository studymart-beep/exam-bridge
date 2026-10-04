"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type SignedUrlResult =
  | { url: string; expiresAt?: string; subscriptionExpiresAt?: string | null }
  | { error: string };

export async function getMySubscriptionStatus(): Promise<{
  active: boolean;
  expiresAt: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { active: false, expiresAt: null };
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_expires_at")
      .eq("id", user.id)
      .maybeSingle();
    const expiresAt = profile?.subscription_expires_at ?? null;
    const active = !!expiresAt && new Date(expiresAt) > new Date();
    return { active, expiresAt };
  } catch {
    return { active: false, expiresAt: null };
  }
}

export async function getMaterialSignedUrl(
  materialId: string
): Promise<SignedUrlResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not signed in" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_expires_at")
      .eq("id", user.id)
      .maybeSingle();

    const expiresAt = profile?.subscription_expires_at ?? null;
    if (!expiresAt || new Date(expiresAt) <= new Date()) {
      return { error: "Subscription required" };
    }

    const { data: material, error: matErr } = await supabase
      .from("materials")
      .select("id, type, source, source_type, title")
      .eq("id", materialId)
      .maybeSingle();

    if (matErr || !material?.source) {
      return { error: "Material not found" };
    }

    const sourceType = (material.source_type as string) || "supabase";

    // activity log (best-effort)
    try {
      await supabase.from("activity_logs").insert({
        student_id: user.id,
        action: "material_access",
        metadata: { materialId, type: material.type },
      });
    } catch {
      /* table may not exist */
    }

    if (sourceType === "cloudflare") {
      // Plain stream URL until token auth is added
      const id = material.source;
      const url = id.startsWith("http")
        ? id
        : `https://customer.cloudflarestream.com/${id}/manifest/video.m3u8`;
      return { url, subscriptionExpiresAt: expiresAt };
    }

    // supabase storage path: may be "videos/..." or relative "topicId/file"
    let path = material.source;
    let bucket = material.type === "pdf" ? "pdfs" : "videos";
    if (path.startsWith("videos/")) {
      bucket = "videos";
      path = path.slice("videos/".length);
    } else if (path.startsWith("pdfs/")) {
      bucket = "pdfs";
      path = path.slice("pdfs/".length);
    } else if (material.type === "image") {
      return { url: material.source, subscriptionExpiresAt: expiresAt };
    }

    // Prefer admin client for reliable signed URLs on private buckets
    const admin = createAdminClient();
    const { data: signed, error: signErr } = await admin.storage
      .from(bucket)
      .createSignedUrl(path, 300);

    if (signErr || !signed?.signedUrl) {
      return { error: signErr?.message || "Could not create signed URL" };
    }

    return {
      url: signed.signedUrl,
      subscriptionExpiresAt: expiresAt,
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to load material",
    };
  }
}

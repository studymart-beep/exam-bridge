"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { ok: false, error: "Not signed in" };
    }

    let admin;
    try {
      admin = createAdminClient();
    } catch (e) {
      return {
        ok: false,
        error: `Admin client error: ${e instanceof Error ? e.message : String(e)}`,
      };
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return {
        ok: false,
        error: `Profile lookup failed: ${profileError.message}`,
      };
    }

    if (!profile || profile.role !== "admin") {
      return { ok: false, error: "Not authorized" };
    }

    return { ok: true, userId: user.id };
  } catch (e) {
    return {
      ok: false,
      error: `Unexpected error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}
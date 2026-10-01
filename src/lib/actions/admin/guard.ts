"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  // Step 1: get the authenticated user (uses the user's session cookies)
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: "Not signed in" };
  }

  // Step 2: check role using the service-role client (bypasses RLS)
  const admin = createAdminClient();
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
}
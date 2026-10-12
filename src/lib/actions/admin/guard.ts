"use server";

import { createClient } from "@/lib/supabase/server";

export async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const supabase = await createClient();
  let {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { data: refreshed, error } = await supabase.auth.refreshSession();
    if (error || !refreshed.user) {
      return {
        ok: false,
        error: "Session expired — please sign in again",
      };
    }
    user = refreshed.user;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { ok: false, error: "Not authorized" };
  }
  return { ok: true, userId: user.id };
}

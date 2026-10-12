"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/actions/admin/guard";

export async function updateAdminProfile(input: {
  fullName: string;
  phone: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };

  const full_name = input.fullName.trim();
  if (!full_name) return { success: false, error: "Name is required" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name, phone: input.phone.trim() || null })
    .eq("id", auth.userId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/profile");
  return { success: true };
}

export async function changeAdminPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };

  if (!input.newPassword || input.newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { success: false, error: "Not signed in" };

  const { error: signErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: input.currentPassword,
  });
  if (signErr) return { success: false, error: "Current password is incorrect" };

  const { error } = await supabase.auth.updateUser({
    password: input.newPassword,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

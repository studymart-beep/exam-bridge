"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(input: {
  fullName: string;
  phone: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not signed in" };

    const full_name = input.fullName.trim();
    if (!full_name) return { success: false, error: "Name is required" };

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name,
        phone: input.phone.trim() || null,
      })
      .eq("id", user.id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Update failed",
    };
  }
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return { success: false, error: "Not signed in" };

    if (!input.newPassword || input.newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters" };
    }

    // Re-auth with current password
    const { error: signErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: input.currentPassword,
    });
    if (signErr) {
      return { success: false, error: "Current password is incorrect" };
    }

    const { error } = await supabase.auth.updateUser({
      password: input.newPassword,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Password change failed",
    };
  }
}

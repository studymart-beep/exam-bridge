"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/actions/admin/guard";

export async function setStudentStatus(userId: string, status: "active" | "inactive") {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    admin = await createClient();
  }

  const { error } = await admin.from("profiles").update({ status }).eq("id", userId);
  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true as const };
}

export async function deleteStudent(userId: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    admin = await createClient();
  }

  // Delete profile (auth.users cascade may need service role)
  const { error } = await admin.from("profiles").delete().eq("id", userId);
  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/users");
  return { success: true as const };
}

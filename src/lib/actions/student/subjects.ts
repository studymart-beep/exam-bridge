"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { replaceMySubjects } from "@/lib/data/student/mySubjects";

export type SubjectsResult = { success?: boolean; error?: string };

/** Validate + persist the ids submitted by the subject picker. */
export async function saveMySubjects(
  subjectIds: string[]
): Promise<SubjectsResult> {
  if (!subjectIds?.length) {
    return { error: "Select at least one subject." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  // keep only ids that exist and are active
  const { data: valid } = await supabase
    .from("subjects")
    .select("id")
    .in("id", subjectIds)
    .eq("is_active", true);
  const ids = (valid || []).map((r: { id: string }) => r.id);
  if (!ids.length) return { error: "Those subjects are no longer available." };

  const res = await replaceMySubjects(user.id, ids);
  if (res.error) return { error: res.error };

  revalidatePath("/subjects");
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: true };
}

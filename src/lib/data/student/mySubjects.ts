import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StudentSubject } from "@/lib/data/student/subjects";

/** Subject ids the student selected (registration / profile). */
export async function getMySubjectIds(
  studentId?: string
): Promise<string[]> {
  if (!studentId) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("student_subjects")
      .select("subject_id")
      .eq("student_id", studentId);
    return (data || []).map((r: { subject_id: string }) => r.subject_id);
  } catch {
    return [];
  }
}

/** Published subjects the student picked, in the platform's order. */
export async function listMySubjects(
  studentId?: string
): Promise<StudentSubject[]> {
  const ids = await getMySubjectIds(studentId);
  if (!ids.length) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .in("id", ids)
      .eq("is_active", true)
      .order("order_index");
    return (data as StudentSubject[]) || [];
  } catch {
    return [];
  }
}

/** Lightweight list for the registration picker (public data). */
export async function listSubjectsForPicker(): Promise<
  { id: string; name: string; letter: string; slug: string }[]
> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("subjects")
      .select("id, name, letter, slug")
      .eq("is_active", true)
      .order("order_index");
    return (
      (data || []).map(
        (s: { id: string; name: string; letter: string | null; slug: string }) => ({
          id: s.id,
          name: s.name,
          letter: s.letter || s.name.charAt(0),
          slug: s.slug,
        })
      )
    );
  } catch {
    return [];
  }
}

/**
 * Create the profile's subject picks right after sign-up (service role).
 */
export async function attachSubjectsForUser(
  userId: string,
  subjectIds: string[]
): Promise<{ error?: string }> {
  if (!userId || !subjectIds.length) return { error: "Nothing to save." };
  try {
    const admin = createAdminClient();
    const { data: valid } = await admin
      .from("subjects")
      .select("id")
      .in("id", subjectIds)
      .eq("is_active", true);
    const ids = (valid || []).map((r: { id: string }) => r.id);
    if (!ids.length) return { error: "No valid subjects found." };
    const res = await replaceMySubjects(userId, ids);
    return res;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not save subjects" };
  }
}

/**
 * Replace the student's subject picks.
 * Works for the signed-in student and for admins (service role fallback).
 */
export async function replaceMySubjects(
  studentId: string,
  subjectIds: string[]
): Promise<{ error?: string }> {
  const unique = Array.from(new Set(subjectIds.filter(Boolean)));
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && (user.id === studentId || user.role === "admin")) {
      const { error } = await supabase.rpc("replace_student_subjects", {
        p_student: studentId,
        p_subjects: unique,
      });
      if (!error) return {};
      // RPC missing (older DB) — fall back to delete + insert
      await supabase.from("student_subjects").delete().eq("student_id", studentId);
      if (unique.length) {
        const { error: insErr } = await supabase
          .from("student_subjects")
          .insert(
            unique.map((subject_id) => ({ student_id: studentId, subject_id }))
          );
        if (insErr) return { error: insErr.message };
      }
      return {};
    }
  } catch {
    /* fall through to admin client */
  }

  try {
    const admin = createAdminClient();
    await admin.from("student_subjects").delete().eq("student_id", studentId);
    if (unique.length) {
      const { error } = await admin
        .from("student_subjects")
        .insert(unique.map((subject_id) => ({ student_id: studentId, subject_id })));
      if (error) return { error: error.message };
    }
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not save subjects",
    };
  }
}

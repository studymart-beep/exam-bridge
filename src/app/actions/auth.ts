"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { attachSubjectsForUser } from "@/lib/data/student/mySubjects";
import { checkRate, clientIp } from "@/lib/security/rateLimit";

export type AuthResult = { error?: string; success?: boolean };

const GENERIC_AUTH_ERROR = "Invalid email or password.";

/** subjectIds arrives either as a JSON array or repeated/comma-separated ids */
async function countActiveSubjects(): Promise<number> {
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("subjects")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);
    return count || 0;
  } catch {
    return 0;
  }
}

function parseSubjectIds(raw: FormDataEntryValue | null): string[] {
  if (Array.isArray(raw)) {
    return raw.flatMap((v) => String(v).split(",")).map((s) => s.trim()).filter(Boolean);
  }
  const text = String(raw ?? "").trim();
  if (!text) return [];
  if (text.startsWith("[")) {
    try {
      const arr = JSON.parse(text);
      if (Array.isArray(arr)) return arr.map((v) => String(v)).filter(Boolean);
    } catch {
      /* fall through */
    }
  }
  return text.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function signUpStudent(formData: FormData): Promise<AuthResult> {
  const hdrs = await headers();
  const ip = clientIp(hdrs);
  const { state: signUpState } = checkRate("signup", ip, hdrs);
  if (!signUpState.ok) return { error: "Too many sign-ups from this device. Try again later." };

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const stateOfOrigin = String(formData.get("stateOfOrigin") || "").trim();

  if (!email || !password || !fullName) {
    return { error: "Name, email and password are required." };
  }
  if (!stateOfOrigin) {
    return { error: "State of origin is required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const subjectIds = parseSubjectIds(formData.get("subjectIds"));
  if (!subjectIds.length) {
    const available = await countActiveSubjects();
    if (available > 0) {
      return { error: "Select at least one subject you are studying." };
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        state_of_origin: stateOfOrigin,
        subject_ids: subjectIds,
      },
    },
  });

  if (error) return { error: error.message };

  // Persist subject picks against the new profile (handle_new_user trigger
  // creates the row). Works whether or not email confirmation is enabled.
  const userId = data.user?.id;
  if (userId && subjectIds.length) {
    const res = await attachSubjectsForUser(userId, subjectIds);
    if (res.error) return { error: res.error };
  }

  redirect("/dashboard");
}

export async function signInStudent(formData: FormData): Promise<AuthResult> {
  const hdrs = await headers();
  const ip = clientIp(hdrs);
  const { state: loginState, markFailure } = checkRate("login", ip, hdrs);
  if (!loginState.ok) return { error: GENERIC_AUTH_ERROR };

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: GENERIC_AUTH_ERROR };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    markFailure?.();
    return { error: GENERIC_AUTH_ERROR };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "student") {
    await supabase.auth.signOut();
    markFailure?.();
    return { error: GENERIC_AUTH_ERROR };
  }

  redirect("/dashboard");
}

export async function signInAdmin(formData: FormData): Promise<AuthResult> {
  const hdrs = await headers();
  const ip = clientIp(hdrs);
  const { state: loginState, markFailure } = checkRate("login-admin", ip, hdrs);
  if (!loginState.ok) return { error: GENERIC_AUTH_ERROR };

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    markFailure?.();
    return { error: GENERIC_AUTH_ERROR };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    markFailure?.();
    return { error: GENERIC_AUTH_ERROR };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    markFailure?.();
    return { error: GENERIC_AUTH_ERROR };
  }

  redirect("/admin/dashboard");
}

export async function requestPasswordReset(
  formData: FormData
): Promise<AuthResult> {
  const email = String(formData.get("email") || "").trim();
  if (!email) {
    return { error: "Enter your email address." };
  }

  const supabase = await createClient();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    "";
  const base = origin
    ? origin.startsWith("http")
      ? origin
      : `https://${origin}`
    : undefined;

  // Always succeed-looking for privacy (Supabase still rate-limits)
  // Must go through /auth/callback so the recovery code becomes a session
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: base
      ? `${base}/auth/callback?next=/reset-password`
      : undefined,
  });

  return { success: true };
}

export async function updatePassword(
  formData: FormData
): Promise<AuthResult> {
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirmPassword") || "");

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  redirect("/login");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signOutAdmin(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

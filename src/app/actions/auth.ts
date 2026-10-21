"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthResult = { error?: string; success?: boolean };

const GENERIC_AUTH_ERROR = "Invalid email or password.";

export async function signUpStudent(formData: FormData): Promise<AuthResult> {
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

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        state_of_origin: stateOfOrigin,
      },
    },
  });

  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function signInStudent(formData: FormData): Promise<AuthResult> {
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
  if (error) return { error: GENERIC_AUTH_ERROR };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "student") {
    await supabase.auth.signOut();
    return { error: GENERIC_AUTH_ERROR };
  }

  redirect("/dashboard");
}

export async function signInAdmin(formData: FormData): Promise<AuthResult> {
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
  if (error) return { error: GENERIC_AUTH_ERROR };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
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

import { createClient } from "@/lib/supabase/server";

export type AdminStudentRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  subscription_expires_at: string | null;
  created_at: string;
};

export async function adminListStudents(): Promise<AdminStudentRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false });
  return (data as AdminStudentRow[]) || [];
}

export async function adminGetStudent(id: string): Promise<AdminStudentRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  return data as AdminStudentRow | null;
}

export async function adminGetStudentPayments(studentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function adminGetStudentAttempts(studentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cbt_attempts")
    .select("*, cbt_exams(title)")
    .eq("student_id", studentId)
    .order("started_at", { ascending: false });
  return data || [];
}

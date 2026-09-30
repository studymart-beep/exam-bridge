import { createClient } from "@/lib/supabase/server";

export type AdminPaymentRow = {
  id: string;
  student_id: string;
  amount: number;
  method: string;
  status: string;
  receipt_url: string | null;
  receipt_name: string | null;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
  student_name?: string | null;
  student_email?: string | null;
};

export async function adminListPayments(): Promise<AdminPaymentRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });
  if (!data?.length) return [];

  const ids = [...new Set(data.map((p: { student_id: string }) => p.student_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", ids);
  const map: Record<string, { full_name: string | null; email: string | null }> = {};
  (profiles || []).forEach((p: { id: string; full_name: string | null; email: string | null }) => {
    map[p.id] = p;
  });

  return data.map((p: AdminPaymentRow) => ({
    ...p,
    student_name: map[p.student_id]?.full_name || null,
    student_email: map[p.student_id]?.email || null,
  }));
}

export async function adminListSubscriptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, status, subscription_expires_at, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false });
  return data || [];
}

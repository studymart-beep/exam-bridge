import { createClient } from "@/lib/supabase/server";

export type AdminSubjectRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  letter: string | null;
  color: string | null;
  bg_color: string | null;
  order_index: number;
  is_active: boolean;
  general_cbt_id: string | null;
  topic_count?: number;
};

export async function adminListSubjects(): Promise<AdminSubjectRow[]> {
  const supabase = await createClient();
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .order("order_index");
  if (!subjects?.length) return [];

  const { data: topics } = await supabase.from("topics").select("id, subject_id");
  const counts: Record<string, number> = {};
  (topics || []).forEach((t: { subject_id: string }) => {
    counts[t.subject_id] = (counts[t.subject_id] || 0) + 1;
  });

  return subjects.map((s: AdminSubjectRow) => ({
    ...s,
    topic_count: counts[s.id] || 0,
  }));
}

export async function adminGetSubject(id: string): Promise<AdminSubjectRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("subjects").select("*").eq("id", id).maybeSingle();
  return data as AdminSubjectRow | null;
}

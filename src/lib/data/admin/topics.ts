import { createClient } from "@/lib/supabase/server";

export type AdminTopicRow = {
  id: string;
  subject_id: string;
  title: string;
  slug: string | null;
  description: string | null;
  duration: string | null;
  order_index: number;
  is_published: boolean;
};

export async function adminListTopicsBySubject(subjectId: string): Promise<AdminTopicRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("topics")
    .select("*")
    .eq("subject_id", subjectId)
    .order("order_index");
  return (data as AdminTopicRow[]) || [];
}

export async function adminGetTopic(id: string): Promise<AdminTopicRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("topics").select("*").eq("id", id).maybeSingle();
  return data as AdminTopicRow | null;
}

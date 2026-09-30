import { createClient } from "@/lib/supabase/server";

export type StudentSubject = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  letter: string | null;
  color: string | null;
  bg_color: string | null;
  order_index: number;
  general_cbt_id: string | null;
};

export type StudentTopic = {
  id: string;
  subject_id: string;
  title: string;
  slug: string | null;
  description: string | null;
  duration: string | null;
  order_index: number;
  is_published: boolean;
};

export async function listPublishedSubjects(): Promise<StudentSubject[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .eq("is_active", true)
      .order("order_index");
    return (data as StudentSubject[]) || [];
  } catch {
    return [];
  }
}

export async function getSubjectBySlug(slug: string): Promise<StudentSubject | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    return (data as StudentSubject) || null;
  } catch {
    return null;
  }
}

export async function getTopicsBySubject(subjectId: string): Promise<StudentTopic[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("topics")
      .select("*")
      .eq("subject_id", subjectId)
      .eq("is_published", true)
      .order("order_index");
    return (data as StudentTopic[]) || [];
  } catch {
    return [];
  }
}

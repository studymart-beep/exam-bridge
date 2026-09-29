import { createClient } from "@/lib/supabase/server";

export type DbSubject = {
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
};

export type DbTopic = {
  id: string;
  subject_id: string;
  title: string;
  slug: string | null;
  description: string | null;
  duration: string | null;
  order_index: number;
  is_published: boolean;
};

export type DbMaterial = {
  id: string;
  topic_id: string;
  type: "video" | "pdf" | "image";
  title: string;
  source: string | null;
  order_index: number;
};

export async function getSubjects(): Promise<DbSubject[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("*")
    .eq("is_active", true)
    .order("order_index");
  return (data as DbSubject[]) || [];
}

export async function getSubjectBySlug(slug: string): Promise<DbSubject | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as DbSubject) || null;
}

export async function getTopicsBySubjectId(subjectId: string): Promise<DbTopic[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("topics")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("is_published", true)
    .order("order_index");
  return (data as DbTopic[]) || [];
}

export async function getTopicById(id: string): Promise<DbTopic | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("topics").select("*").eq("id", id).maybeSingle();
  return (data as DbTopic) || null;
}

export async function getMaterialsByTopicId(topicId: string): Promise<DbMaterial[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("materials")
    .select("*")
    .eq("topic_id", topicId)
    .order("order_index");
  return (data as DbMaterial[]) || [];
}

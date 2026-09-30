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

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getSubjects(): Promise<DbSubject[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .eq("is_active", true)
      .order("order_index");
    return (data as DbSubject[]) || [];
  } catch {
    return [];
  }
}

export async function getSubjectBySlug(slug: string): Promise<DbSubject | null> {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return (data as DbSubject) || null;
  } catch {
    return null;
  }
}

export async function getTopicsBySubjectId(subjectId: string): Promise<DbTopic[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("topics")
      .select("*")
      .eq("subject_id", subjectId)
      .eq("is_published", true)
      .order("order_index");
    return (data as DbTopic[]) || [];
  } catch {
    return [];
  }
}

export async function getTopicById(id: string): Promise<DbTopic | null> {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("topics")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as DbTopic) || null;
  } catch {
    return null;
  }
}

export async function getMaterialsByTopicId(topicId: string): Promise<DbMaterial[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("materials")
      .select("*")
      .eq("topic_id", topicId)
      .order("order_index");
    return (data as DbMaterial[]) || [];
  } catch {
    return [];
  }
}

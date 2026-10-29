import { createClient } from "@/lib/supabase/server";
import { resolveSubjectThumbnail } from "@/lib/actions/student/thumbnail";

export type StudentSubject = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  letter: string | null;
  color: string | null;
  bg_color: string | null;
  thumbnail_url: string | null;
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
    const rows = (data as StudentSubject[]) || [];
    return Promise.all(
      rows.map(async (row) => ({
        ...row,
        thumbnail_url: await resolveSubjectThumbnail(row.thumbnail_url),
      }))
    );
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
    const row = data as StudentSubject | null;
    if (!row) return null;
    return {
      ...row,
      thumbnail_url: await resolveSubjectThumbnail(row.thumbnail_url),
    };
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

import { createClient } from "@/lib/supabase/server";

export type StudentMaterial = {
  id: string;
  topic_id: string;
  type: "video" | "pdf" | "image" | "summary_image";
  title: string;
  source: string | null;
  source_type?: string | null;
  order_index: number;
};

export async function listMaterialsByTopic(
  topicId: string
): Promise<StudentMaterial[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("materials")
      .select("*")
      .eq("topic_id", topicId)
      .neq("type", "summary_image")
      .order("order_index");
    return (data as StudentMaterial[]) || [];
  } catch {
    return [];
  }
}

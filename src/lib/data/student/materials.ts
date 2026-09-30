import { createClient } from "@/lib/supabase/server";

export type StudentMaterial = {
  id: string;
  topic_id: string;
  type: "video" | "pdf" | "image";
  title: string;
  source: string | null;
  order_index: number;
};

export async function listMaterialsByTopic(topicId: string): Promise<StudentMaterial[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("materials")
      .select("*")
      .eq("topic_id", topicId)
      .order("order_index");
    return (data as StudentMaterial[]) || [];
  } catch {
    return [];
  }
}

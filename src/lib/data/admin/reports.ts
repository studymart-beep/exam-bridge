import { createClient } from "@/lib/supabase/server";

export async function adminGetDashboardStats() {
  const supabase = await createClient();

  const [
    { count: students },
    { count: subjects },
    { count: topics },
    { count: exams },
    { count: pendingPayments },
    { count: activeSubs },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("subjects").select("*", { count: "exact", head: true }),
    supabase.from("topics").select("*", { count: "exact", head: true }),
    supabase.from("cbt_exams").select("*", { count: "exact", head: true }),
    supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student").eq("status", "active"),
  ]);

  const { data: activity } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  // Last 7 days attempts
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const { data: attempts } = await supabase
    .from("cbt_attempts")
    .select("started_at")
    .gte("started_at", sevenDaysAgo.toISOString());

  const daily: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = (attempts || []).filter(
      (a: { started_at: string }) => a.started_at?.slice(0, 10) === key
    ).length;
    daily.push({ day: key.slice(5), count });
  }

  return {
    students: students || 0,
    subjects: subjects || 0,
    topics: topics || 0,
    exams: exams || 0,
    pendingPayments: pendingPayments || 0,
    activeSubs: activeSubs || 0,
    activity: activity || [],
    dailyAttempts: daily,
  };
}

export async function adminGetReportData() {
  const supabase = await createClient();
  const thirty = new Date();
  thirty.setDate(thirty.getDate() - 29);

  const { data: attempts } = await supabase
    .from("cbt_attempts")
    .select("started_at, score, total, passed, exam_id")
    .gte("started_at", thirty.toISOString());

  const byDay: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    byDay[d.toISOString().slice(0, 10)] = 0;
  }
  (attempts || []).forEach((a: { started_at: string }) => {
    const k = a.started_at?.slice(0, 10);
    if (k && k in byDay) byDay[k] += 1;
  });

  const submitted = (attempts || []).filter(
    (a: { passed: boolean | null }) => a.passed !== null
  );
  const passRate =
    submitted.length > 0
      ? Math.round(
          (submitted.filter((a: { passed: boolean | null }) => a.passed).length /
            submitted.length) *
            100
        )
      : 0;

  const { count: topicCount } = await supabase
    .from("topics")
    .select("*", { count: "exact", head: true });
  const { data: progressRows } = await supabase.from("progress").select("topic_id");
  const uniqueTopics = new Set(
    (progressRows || []).map((p: { topic_id: string }) => p.topic_id)
  );
  const completionRate =
    topicCount && topicCount > 0
      ? Math.round((uniqueTopics.size / topicCount) * 100)
      : 0;

  return {
    attemptsOverTime: Object.entries(byDay).map(([day, count]) => ({
      day: day.slice(5),
      count,
    })),
    passRate,
    completionRate,
    totalAttempts: (attempts || []).length,
  };
}

export async function adminListNotifications(limit = 50) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

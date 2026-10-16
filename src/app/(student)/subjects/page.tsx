import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import SubjectCard from "@/components/student/SubjectCard";
import GuestSubjectsList from "@/components/student/GuestSubjectsList";
import { listPublishedSubjects } from "@/lib/data/student/subjects";
import { getCurrentProfile } from "@/lib/data/student/profile";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const list = await listPublishedSubjects();
  const profile = await getCurrentProfile();

  // Topic counts
  const counts: Record<string, number> = {};
  try {
    const supabase = await createClient();
    const { data: topics } = await supabase
      .from("topics")
      .select("subject_id")
      .eq("is_published", true);
    for (const t of topics || []) {
      counts[t.subject_id] = (counts[t.subject_id] || 0) + 1;
    }
  } catch {
    /* empty ok */
  }

  // Guest preview (not logged in) — middleware allows /subjects without auth
  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-border">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <h1 className="font-heading font-semibold text-text-primary">
              Subjects
            </h1>
            <div className="flex gap-2 text-sm">
              <Link href="/login" className="text-primary font-medium">
                Log in
              </Link>
              <Link
                href="/register"
                className="text-primary font-semibold"
              >
                Register
              </Link>
            </div>
          </div>
        </header>
        <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">
          <p className="text-sm text-text-secondary">
            Preview available subjects. Register to open full content.
          </p>
          {list.length === 0 ? (
            <Card className="text-center py-10">
              <p className="text-sm text-text-muted">No subjects yet.</p>
            </Card>
          ) : (
            <GuestSubjectsList
              subjects={list.map((s) => ({
                id: s.id,
                name: s.name,
                slug: s.slug,
                letter: s.letter || s.name.charAt(0),
                topicCount: counts[s.id] || 0,
              }))}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <StudentHeader
        title="Subjects"
        userName={profile.full_name || "Student"}
      />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">
        {list.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-sm text-text-muted">
              No subjects yet. Check back soon.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {list.map((s) => (
              <SubjectCard
                key={s.id}
                subject={{
                  id: s.id,
                  name: s.name,
                  slug: s.slug,
                  description: s.description || "",
                  letter: s.letter || s.name.charAt(0),
                  color: s.color || "#166534",
                  bgColor: s.bg_color || "#DCFCE7",
                  topicCount: counts[s.id] || 0,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

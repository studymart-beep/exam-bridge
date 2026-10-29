import StudentHeader from "@/components/student/StudentHeader";
import SubjectsTabs from "@/components/student/SubjectsTabs";
import GuestSubjectsList from "@/components/student/GuestSubjectsList";
import Section from "@/components/ui/Section";
import { listPublishedSubjects } from "@/lib/data/student/subjects";
import { listMySubjects } from "@/lib/data/student/mySubjects";
import { getCurrentProfile } from "@/lib/data/student/profile";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const list = await listPublishedSubjects();
  const profile = await getCurrentProfile();

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

  if (!profile) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-border/60">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <h1 className="font-heading font-extrabold text-text-primary">
              Subjects
            </h1>
            <div className="flex gap-3 text-sm">
              <Link href="/login" className="text-primary font-semibold">
                Log in
              </Link>
              <Link href="/register" className="text-primary font-semibold">
                Register
              </Link>
            </div>
          </div>
        </header>
        <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto">
          <Section
            title="Available subjects"
            subtitle="Preview subjects. Register to open full content."
            tint="green"
            goldBar
          >
            {list.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">
                No subjects yet.
              </p>
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
          </Section>
        </div>
      </div>
    );
  }

  const mine = await listMySubjects(profile.id);
  const mineIds = new Set(mine.map((s) => s.id));

  const mapRow = (s: (typeof list)[number]) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description || "",
    letter: s.letter || s.name.charAt(0),
    color: s.color || "#0A8B5B",
    bgColor: s.bg_color || "#DDF8E8",
    thumbnailUrl: s.thumbnail_url || null,
    topicCount: counts[s.id] || 0,
  });

  // My Subjects first inside "All Subjects" so selections stay on top
  const all = [...list]
    .sort((a, b) => Number(mineIds.has(b.id)) - Number(mineIds.has(a.id)))
    .map(mapRow);

  return (
    <div>
      <StudentHeader
        title="Subjects"
        userName={profile.full_name || "Student"}
      />
      <div className="px-4 sm:px-6 py-5 max-w-5xl mx-auto">
        <SubjectsTabs
          mine={mine.map(mapRow)}
          all={all}
          hasPicks={mine.length > 0}
        />
      </div>
    </div>
  );
}

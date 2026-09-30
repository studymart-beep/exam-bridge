import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import SubjectCard from "@/components/student/SubjectCard";
import { listPublishedSubjects } from "@/lib/data/student/subjects";
import { getCurrentProfile } from "@/lib/data/student/profile";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const list = await listPublishedSubjects();
  const profile = await getCurrentProfile();

  return (
    <div>
      <StudentHeader title="Subjects" userName={profile?.full_name || "Student"} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">
        {list.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-sm text-text-muted">No subjects yet. Check back soon.</p>
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
                  color: s.color || "#1D4ED8",
                  bgColor: s.bg_color || "#EFF6FF",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

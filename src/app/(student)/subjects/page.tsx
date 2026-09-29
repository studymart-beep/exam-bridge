import StudentHeader from "@/components/student/StudentHeader";
import SubjectCard from "@/components/student/SubjectCard";
import { getSubjects } from "@/lib/data/subjects";

export default async function SubjectsPage() {
  const list = await getSubjects();

  return (
    <div>
      <StudentHeader title="Subjects" />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        <div>
          <h2 className="text-xl font-heading font-bold text-text-primary">Subjects</h2>
          <p className="text-sm text-text-secondary">Select a subject to start learning</p>
        </div>
        {list.length === 0 ? (
          <p className="text-center text-text-muted text-sm py-12">
            No subjects yet. An admin can add them in the control panel.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {list.map((s) => (
              <SubjectCard
                key={s.id}
                subject={{
                  id: s.id,
                  name: s.name,
                  slug: s.slug,
                  letter: s.letter || s.name.charAt(0),
                  color: s.color || "#1D4ED8",
                  bgColor: s.bg_color || "#DBEAFE",
                  topicCount: 0,
                  description: s.description || "",
                  generalCbtId: s.general_cbt_id,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

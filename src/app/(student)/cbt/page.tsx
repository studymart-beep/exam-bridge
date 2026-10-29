import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import ExamCard from "@/components/student/ExamCard";
import ScopeToggle from "@/components/shared/ScopeToggle";
import { listExamsForStudent } from "@/lib/data/student/cbt";
import { getMySubjectIds } from "@/lib/data/student/mySubjects";
import { getCurrentProfile } from "@/lib/data/student/profile";

export const dynamic = "force-dynamic";

export default async function CbtListPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const { scope: rawScope } = await searchParams;
  const scope = rawScope === "all" ? "all" : "mine";
  const exams = await listExamsForStudent();
  const profile = await getCurrentProfile();
  const mineIds = await getMySubjectIds(profile?.id);
  const mineSet = new Set(mineIds);

  const inMine = (subjectId: string | null) =>
    subjectId === null || subjectId === undefined
      ? true // general / topic-less exams always apply
      : mineSet.has(subjectId);

  const mineCount = exams.filter((e) => inMine(e.subject_id)).length;

  const showingMine = scope === "mine" && mineIds.length > 0;
  const visible = showingMine ? exams.filter((e) => inMine(e.subject_id)) : exams;

  return (
    <div>
      <StudentHeader
        title="CBT Practice"
        userName={profile?.full_name || "Student"}
      />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">
        <ScopeToggle
          scope={showingMine ? "mine" : "all"}
          basePath="/cbt"
          counts={{ mine: mineCount, all: exams.length }}
        />

        <Section
          title={showingMine ? "My practice exams" : "All practice exams"}
          subtitle={
            showingMine
              ? "Exams for the subjects you selected."
              : "Every exam published on the platform."
          }
          tint="gold"
          goldBar
        >
          {visible.length === 0 ? (
            <Card className="text-center py-10" tint="gold">
              <p className="text-sm text-text-muted">
                {mineIds.length === 0
                  ? "No exams yet — and no subjects selected yet. Choose subjects in Profile to personalise this list."
                  : "No practice exams for your subjects yet. Try All Subjects."}
              </p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {visible.map((e, idx) => (
                <ExamCard
                  key={e.id}
                  index={idx}
                  exam={{
                    id: e.id,
                    title: e.title,
                    question_count: e.question_count,
                    duration_mins: e.duration_mins,
                    pass_mark: e.pass_mark,
                  }}
                />
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

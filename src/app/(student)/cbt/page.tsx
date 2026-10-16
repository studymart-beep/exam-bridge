import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import ExamCard from "@/components/student/ExamCard";
import { listExamsForStudent } from "@/lib/data/student/cbt";
import { getCurrentProfile } from "@/lib/data/student/profile";

export const dynamic = "force-dynamic";

export default async function CbtListPage() {
  const exams = await listExamsForStudent();
  const profile = await getCurrentProfile();

  return (
    <div>
      <StudentHeader
        title="CBT Practice"
        userName={profile?.full_name || "Student"}
      />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto">
        <Section title="Practice exams" tint="gold">
          {exams.length === 0 ? (
            <Card className="text-center py-10" tint="gold">
              <p className="text-sm text-text-muted">
                No practice exams available yet.
              </p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {exams.map((e, idx) => (
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

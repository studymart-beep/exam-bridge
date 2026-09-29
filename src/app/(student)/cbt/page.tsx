import StudentHeader from "@/components/student/StudentHeader";
import CBTCard from "@/components/student/CBTCard";
import { cbtExams } from "@/lib/mock/cbt";

export default function CBTListPage() {
  return (
    <div>
      <StudentHeader title="CBT Practice" />

      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        <div>
          <h2 className="text-xl font-heading font-bold text-text-primary">
            CBT Practice
          </h2>
          <p className="text-sm text-text-secondary">
            Practice real exam questions in CBT mode
          </p>
        </div>

        <div className="space-y-3">
          {cbtExams.map((exam) => (
            <CBTCard key={exam.id} exam={exam} />
          ))}
        </div>
      </div>
    </div>
  );
}

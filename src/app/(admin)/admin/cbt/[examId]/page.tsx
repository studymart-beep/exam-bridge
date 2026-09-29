"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../../layout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import StatCard from "@/components/admin/StatCard";
import { getAdminCbtById } from "@/lib/mock/adminCbtExams";
import { getQuestionsByExamId } from "@/lib/mock/adminCbtQuestions";
import { formatDate } from "@/lib/utils";

export default function AdminCbtDetailPage() {
  const { examId } = useParams<{ examId: string }>();
  const openMenu = useAdminMenu();
  const exam = getAdminCbtById(examId);
  const questions = getQuestionsByExamId(examId);

  if (!exam) {
    return (
      <div>
        <AdminHeader title="Not found" onMenuClick={openMenu} />
        <p className="p-6 text-center text-text-muted">Exam not found. <Link href="/admin/cbt" className="text-primary">Back</Link></p>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title={exam.title} subtitle={exam.subjectName} onMenuClick={openMenu} />
      <div className="px-4 sm:px-6 py-5 max-w-4xl mx-auto space-y-5">
        <Link href="/admin/cbt" className="text-sm text-primary hover:underline">← Back to exams</Link>

        <Card>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant={exam.status === "published" ? "success" : "warning"}>{exam.status}</Badge>
            <span className="text-xs text-text-muted">Created {formatDate(exam.createdAt)}</span>
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><dt className="text-text-muted text-xs">Subject</dt><dd className="font-medium">{exam.subjectName}</dd></div>
            <div><dt className="text-text-muted text-xs">Course</dt><dd className="font-medium">{exam.courseName}</dd></div>
            <div><dt className="text-text-muted text-xs">Duration</dt><dd className="font-medium">{exam.durationMinutes} min</dd></div>
            <div><dt className="text-text-muted text-xs">Pass mark</dt><dd className="font-medium">{exam.passMark}%</dd></div>
          </dl>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Questions" value={questions.length || exam.questionCount} icon={<span className="text-primary text-lg">?</span>} />
          <StatCard label="Attempts" value={exam.attemptsCount} iconBg="bg-amber-50" icon={<span className="text-warning text-lg">📝</span>} />
          <StatCard label="Avg score" value={`${exam.avgScore}%`} iconBg="bg-blue-50" icon={<span className="text-primary text-lg">%</span>} />
          <StatCard label="Pass rate" value={`${exam.passRate}%`} iconBg="bg-green-50" icon={<span className="text-success text-lg">✓</span>} />
        </div>

        <Link href={`/admin/cbt/${examId}/questions`}>
          <Button fullWidth size="lg">
            Manage questions ({questions.length})
          </Button>
        </Link>
      </div>
    </div>
  );
}

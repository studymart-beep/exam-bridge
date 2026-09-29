"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../../layout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import StatCard from "@/components/admin/StatCard";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { getAdminCbtById } from "@/lib/mock/adminCbtExams";
import { getQuestionsByExamId } from "@/lib/mock/adminCbtQuestions";
import { adminSubjects } from "@/lib/mock/adminSubjects";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import type { AdminCbtExam } from "@/types";

export default function AdminCbtDetailPage() {
  const { examId } = useParams<{ examId: string }>();
  const openMenu = useAdminMenu();
  const router = useRouter();
  const { showToast } = useToast();
  const base = getAdminCbtById(examId);
  const questions = getQuestionsByExamId(examId);
  const [exam, setExam] = useState<AdminCbtExam | undefined>(base);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(base?.title || "");
  const [subjectId, setSubjectId] = useState(base?.subjectId || "");
  const [duration, setDuration] = useState(String(base?.durationMinutes || 30));
  const [passMark, setPassMark] = useState(String(base?.passMark || 50));
  const [status, setStatus] = useState(base?.status || "draft");

  if (!exam) {
    return (
      <div>
        <AdminHeader title="Not found" onMenuClick={openMenu} />
        <p className="p-6 text-center text-text-muted">
          Exam not found. <Link href="/admin/cbt" className="text-primary">Back</Link>
        </p>
      </div>
    );
  }

  const handleSaveMeta = () => {
    // TODO: replace with API call
    const subj = adminSubjects.find((s) => s.id === subjectId);
    setExam({
      ...exam,
      title: title.trim() || exam.title,
      subjectId,
      subjectName: subj?.name || exam.subjectName,
      durationMinutes: parseInt(duration, 10) || exam.durationMinutes,
      passMark: parseInt(passMark, 10) || exam.passMark,
      status: status as AdminCbtExam["status"],
    });
    setEditOpen(false);
    showToast("Exam updated", "success");
  };

  return (
    <div>
      <AdminHeader
        title={exam.title}
        subtitle={exam.subjectName}
        onMenuClick={openMenu}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              Edit exam
            </Button>
            <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        }
      />
      <div className="px-4 sm:px-6 py-5 max-w-4xl mx-auto space-y-5">
        <Link href="/admin/cbt" className="text-sm text-primary hover:underline">
          ← Back to exams
        </Link>

        <Card>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant={exam.status === "published" ? "success" : "warning"}>
              {exam.status}
            </Badge>
            <span className="text-xs text-text-muted">Created {formatDate(exam.createdAt)}</span>
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-text-muted text-xs">Subject</dt>
              <dd className="font-medium">{exam.subjectName}</dd>
            </div>
            <div>
              <dt className="text-text-muted text-xs">Duration</dt>
              <dd className="font-medium">{exam.durationMinutes} min</dd>
            </div>
            <div>
              <dt className="text-text-muted text-xs">Pass mark</dt>
              <dd className="font-medium">{exam.passMark}%</dd>
            </div>
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

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit exam">
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select
            label="Subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            options={adminSubjects.map((s) => ({ value: s.id, label: s.name }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Duration (min)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
            <Input label="Pass mark (%)" type="number" value={passMark} onChange={(e) => setPassMark(e.target.value)} />
          </div>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as AdminCbtExam["status"])}
            options={[
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
              { value: "archived", label: "Archived" },
            ]}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMeta}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          // TODO: replace with API call
          showToast("Exam deleted (mock)", "success");
          router.push("/admin/cbt");
        }}
        title="Delete exam?"
        message="This will permanently delete the exam and its questions."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

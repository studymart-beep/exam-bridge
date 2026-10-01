"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { updateExam, deleteExam } from "@/lib/actions/admin/cbt";
import type { AdminExamRow } from "@/lib/data/admin/cbt";
import type { AdminSubjectRow } from "@/lib/data/admin/subjects";

export default function ExamEditForm({
  exam,
  subjects,
}: {
  exam: AdminExamRow;
  subjects: AdminSubjectRow[];
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(exam.title);
  const [duration, setDuration] = useState(String(exam.duration_mins));
  const [passMark, setPassMark] = useState(String(exam.pass_mark));
  const [isActive, setIsActive] = useState(exam.is_active);
  const [isGeneral, setIsGeneral] = useState(exam.is_general);
  const [subjectId, setSubjectId] = useState(exam.subject_id || "");

  function save() {
    const fd = new FormData();
    fd.set("id", exam.id);
    fd.set("title", title);
    fd.set("duration_mins", duration);
    fd.set("pass_mark", passMark);
    fd.set("is_active", isActive ? "true" : "false");
    fd.set("is_general", isGeneral ? "true" : "false");
    if (subjectId) fd.set("subject_id", subjectId);
    if (exam.topic_id) fd.set("topic_id", exam.topic_id);
    startTransition(async () => {
      const res = await updateExam(fd);
      if (!res.success) showToast(res.error || "Failed", "error");
      else {
        showToast("Saved", "success");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Duration (min)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
        <Input label="Pass mark (%)" type="number" value={passMark} onChange={(e) => setPassMark(e.target.value)} />
      </div>
      <label className="block text-sm font-medium">Subject</label>
      <select
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value)}
        className="w-full h-11 px-3 rounded-xl border border-border text-sm"
      >
        <option value="">— None —</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Active
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isGeneral} onChange={(e) => setIsGeneral(e.target.checked)} />
        General (subject final exam)
      </label>
      <div className="flex gap-3">
        <Button loading={pending} onClick={save}>
          Save
        </Button>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          Delete exam
        </Button>
      </div>
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() =>
          startTransition(async () => {
            const res = await deleteExam(exam.id);
            if (!res.success) showToast(res.error || "Failed", "error");
            else {
              showToast("Deleted", "success");
              router.push("/admin/cbt");
            }
          })
        }
        title="Delete exam?"
        message="Questions will be removed too."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

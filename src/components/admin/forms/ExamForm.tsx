"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import type { AdminCbtExam } from "@/types";
import { adminSubjects } from "@/lib/mock/adminSubjects";

interface ExamFormProps {
  initial?: Partial<AdminCbtExam>;
  onSubmit: (data: {
    title: string;
    subjectId: string;
    durationMinutes: number;
    passMark: number;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ExamForm({ initial, onSubmit, onCancel, loading }: ExamFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [subjectId, setSubjectId] = useState(initial?.subjectId || "");
  const [duration, setDuration] = useState(String(initial?.durationMinutes || 30));
  const [passMark, setPassMark] = useState(String(initial?.passMark || 50));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!title.trim()) err.title = "Title is required";
    if (!subjectId) err.subjectId = "Subject is required";
    const d = parseInt(duration, 10);
    const p = parseInt(passMark, 10);
    if (!d || d < 1) err.duration = "Valid duration required";
    if (isNaN(p) || p < 0 || p > 100) err.passMark = "Pass mark 0–100";
    setErrors(err);
    if (Object.keys(err).length) return;
    // TODO: replace with API call
    onSubmit({ title: title.trim(), subjectId, durationMinutes: d, passMark: p });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Exam Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} placeholder="e.g. Cell Structure CBT" />
      <Select
        label="Subject"
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value)}
        error={errors.subjectId}
        placeholder="Select subject"
        options={adminSubjects.map((s) => ({ value: s.id, label: s.name }))}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Duration (minutes)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} error={errors.duration} />
        <Input label="Pass Mark (%)" type="number" value={passMark} onChange={(e) => setPassMark(e.target.value)} error={errors.passMark} />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial?.id ? "Save Changes" : "Create Exam"}</Button>
      </div>
    </form>
  );
}

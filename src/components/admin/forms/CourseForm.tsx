"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import type { AdminCourse } from "@/types";
import { adminSubjects } from "@/lib/mock/adminSubjects";

interface CourseFormProps {
  initial?: Partial<AdminCourse>;
  onSubmit: (data: { title: string; subjectId: string; description: string; level: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function CourseForm({ initial, onSubmit, onCancel, loading }: CourseFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [subjectId, setSubjectId] = useState(initial?.subjectId || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [level, setLevel] = useState(initial?.level || "SSS 1–3");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!title.trim()) err.title = "Title is required";
    if (!subjectId) err.subjectId = "Subject is required";
    setErrors(err);
    if (Object.keys(err).length) return;
    // TODO: replace with API call
    onSubmit({ title: title.trim(), subjectId, description: description.trim(), level });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Course Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} placeholder="e.g. Algebra & Equations" />
      <Select
        label="Subject"
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value)}
        error={errors.subjectId}
        placeholder="Select subject"
        options={adminSubjects.map((s) => ({ value: s.id, label: s.name }))}
      />
      <Input label="Level" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="SSS 1–3" />
      <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Course description..." />
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial?.id ? "Save Changes" : "Add Course"}</Button>
      </div>
    </form>
  );
}

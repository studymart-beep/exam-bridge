"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import type { AdminTopic } from "@/types";

interface TopicFormProps {
  initial?: Partial<AdminTopic>;
  onSubmit: (data: { title: string; description: string; duration: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function TopicForm({ initial, onSubmit, onCancel, loading }: TopicFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [duration, setDuration] = useState(initial?.duration || "30 min");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!title.trim()) err.title = "Title is required";
    setErrors(err);
    if (Object.keys(err).length) return;
    // TODO: replace with API call
    onSubmit({ title: title.trim(), description: description.trim(), duration: duration.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Topic Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} placeholder="e.g. Linear Equations" />
      <Input label="Duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="30 min" />
      <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Topic description..." />
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial?.id ? "Save Changes" : "Add Topic"}</Button>
      </div>
    </form>
  );
}

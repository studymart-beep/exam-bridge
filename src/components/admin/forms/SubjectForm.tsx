"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import type { AdminSubject } from "@/types";

interface SubjectFormProps {
  initial?: Partial<AdminSubject>;
  onSubmit: (data: { name: string; slug: string; description: string; letter: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function SubjectForm({ initial, onSubmit, onCancel, loading }: SubjectFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [letter, setLetter] = useState(initial?.letter || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (v: string) => {
    setName(v);
    if (!initial?.slug) {
      setSlug(v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
    if (!initial?.letter && v) setLetter(v.charAt(0).toUpperCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = "Name is required";
    if (!slug.trim()) err.slug = "Slug is required";
    if (!letter.trim()) err.letter = "Letter is required";
    setErrors(err);
    if (Object.keys(err).length) return;
    // TODO: replace with API call
    onSubmit({ name: name.trim(), slug: slug.trim(), description: description.trim(), letter: letter.trim().charAt(0).toUpperCase() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Subject Name" value={name} onChange={(e) => handleNameChange(e.target.value)} error={errors.name} placeholder="e.g. Mathematics" />
      <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} error={errors.slug} placeholder="mathematics" helperText="URL-friendly identifier" />
      <Input label="Letter" value={letter} onChange={(e) => setLetter(e.target.value.slice(0, 1))} error={errors.letter} placeholder="M" maxLength={1} />
      <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description..." />
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial?.id ? "Save Changes" : "Add Subject"}</Button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import VideoIdField from "@/components/admin/VideoIdField";
import UploadPlaceholder from "@/components/admin/UploadPlaceholder";
import type { Material, MaterialType } from "@/types";

interface MaterialFormProps {
  initial?: Partial<Material>;
  onSubmit: (data: {
    type: MaterialType;
    title: string;
    source: string;
    orderIndex: number;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function MaterialForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: MaterialFormProps) {
  const [type, setType] = useState<MaterialType>(initial?.type || "video");
  const [title, setTitle] = useState(initial?.title || "");
  const [source, setSource] = useState(initial?.source || "");
  const [orderIndex, setOrderIndex] = useState(String(initial?.orderIndex ?? 1));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!title.trim()) err.title = "Title is required";
    if (!source.trim()) {
      err.source = type === "video" ? "Video ID is required" : "File name is required";
    }
    const order = parseInt(orderIndex, 10);
    if (isNaN(order) || order < 1) err.orderIndex = "Order must be 1 or higher";
    setErrors(err);
    if (Object.keys(err).length) return;
    // TODO: replace with API call
    onSubmit({
      type,
      title: title.trim(),
      source: source.trim(),
      orderIndex: order,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Type"
        value={type}
        onChange={(e) => {
          setType(e.target.value as MaterialType);
          setSource("");
        }}
        options={[
          { value: "video", label: "Video" },
          { value: "pdf", label: "PDF" },
          { value: "image", label: "Image" },
        ]}
      />
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="e.g. Linear Equations Intro"
      />
      {type === "video" ? (
        <VideoIdField value={source} onChange={setSource} error={errors.source} />
      ) : (
        <div className="space-y-2">
          <Input
            label={type === "pdf" ? "PDF file name" : "Image file name"}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            error={errors.source}
            placeholder={type === "pdf" ? "notes.pdf" : "diagram.png"}
          />
          <UploadPlaceholder />
        </div>
      )}
      <Input
        label="Order"
        type="number"
        value={orderIndex}
        onChange={(e) => setOrderIndex(e.target.value)}
        error={errors.orderIndex}
        min={1}
      />
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initial?.id ? "Save changes" : "Add material"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import Input from "@/components/ui/Input";

interface VideoIdFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function VideoIdField({ value, onChange, error }: VideoIdFieldProps) {
  return (
    <Input
      label="Video ID"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      placeholder="e.g. cf_vid_abc123def456"
      helperText="Paste the Cloudflare Stream video ID"
    />
  );
}

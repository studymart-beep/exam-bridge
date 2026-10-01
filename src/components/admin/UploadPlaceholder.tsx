"use client";

interface UploadPlaceholderProps {
  label?: string;
}

export default function UploadPlaceholder({
  label = "Upload file (coming soon)",
}: UploadPlaceholderProps) {
  return (
    <button
      type="button"
      disabled
      title="Upload available once backend is connected"
      className="w-full h-11 px-4 rounded-xl border border-dashed border-gray-300 bg-primary-light/40 text-sm text-text-muted cursor-not-allowed opacity-70"
    >
      {label}
    </button>
  );
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Subject thumbnail uploader. Reads the chosen image as a base64 data URL and
 * passes it up; the server action stores the bytes in Supabase Storage and
 * writes the resulting path to subjects.thumbnail_url.
 * Shows the existing thumbnail in edit mode.
 */
export default function SubjectThumbnailUpload({
  previewUrl,
  value,
  onChange,
}: {
  /** existing stored thumbnail (plain/signed URL) for edit mode */
  previewUrl?: string | null;
  value: string | null;
  onChange: (base64: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function readFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file (JPG, PNG or WebP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Thumbnail must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setError(null);
      onChange(typeof reader.result === "string" ? reader.result : null);
    };
    reader.onerror = () => setError("Could not read the image.");
    reader.readAsDataURL(file);
  }

  const showPreview = value || previewUrl;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => readFile(e.target.files?.[0])}
      />
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed grid place-items-center text-xs font-semibold transition-colors",
            showPreview
              ? "border-border bg-primary-light/40"
              : "border-border hover:border-primary/50 bg-surface text-text-muted"
          )}
        >
          {showPreview ? (
            <div className="relative w-full h-full">
              <Image
                src={(value || previewUrl) as string}
                alt="Subject thumbnail"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            "Add thumbnail"
          )}
        </button>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {value || previewUrl ? "Change image" : "Upload image"}
          </button>
          {(value || previewUrl) && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="block text-xs text-error hover:underline"
            >
              Remove
            </button>
          )}
          {error && <p className="text-xs text-error">{error}</p>}
        </div>
      </div>
      <p className="text-xs text-text-muted">
        Optional subject cover shown on the Subjects page and dashboard cards.
      </p>
    </div>
  );
}

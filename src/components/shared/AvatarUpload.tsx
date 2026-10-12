"use client";

import { useRef, useState, useTransition } from "react";
import { getAvatarUploadUrl, finalizeAvatar } from "@/lib/actions/avatar";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AvatarUpload({
  name,
  avatarUrl,
  size = 80,
}: {
  name: string;
  avatarUrl: string | null;
  size?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(avatarUrl);

  function onPick() {
    inputRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("Max 2 MB", "error");
      return;
    }
    startTransition(async () => {
      const meta = await getAvatarUploadUrl(file.type);
      if ("error" in meta) {
        showToast(meta.error ?? "Upload failed", "error");
        return;
      }
      const put = await fetch(meta.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) {
        showToast("Upload failed", "error");
        return;
      }
      const fin = await finalizeAvatar(meta.path);
      if (!fin.success) {
        showToast(fin.error ?? "Could not save photo", "error");
        return;
      }
      setPreview(fin.avatarUrl || URL.createObjectURL(file));
      showToast("Photo updated", "success");
    });
  }

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <button
        type="button"
        onClick={onPick}
        disabled={pending}
        className={cn(
          "w-full h-full rounded-full overflow-hidden border-2 border-secondary bg-primary/20 flex items-center justify-center",
          pending && "opacity-60"
        )}
        aria-label="Upload picture"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="font-heading font-bold text-white text-xl">
            {initials(name)}
          </span>
        )}
      </button>
      <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-secondary text-primary-dark text-xs font-bold flex items-center justify-center shadow">
        ✎
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFile}
      />
    </div>
  );
}

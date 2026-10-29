"use client";

import { useEffect, useState } from "react";
import { getCoverSignedUrl } from "@/lib/actions/student/materials";
import { cn } from "@/lib/utils";

type Props = {
  coverPath?: string | null;
  kind: "video" | "pdf" | "image" | string;
  className?: string;
  alt?: string;
};

export default function CoverThumb({
  coverPath,
  kind,
  className,
  alt = "",
}: Props) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!coverPath) {
      setUrl(null);
      return;
    }
    void (async () => {
      const res = await getCoverSignedUrl(coverPath);
      if (!cancelled && "url" in res) setUrl(res.url);
    })();
    return () => {
      cancelled = true;
    };
  }, [coverPath]);

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        className={cn("w-full h-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-accent-light",
        className
      )}
      aria-hidden
    >
      {kind === "video" ? (
        <>
          {/* "somebody learning" — a quiet illustration in front of the video card */}
          <svg className="w-9 h-9 text-white/85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="7.5" r="3" />
            <path d="M2.8 20a6.5 6.5 0 0112.4 0" />
            <rect x="14" y="9" width="9" height="6" rx="1.5" transform="rotate(0)" />
            <path d="M18 11.2v1.6l1.5.9-1.5.9" />
          </svg>
        </>
      ) : (
        <span className="text-white/90 font-heading font-bold text-sm tracking-wide">
          {kind === "pdf" ? "PDF" : "IMG"}
        </span>
      )}
    </div>
  );
}

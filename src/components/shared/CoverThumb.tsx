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
        <span className="w-12 h-12 rounded-full bg-white/25 text-white flex items-center justify-center text-xl border border-white/30 pl-0.5">
          ▶
        </span>
      ) : (
        <span className="text-white/90 font-heading font-bold text-sm tracking-wide">
          {kind === "pdf" ? "PDF" : "IMG"}
        </span>
      )}
    </div>
  );
}

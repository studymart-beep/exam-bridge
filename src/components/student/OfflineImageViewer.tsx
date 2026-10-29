"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  url: string;
  title: string;
  onClose: () => void;
  /** shown when the blob came from the offline cache */
  offline?: boolean;
};

/**
 * In-app fullscreen image viewer (no external browser tab). Used for cached
 * images on the Downloads page.
 */
export default function OfflineImageViewer({
  url,
  title,
  onClose,
  offline = false,
}: Props) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.history.pushState({ ebImg: true }, "");
    const onPop = () => onClose();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-[99999] bg-[#0A0A0A] flex flex-col"
      style={{
        width: "100vw",
        height: "100dvh",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-white shrink-0">
        <p className="text-sm font-medium truncate pr-2">{title}</p>
        <div className="flex items-center gap-2">
          {offline && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/25 text-emerald-200">
              OFFLINE
            </span>
          )}
          <button
            type="button"
            className="min-w-[40px] min-h-[40px] rounded-full bg-white/15 text-lg"
            onClick={() => setScale((s) => (s > 1 ? 1 : 2))}
            aria-label="Zoom"
          >
            {scale > 1 ? "−" : "+"}
          </button>
          <button
            type="button"
            className="min-w-[40px] min-h-[40px] rounded-full bg-white/15 text-lg"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
      <div
        className="flex-1 flex items-center justify-center overflow-auto p-2"
        onDoubleClick={() => setScale((s) => (s > 1 ? 1 : 2))}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={title}
          className={cn("max-w-full max-h-full object-contain touch-pinch-zoom")}
          style={{ transform: `scale(${scale})` }}
        />
      </div>
    </div>
  );
}

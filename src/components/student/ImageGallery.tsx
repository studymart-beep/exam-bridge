"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ImageItem = {
  id: string;
  title: string;
  source: string | null;
};

export default function ImageGallery({ images }: { images: ImageItem[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [scale, setScale] = useState(1);

  const active = index !== null ? images[index] : null;

  function open(i: number) {
    setIndex(i);
    setScale(1);
    document.body.style.overflow = "hidden";
    window.history.pushState({ ebImgFs: true }, "");
  }

  function close() {
    setIndex(null);
    setScale(1);
    document.body.style.overflow = "";
  }

  useEffect(() => {
    if (index === null) return;
    const onPop = () => close();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft" && index > 0) setIndex(index - 1);
      if (e.key === "ArrowRight" && index < images.length - 1) setIndex(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => open(i)}
            className="aspect-square rounded-xl overflow-hidden bg-primary-light border border-border"
          >
            {img.source &&
            (img.source.startsWith("http") || img.source.startsWith("/")) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img.source}
                alt={img.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-2">
                <p className="text-xs text-text-muted text-center">{img.title}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {active && active.source && (
        <div
          className="fixed inset-0 z-[200] bg-[#0A0A0A] flex items-center justify-center"
          style={{ width: "100vw", height: "100dvh" }}
          onClick={close}
        >
          <button
            type="button"
            className="absolute top-3 right-3 z-30 min-w-[44px] min-h-[44px] rounded-full bg-black/60 text-white text-lg"
            onClick={close}
            aria-label="Close"
          >
            ✕
          </button>

          {images.length > 1 && index !== null && index > 0 && (
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 min-w-[44px] min-h-[44px] rounded-full bg-black/40 text-white text-xl"
              onClick={(e) => {
                e.stopPropagation();
                setIndex(index - 1);
                setScale(1);
              }}
            >
              ‹
            </button>
          )}
          {images.length > 1 && index !== null && index < images.length - 1 && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 min-w-[44px] min-h-[44px] rounded-full bg-black/40 text-white text-xl"
              onClick={(e) => {
                e.stopPropagation();
                setIndex(index + 1);
                setScale(1);
              }}
            >
              ›
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.source}
            alt={active.title}
            className={cn(
              "max-w-full max-h-full object-contain transition-transform duration-200 touch-pinch-zoom"
            )}
            style={{ transform: `scale(${scale})` }}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setScale((s) => (s > 1 ? 1 : 2));
            }}
          />
        </div>
      )}
    </>
  );
}

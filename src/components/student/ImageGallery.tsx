"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ImageItem {
  id: string;
  title: string;
  source: string | null;
}

export default function ImageGallery({ images }: { images: ImageItem[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const active = images.find((i) => i.id === lightbox);

  if (!images.length) {
    return <p className="text-sm text-text-muted p-4">No images.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {images.map((img) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setLightbox(img.id)}
            className="aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
          className={cn(
            "fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          )}
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.source}
            alt={active.title}
            className="max-w-full max-h-[90vh] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

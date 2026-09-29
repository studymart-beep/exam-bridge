"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const placeholderImages = [
  { id: 1, label: "Cell diagram", color: "#D1FAE5" },
  { id: 2, label: "Organelle chart", color: "#DBEAFE" },
  { id: 3, label: "Mitosis stages", color: "#FEF3C7" },
  { id: 4, label: "Plant cell", color: "#FCE7F3" },
];

export default function ImageGallery() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {placeholderImages.map((img) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setLightbox(img.id)}
            className="aspect-square rounded-2xl overflow-hidden border border-gray-100 hover:shadow-card transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{ backgroundColor: img.color }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto text-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-xs text-text-muted font-medium">{img.label}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-lg w-full aspect-square rounded-2xl overflow-hidden"
            style={{
              backgroundColor:
                placeholderImages.find((i) => i.id === lightbox)?.color,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-text-secondary font-medium">
                {placeholderImages.find((i) => i.id === lightbox)?.label}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

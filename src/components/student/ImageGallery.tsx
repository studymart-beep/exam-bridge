"use client";

import { useEffect, useState } from "react";
import { getMaterialSignedUrl } from "@/lib/actions/student/materials";
import {
  getFile,
  putFile,
  setActiveCacheKey,
  cacheKeyFor,
  type CacheMeta,
} from "@/lib/offline/cache";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

type ImageItem = {
  id: string;
  title: string;
  source: string | null;
};

type Props = {
  images: ImageItem[];
  subjectTitle?: string;
  topicTitle?: string;
  subscriptionExpiresAt?: string | null;
};

/**
 * In-app image gallery.
 * v31: images are cached into IndexedDB and rendered from the cached blob, so
 * they open inside the app offline instead of pointing at a remote URL.
 */
export default function ImageGallery({
  images,
  subjectTitle,
  topicTitle,
}: Props) {
  const { showToast } = useToast();
  const [index, setIndex] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  /** materialId -> usable src (blob: or http) */
  const [srcs, setSrcs] = useState<Record<string, string>>({});
  const [cached, setCached] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const active = index !== null ? images[index] : null;
  const activeKey = active ? cacheKeyFor("image", active.id) : null;

  useEffect(() => {
    void (async () => {
      const next: Record<string, string> = {};
      const done: Record<string, boolean> = {};
      for (const img of images) {
        const hit = await getFile(cacheKeyFor("image", img.id));
        if (hit) {
          next[img.id] = URL.createObjectURL(hit.blob);
          done[img.id] = true;
        }
      }
      setSrcs((prev) => ({ ...prev, ...next }));
      setCached((prev) => ({ ...prev, ...done }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.map((i) => i.id).join(",")]);

  useEffect(() => {
    if (index === null) return;
    const onPop = () => close();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, images.length]);

  useEffect(() => {
    setActiveCacheKey(activeKey);
    return () => setActiveCacheKey(null);
  }, [activeKey]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
      Object.values(srcs).forEach((u) => {
        if (u.startsWith("blob:")) URL.revokeObjectURL(u);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  /** Save into IndexedDB so the image is readable offline. */
  async function save(img: ImageItem) {
    const key = cacheKeyFor("image", img.id);
    if (cached[img.id] || busy === img.id) return;
    setBusy(img.id);
    try {
      const res = await getMaterialSignedUrl(img.id);
      if ("error" in res) {
        showToast(res.error, "error");
        return;
      }
      const r = await fetch(res.url);
      if (!r.ok) throw new Error("fetch failed");
      const blob = await r.blob();
      const meta: CacheMeta = {
        materialId: img.id,
        type: "image",
        title: img.title,
        size: blob.size,
        downloadedAt: Date.now(),
        subscriptionExpiresAt: res.subscriptionExpiresAt
          ? new Date(res.subscriptionExpiresAt).getTime()
          : null,
        subjectTitle,
        topicTitle,
      };
      await putFile(key, blob, meta);
      const url = URL.createObjectURL(blob);
      setSrcs((prev) => ({ ...prev, [img.id]: url }));
      setCached((prev) => ({ ...prev, [img.id]: true }));
      showToast("Image saved offline", "success");
    } catch {
      showToast("Could not save image", "error");
    } finally {
      setBusy(null);
    }
  }

  /** src for display: cached blob first, then signed/plain URL, then title */
  function srcOf(img: ImageItem): string | null {
    if (srcs[img.id]) return srcs[img.id];
    if (img.source && (img.source.startsWith("http") || img.source.startsWith("/")))
      return img.source;
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {images.map((img, i) => {
          const src = srcOf(img);
          return (
            <div
              key={img.id}
              className="relative aspect-square rounded-2xl overflow-hidden bg-primary-light border border-border shadow-soft"
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={img.title}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => open(i)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => open(i)}
                  className="w-full h-full flex items-center justify-center p-2"
                >
                  <p className="text-xs text-text-muted text-center">{img.title}</p>
                </button>
              )}

              <button
                type="button"
                onClick={() => void save(img)}
                disabled={Boolean(cached[img.id]) || busy === img.id}
                aria-label={cached[img.id] ? "Saved offline" : "Save image offline"}
                title={cached[img.id] ? "Saved offline" : "Save for offline"}
                className={cn(
                  "absolute top-1.5 right-1.5 w-8 h-8 rounded-full grid place-items-center text-xs",
                  cached[img.id]
                    ? "bg-primary text-white"
                    : "bg-black/55 text-white hover:bg-black/70"
                )}
              >
                {cached[img.id] ? "✓" : busy === img.id ? "…" : "↓"}
              </button>
            </div>
          );
        })}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[200] bg-[#0A0A0A] flex items-center justify-center"
          style={{ width: "100vw", height: "100dvh" }}
          onClick={close}
        >
          <p className="absolute top-3 left-3 z-30 text-white/85 text-sm truncate max-w-[60vw]">
            {active.title}
            {cached[active.id] && (
              <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200">
                OFFLINE
              </span>
            )}
          </p>
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

          {srcOf(active) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={srcOf(active)!}
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
          ) : (
            <p className="text-white/80 text-sm p-6 text-center">
              This image has no preview. Save it offline to view it here.
            </p>
          )}
        </div>
      )}
    </>
  );
}

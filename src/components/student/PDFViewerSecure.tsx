"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import Button from "@/components/ui/Button";
import { getMaterialSignedUrl } from "@/lib/actions/student/materials";
import {
  getFile,
  putFile,
  setActiveCacheKey,
  type CacheMeta,
} from "@/lib/offline/cache";
import { cn } from "@/lib/utils";

type MaterialProp = {
  id: string;
  title: string;
  source: string | null;
  source_type?: string | null;
};

export default function PDFViewerSecure({
  material,
}: {
  material: MaterialProp;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [visiblePage, setVisiblePage] = useState(1);
  const [cached, setCached] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [open, setOpen] = useState(false);
  const [controls, setControls] = useState(true);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const rendered = useRef<Set<number>>(new Set());
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTap = useRef(0);
  const cacheKey = `pdf:${material.id}`;

  const bumpControls = useCallback(() => {
    setControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControls(false), 3000);
  }, []);

  const renderPageInto = useCallback(
    async (pageNum: number, container: HTMLDivElement) => {
      const doc = pdfDocRef.current;
      if (!doc) return;
      let canvas = container.querySelector("canvas") as HTMLCanvasElement | null;
      if (!canvas) {
        canvas = document.createElement("canvas");
        container.appendChild(canvas);
      }
      const pdfPage = await doc.getPage(pageNum);
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const baseW = typeof window !== "undefined" ? window.innerWidth : 390;
      const viewport0 = pdfPage.getViewport({ scale: 1 });
      const fit = baseW / viewport0.width;
      const viewport = pdfPage.getViewport({ scale: fit * dpr });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      canvas.style.display = "block";
      canvas.style.background = "#FFFFFF";
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await pdfPage.render({ canvasContext: ctx, viewport }).promise;
      rendered.current.add(pageNum);
    },
    []
  );

  const openPdfData = useCallback(async (data: ArrayBuffer) => {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
    const doc = await pdfjs.getDocument({ data: new Uint8Array(data) }).promise;
    pdfDocRef.current = doc;
    setNumPages(doc.numPages);
    rendered.current.clear();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActiveCacheKey(cacheKey);
    try {
      const local = await getFile(cacheKey);
      if (local) {
        await openPdfData(await local.blob.arrayBuffer());
        setCached(true);
        setLoading(false);
        return;
      }
      const res = await getMaterialSignedUrl(material.id);
      if ("error" in res) {
        setError(res.error);
        setLoading(false);
        return;
      }
      const response = await fetch(res.url);
      await openPdfData(await response.arrayBuffer());
      setCached(false);
    } catch {
      setError("Failed to load PDF");
    } finally {
      setLoading(false);
    }
  }, [cacheKey, material.id, openPdfData]);

  async function openReader() {
    setOpen(true);
    document.body.style.overflow = "hidden";
    window.history.pushState({ ebPdfFs: true }, "");
    bumpControls();
    if (!pdfDocRef.current) await load();
  }

  function closeReader() {
    setOpen(false);
    document.body.style.overflow = "";
  }

  async function toggleOrientation() {
    try {
      const orient = screen.orientation as ScreenOrientation & {
        lock?: (o: string) => Promise<void>;
        type?: string;
      };
      const type = orient?.type || "";
      if (type.includes("landscape")) await orient.lock?.("portrait");
      else await orient.lock?.("landscape");
    } catch {
      /* not supported */
    }
  }

  useEffect(() => {
    if (!open) return;
    const onPop = () => closeReader();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeReader();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open || !numPages || !pdfDocRef.current) return;
    const root = scrollRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const n = Number((entry.target as HTMLElement).dataset.page);
          if (!n) continue;
          if (entry.isIntersecting && !rendered.current.has(n)) {
            void renderPageInto(n, entry.target as HTMLDivElement);
          }
        }
        let best = 1;
        let bestRatio = 0;
        for (const entry of entries) {
          const n = Number((entry.target as HTMLElement).dataset.page);
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            best = n;
          }
        }
        if (bestRatio > 0) setVisiblePage(best);
      },
      { root, rootMargin: "200px 0px", threshold: [0, 0.25, 0.5, 0.75] }
    );

    pageRefs.current.forEach((el) => io.observe(el));
    for (let i = 1; i <= Math.min(3, numPages); i++) {
      const el = pageRefs.current.get(i);
      if (el) void renderPageInto(i, el);
    }
    return () => io.disconnect();
  }, [open, numPages, renderPageInto]);

  useEffect(() => {
    return () => {
      setActiveCacheKey(null);
      document.body.style.overflow = "";
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  async function downloadOffline() {
    setDownloading(true);
    try {
      const res = await getMaterialSignedUrl(material.id);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      const response = await fetch(res.url);
      const blob = await response.blob();
      const meta: CacheMeta = {
        materialId: material.id,
        type: "pdf",
        title: material.title,
        size: blob.size,
        downloadedAt: Date.now(),
        subscriptionExpiresAt: res.subscriptionExpiresAt
          ? new Date(res.subscriptionExpiresAt).getTime()
          : null,
      };
      await putFile(cacheKey, blob, meta);
      setCached(true);
    } catch {
      setError("Download failed");
    } finally {
      setDownloading(false);
    }
  }

  function onSurfaceTap() {
    const now = Date.now();
    // single or double tap both just show controls
    lastTap.current = now;
    bumpControls();
  }

  return (
    <div className="space-y-3 select-none" onContextMenu={(e) => e.preventDefault()}>
      <button
        type="button"
        onClick={() => void openReader()}
        className="w-full text-left rounded-2xl overflow-hidden border border-border bg-surface shadow-sm active:scale-[0.99] transition"
      >
        <div className="relative w-full aspect-[4/3] bg-[#1A1A1A] flex flex-col items-center justify-center gap-2">
          <span className="text-3xl font-bold text-white/80 tracking-wide">PDF</span>
          <span className="text-xs text-white/50">Tap to open</span>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-sm font-semibold text-text-primary truncate">
            {material.title}
          </p>
          <p className="text-xs text-text-muted">Tap to open fullscreen reader</p>
        </div>
      </button>

      <Button
        size="sm"
        variant="outline"
        className="w-full min-h-[44px] md:w-auto"
        disabled={downloading || cached}
        loading={downloading}
        onClick={() => void downloadOffline()}
      >
        {cached ? "Downloaded" : "Download for offline"}
      </Button>

      {error && !open && (
        <p className="text-sm text-error text-center">{error}</p>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex flex-col"
          style={{ width: "100vw", height: "100dvh", background: "#0A0A0A" }}
        >
          {loading && (
            <p className="absolute inset-0 flex items-center justify-center text-white text-sm z-10">
              Loading PDF…
            </p>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3 p-4 z-10">
              <p className="text-sm">{error}</p>
              <button
                type="button"
                className="min-h-[44px] px-4 rounded-lg bg-white/20"
                onClick={closeReader}
              >
                Close
              </button>
            </div>
          )}

          {/* Close only top-right */}
          <button
            type="button"
            className={cn(
              "absolute top-3 right-3 z-30 min-w-[44px] min-h-[44px] rounded-full bg-black/60 text-white text-lg transition-opacity",
              controls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={closeReader}
            aria-label="Close"
          >
            ✕
          </button>

          {numPages > 0 && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
              <span className="text-[11px] font-medium text-white/90 bg-black/55 px-2 py-1.5 rounded-full tabular-nums">
                {visiblePage} / {numPages}
              </span>
            </div>
          )}

          {/* Bottom center: rotate only */}
          <div
            className={cn(
              "absolute bottom-0 inset-x-0 z-30 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-opacity",
              controls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <button
              type="button"
              className="min-w-[52px] min-h-[44px] rounded-full bg-black/70 text-white text-lg px-5 border border-white/15"
              onClick={() => void toggleOrientation()}
              aria-label="Rotate"
            >
              ↻
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden bg-[#0A0A0A]"
            onClick={onSurfaceTap}
          >
            {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
              <div
                key={n}
                data-page={n}
                ref={(el) => {
                  if (el) pageRefs.current.set(n, el);
                  else pageRefs.current.delete(n);
                }}
                className="w-full min-h-[30vh] flex justify-center bg-white"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
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
  const [rotateHint, setRotateHint] = useState(false);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const rendered = useRef<Set<number>>(new Set());
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheKey = `pdf:${material.id}`;
  const scrollRatioRef = useRef(0);

  const bumpControls = useCallback(() => {
    setControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControls(false), 3000);
  }, []);

  const renderPageInto = useCallback(
    async (pageNum: number, container: HTMLDivElement) => {
      const doc = pdfDocRef.current;
      if (!doc) return;

      const pdfPage: PDFPageProxy = await doc.getPage(pageNum);
      // Use page's natural rotation only — no extra transforms
      const baseViewport = pdfPage.getViewport({ scale: 1 });
      const cssWidth = container.clientWidth || window.innerWidth || 390;
      const cssScale = cssWidth / baseViewport.width;
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const scaledViewport = pdfPage.getViewport({ scale: cssScale * dpr });

      let canvas = container.querySelector("canvas") as HTMLCanvasElement | null;
      if (!canvas) {
        canvas = document.createElement("canvas");
        container.appendChild(canvas);
      }

      canvas.width = Math.floor(scaledViewport.width);
      canvas.height = Math.floor(scaledViewport.height);
      canvas.style.width = `${Math.floor(scaledViewport.width / dpr)}px`;
      canvas.style.height = `${Math.floor(scaledViewport.height / dpr)}px`;
      canvas.style.display = "block";
      canvas.style.margin = "0 auto";
      canvas.style.background = "#FFFFFF";
      // no filters / transforms

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await pdfPage.render({
        canvasContext: ctx,
        viewport: scaledViewport,
      }).promise;

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
    setRotateHint(true);
    setTimeout(() => setRotateHint(false), 2000);
    if (!pdfDocRef.current) await load();
  }

  function closeReader() {
    setOpen(false);
    document.body.style.overflow = "";
    setRotateHint(false);
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

  // Lazy render + visible page
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
      { root, rootMargin: "300px 0px", threshold: [0, 0.2, 0.5, 0.8] }
    );

    pageRefs.current.forEach((el) => io.observe(el));
    for (let i = 1; i <= Math.min(2, numPages); i++) {
      const el = pageRefs.current.get(i);
      if (el) void renderPageInto(i, el);
    }
    return () => io.disconnect();
  }, [open, numPages, renderPageInto]);

  // Re-render all visible pages on orientation / resize
  useEffect(() => {
    if (!open) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      const root = scrollRef.current;
      if (root && root.scrollHeight > 0) {
        scrollRatioRef.current = root.scrollTop / root.scrollHeight;
      }
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        rendered.current.clear();
        pageRefs.current.forEach((el, n) => {
          el.innerHTML = "";
          void renderPageInto(n, el);
        });
        requestAnimationFrame(() => {
          const r = scrollRef.current;
          if (r) r.scrollTop = scrollRatioRef.current * r.scrollHeight;
        });
      }, 150);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (timer) clearTimeout(timer);
    };
  }, [open, renderPageInto]);

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
          className="fixed inset-0 z-[100] flex flex-col bg-[#0A0A0A]"
          style={{ width: "100vw", height: "100dvh" }}
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

          {rotateHint && (
            <div className="absolute top-14 inset-x-0 z-40 flex justify-center pointer-events-none">
              <span className="text-xs bg-black/75 text-white px-3 py-1.5 rounded-full max-w-[90%] text-center">
                Rotate your phone to switch between portrait and landscape
              </span>
            </div>
          )}

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
            <div
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 z-30 pointer-events-none transition-opacity",
                controls ? "opacity-100" : "opacity-40"
              )}
            >
              <span className="text-[11px] font-medium text-white/90 bg-black/55 px-2 py-1.5 rounded-full tabular-nums">
                {visiblePage} / {numPages}
              </span>
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden bg-[#0A0A0A]"
            onClick={bumpControls}
          >
            {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
              <div
                key={n}
                data-page={n}
                ref={(el) => {
                  if (el) pageRefs.current.set(n, el);
                  else pageRefs.current.delete(n);
                }}
                className="w-full bg-white flex justify-center"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

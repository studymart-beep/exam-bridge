"use client";

/* These measures stop casual download and print attempts but cannot prevent a
 * determined user from extracting an already-loaded PDF via DevTools or screen
 * capture. No web platform can fully prevent this.
 * Full-screen coverage depends on the browser and manifest display_override.
 * Users must uninstall/reinstall the PWA for manifest changes to take effect.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";
import { getMaterialSignedUrl } from "@/lib/actions/student/materials";
import {
  getFile,
  putFile,
  setActiveCacheKey,
  type CacheMeta,
} from "@/lib/offline/cache";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import CoverThumb from "@/components/shared/CoverThumb";

type MaterialProp = {
  id: string;
  title: string;
  source: string | null;
  source_type?: string | null;
  cover_url?: string | null;
};

type Props = {
  material: MaterialProp;
  /** Open from IndexedDB / downloads page without network */
  offlineBlob?: Blob | null;
  /** Start open immediately (downloads page) */
  forceOpen?: boolean;
  onClosed?: () => void;
  /** Optional labels stored with offline cache */
  subjectTitle?: string;
  topicTitle?: string;
};

export default function PDFViewerSecure({
  material,
  offlineBlob = null,
  forceOpen = false,
  onClosed,
  subjectTitle,
  topicTitle,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [visiblePage, setVisiblePage] = useState(1);
  const { showToast } = useToast();
  const [cached, setCached] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [open, setOpen] = useState(false);
  const [controls, setControls] = useState(true);
  const [rotateHint, setRotateHint] = useState(false);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const rendered = useRef<Set<number>>(new Set());
  const renderTasks = useRef<Map<number, RenderTask>>(new Map());
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheKey = `pdf:${material.id}`;
  const scrollRatioRef = useRef(0);
  const fsTried = useRef(false);

  const bumpControls = useCallback(() => {
    setControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControls(false), 3000);
  }, []);

  /** Single render path for online + offline */
  const renderPageInto = useCallback(
    async (pageNum: number, container: HTMLDivElement) => {
      const doc = pdfDocRef.current;
      if (!doc) return;

      // Cancel in-flight render for this page
      const prev = renderTasks.current.get(pageNum);
      if (prev) {
        try {
          prev.cancel();
        } catch {
          /* ignore */
        }
        renderTasks.current.delete(pageNum);
      }

      const pdfPage: PDFPageProxy = await doc.getPage(pageNum);
      // Natural page rotation only — never apply CSS rotate
      const baseViewport = pdfPage.getViewport({ scale: 1 });
      let cssWidth = container.clientWidth;
      if (!cssWidth || cssWidth < 40) {
        cssWidth = Math.min(window.innerWidth || 390, 900);
      }
      const dpr = window.devicePixelRatio || 1;
      const scale = (cssWidth / baseViewport.width) * dpr;
      const scaledViewport = pdfPage.getViewport({ scale });

      let canvas = container.querySelector("canvas") as HTMLCanvasElement | null;
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.draggable = false;
        canvas.style.userSelect = "none";
        container.appendChild(canvas);
      }

      canvas.width = Math.floor(scaledViewport.width);
      canvas.height = Math.floor(scaledViewport.height);
      canvas.style.width = `${Math.floor(scaledViewport.width / dpr)}px`;
      canvas.style.height = `${Math.floor(scaledViewport.height / dpr)}px`;
      canvas.style.display = "block";
      canvas.style.margin = "0 auto";
      canvas.style.background = "#FFFFFF";
      canvas.style.transform = "none";

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const task = pdfPage.render({
        canvasContext: ctx,
        viewport: scaledViewport,
      });
      renderTasks.current.set(pageNum, task);
      try {
        await task.promise;
        rendered.current.add(pageNum);
      } catch (e) {
        // cancelled is fine
        if ((e as { name?: string })?.name !== "RenderingCancelledException") {
          console.error("PDF page render failed", e);
        }
      } finally {
        renderTasks.current.delete(pageNum);
      }
    },
    []
  );

  const openPdfData = useCallback(async (data: ArrayBuffer) => {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
    // Copy buffer so pdf.js owns a stable ArrayBuffer
    const copy = data.slice(0);
    const doc = await pdfjs.getDocument({ data: copy }).promise;
    pdfDocRef.current = doc;
    setNumPages(doc.numPages);
    rendered.current.clear();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActiveCacheKey(cacheKey);
    try {
      if (offlineBlob) {
        await openPdfData(await offlineBlob.arrayBuffer());
        setCached(true);
        setLoading(false);
        return;
      }
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
      const response = await fetch(res.url, { cache: "no-store" });
      if (!response.ok) {
        setError(`Failed to fetch PDF (${response.status})`);
        setLoading(false);
        return;
      }
      const buffer = await response.arrayBuffer();
      const cl = response.headers.get("content-length");
      if (cl && Number(cl) > 0 && Number(cl) !== buffer.byteLength) {
        // Incomplete body — retry once
        const response2 = await fetch(res.url, { cache: "no-store" });
        const buffer2 = await response2.arrayBuffer();
        await openPdfData(buffer2);
      } else {
        await openPdfData(buffer);
      }
      setCached(false);
    } catch {
      setError("Failed to load PDF");
    } finally {
      setLoading(false);
    }
  }, [cacheKey, material.id, offlineBlob, openPdfData]);

  async function tryFullscreen(el: HTMLElement) {
    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
        return true;
      }
    } catch {
      /* iOS / blocked */
    }
    return false;
  }

  async function openReader() {
    setOpen(true);
    document.body.style.overflow = "hidden";
    window.history.pushState({ ebPdfFs: true }, "");
    bumpControls();
    setRotateHint(true);
    setTimeout(() => setRotateHint(false), 2000);
    fsTried.current = false;
    if (!pdfDocRef.current) await load();
    // Fullscreen after paint
    setTimeout(() => {
      const el = document.getElementById("eb-pdf-viewer");
      if (el && !fsTried.current) {
        fsTried.current = true;
        void tryFullscreen(el);
      }
    }, 80);
  }

  function closeReader() {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    }
    setOpen(false);
    document.body.style.overflow = "";
    setRotateHint(false);
    onClosed?.();
  }

  useEffect(() => {
    if (forceOpen) void openReader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceOpen]);

  useEffect(() => {
    if (!open) return;
    const onPop = () => closeReader();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeReader();
        return;
      }
      const mod = e.ctrlKey || e.metaKey;
      if (mod && (e.key === "s" || e.key === "S" || e.key === "p" || e.key === "P")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Mount page shells + render
  useEffect(() => {
    if (!open || !numPages || !pdfDocRef.current) return;
    const root = scrollRef.current;
    if (!root) return;
    root.innerHTML = "";
    pageRefs.current.clear();
    rendered.current.clear();

    for (let i = 1; i <= numPages; i++) {
      const wrap = document.createElement("div");
      wrap.dataset.page = String(i);
      wrap.className = "pdf-page-shell w-full mb-2";
      wrap.style.minHeight = "40px";
      root.appendChild(wrap);
      pageRefs.current.set(i, wrap);
    }

    // Stagger first few pages
    void (async () => {
      for (let i = 1; i <= Math.min(3, numPages); i++) {
        const el = pageRefs.current.get(i);
        if (el) await renderPageInto(i, el);
      }
      // IntersectionObserver for rest
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const pageNum = Number((entry.target as HTMLElement).dataset.page);
            if (!pageNum || rendered.current.has(pageNum)) continue;
            void renderPageInto(pageNum, entry.target as HTMLDivElement);
          }
        },
        { root, rootMargin: "200px 0px", threshold: 0.01 }
      );
      pageRefs.current.forEach((el) => io.observe(el));
      return () => io.disconnect();
    })();
  }, [open, numPages, renderPageInto]);

  // Resize / orientation — re-render
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
        pageRefs.current.forEach((el, pageNum) => {
          void renderPageInto(pageNum, el);
        });
        requestAnimationFrame(() => {
          const r = scrollRef.current;
          if (r && r.scrollHeight > 0) {
            r.scrollTop = scrollRatioRef.current * r.scrollHeight;
          }
        });
      }, 200);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [open, renderPageInto]);

  // Visible page badge
  useEffect(() => {
    if (!open) return;
    const root = scrollRef.current;
    if (!root) return;
    const onScroll = () => {
      const mid = root.scrollTop + root.clientHeight / 3;
      let best = 1;
      pageRefs.current.forEach((el, n) => {
        if (el.offsetTop <= mid) best = n;
      });
      setVisiblePage(best);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, [open, numPages]);

  async function downloadOffline() {
    if (downloading || cached) return;
    setDownloading(true);
    try {
      const res = await getMaterialSignedUrl(material.id);
      if ("error" in res) {
        showToast(res.error, "error");
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
        subjectTitle: subjectTitle || undefined,
        topicTitle: topicTitle || undefined,
        coverUrl: material.cover_url || undefined,
      };
      await putFile(cacheKey, blob, meta);
      setCached(true);
      showToast("Saved to downloads", "success");
    } catch {
      setError("Download failed");
      showToast("Download failed", "error");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-3 select-none" onContextMenu={(e) => e.preventDefault()}>
      {!forceOpen && (
        <button
          type="button"
          onClick={() => void openReader()}
          className="w-full text-left rounded-2xl overflow-hidden border border-border bg-surface shadow-sm active:scale-[0.99] transition"
        >
          <div className="relative w-full aspect-[4/3]">
            <CoverThumb coverPath={material.cover_url} kind="pdf" alt={material.title} />
            <div className="absolute inset-0 flex items-end justify-center pb-3">
              <span className="text-xs text-white/90 bg-black/45 px-2 py-1 rounded-full">
                Tap to open
              </span>
            </div>
          </div>
          <div className="px-3 py-2.5">
            <p className="text-sm font-semibold text-text-primary truncate">
              {material.title}
            </p>
            <p className="text-xs text-text-muted">Tap to open fullscreen reader</p>
          </div>
        </button>
      )}

      {error && !open && (
        <p className="text-sm text-error text-center">{error}</p>
      )}

      {open && (
        <div
          id="eb-pdf-viewer"
          className="pdf-viewer-wrapper fixed inset-0 z-[99999] flex flex-col bg-[#0A0A0A] select-none"
          style={{
            width: "100vw",
            height: "100dvh",
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
          onContextMenu={(e) => e.preventDefault()}
          onClick={bumpControls}
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

          <div
            className={cn(
              "absolute top-3 right-3 z-30 flex gap-2 transition-opacity",
              controls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            style={{ top: "calc(0.75rem + env(safe-area-inset-top))" }}
          >
            {!offlineBlob && (
              <button
                type="button"
                className="min-w-[44px] min-h-[44px] rounded-full bg-black/60 text-white text-sm disabled:opacity-40"
                disabled={downloading || cached}
                onClick={(e) => {
                  e.stopPropagation();
                  void downloadOffline();
                }}
                aria-label="Download for offline"
                title={cached ? "Downloaded" : "Download"}
              >
                {downloading ? "…" : cached ? "✓" : "↓"}
              </button>
            )}
            <button
              type="button"
              className="min-w-[44px] min-h-[44px] rounded-full bg-black/60 text-white text-lg"
              onClick={(e) => {
                e.stopPropagation();
                closeReader();
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

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

          {material.cover_url && (
            <div className="w-full h-16 sm:h-20 shrink-0 relative opacity-90">
              <CoverThumb coverPath={material.cover_url} kind="pdf" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0A0A]" />
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden bg-[#0A0A0A]"
            onClick={bumpControls}
          />
        </div>
      )}
    </div>
  );
}

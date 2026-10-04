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

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

export default function PDFViewerSecure({
  material,
}: {
  material: MaterialProp;
}) {
  const desktopCanvasRef = useRef<HTMLCanvasElement>(null);
  const mobileCanvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [cached, setCached] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [jumpValue, setJumpValue] = useState("");
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const cacheKey = `pdf:${material.id}`;

  const renderTo = useCallback(
    async (pageNum: number, canvas: HTMLCanvasElement | null, scale: number) => {
      const doc = pdfDocRef.current;
      if (!doc || !canvas) return;
      const pdfPage = await doc.getPage(pageNum);
      const viewport = pdfPage.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const task = pdfPage.render({ canvasContext: ctx, viewport });
      await task.promise;
    },
    []
  );

  const renderPage = useCallback(
    async (pageNum: number) => {
      await renderTo(pageNum, desktopCanvasRef.current, 1.25 * zoom);
      if (fullscreen) {
        const w = typeof window !== "undefined" ? window.innerWidth : 375;
        const base = Math.max(0.8, (w - 16) / 600);
        await renderTo(pageNum, mobileCanvasRef.current, base * zoom);
      }
    },
    [fullscreen, renderTo, zoom]
  );

  const openPdfData = useCallback(
    async (data: ArrayBuffer) => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      const doc = await pdfjs.getDocument({ data: new Uint8Array(data) }).promise;
      pdfDocRef.current = doc;
      setNumPages(doc.numPages);
      setPage(1);
      await renderPage(1);
    },
    [renderPage]
  );

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

  useEffect(() => {
    void load();
    return () => setActiveCacheKey(null);
  }, [load]);

  useEffect(() => {
    if (pdfDocRef.current) void renderPage(page);
  }, [page, zoom, fullscreen, renderPage]);

  useEffect(() => {
    const block = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "p")) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", block);
    return () => window.removeEventListener("keydown", block);
  }, []);

  function bumpControls() {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
  }

  useEffect(() => {
    if (!fullscreen) return;
    bumpControls();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreen, page]);

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

  function goPage(n: number) {
    setPage(Math.min(Math.max(1, n), numPages || 1));
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    bumpControls();
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) goPage(page + 1);
    else goPage(page - 1);
  }

  const controls = (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={page <= 1}
        onClick={() => goPage(page - 1)}
      >
        Prev
      </Button>
      <span className="text-sm text-text-secondary min-w-[4.5rem] text-center">
        {page} / {numPages || "—"}
      </span>
      <Button
        size="sm"
        variant="outline"
        disabled={page >= numPages}
        onClick={() => goPage(page + 1)}
      >
        Next
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
      >
        −
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
      >
        +
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setJumpOpen((v) => !v)}>
        Jump
      </Button>
      {jumpOpen && (
        <form
          className="flex gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            const n = parseInt(jumpValue, 10);
            if (!isNaN(n)) goPage(n);
            setJumpOpen(false);
            setJumpValue("");
          }}
        >
          <input
            type="number"
            min={1}
            max={numPages || 1}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            className="w-16 h-9 px-2 rounded-lg border border-border text-sm bg-surface"
            placeholder="#"
          />
          <Button size="sm" type="submit">
            Go
          </Button>
        </form>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={downloading || cached || !!error}
        loading={downloading}
        onClick={() => void downloadOffline()}
      >
        {cached ? "Downloaded" : "Download"}
      </Button>
    </div>
  );

  return (
    <div
      className="space-y-3 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <p className="text-sm font-medium text-text-primary">{material.title}</p>
      {loading && (
        <p className="text-sm text-text-muted py-8 text-center">Loading PDF…</p>
      )}
      {error && <p className="text-sm text-error py-4 text-center">{error}</p>}

      {/* Mobile: open fullscreen */}
      {!loading && !error && (
        <div className="md:hidden">
          <Button fullWidth onClick={() => setFullscreen(true)}>
            Open PDF
          </Button>
        </div>
      )}

      {/* Desktop inline */}
      <div className="hidden md:block space-y-3">
        <div className="overflow-auto max-h-[70vh] rounded-xl border border-border bg-surface">
          <canvas
            ref={desktopCanvasRef}
            className="mx-auto max-w-full pointer-events-none"
          />
        </div>
        {numPages > 0 && controls}
      </div>

      {/* Mobile fullscreen overlay */}
      {fullscreen && (
        <div className="fixed inset-0 z-[100] bg-[#1A1A1A] flex flex-col md:hidden">
          <div
            className="flex-1 overflow-auto"
            onClick={bumpControls}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <canvas
              ref={mobileCanvasRef}
              className="mx-auto max-w-full pointer-events-none"
            />
          </div>
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-opacity duration-300",
              controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <div className="rounded-2xl bg-black/80 backdrop-blur border border-white/10 px-2 py-3 text-white">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  className="min-h-[44px] min-w-[44px] px-2 text-sm font-medium disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => goPage(page - 1)}
                >
                  ◀
                </button>
                <span className="text-sm tabular-nums">
                  {page} / {numPages || "—"}
                </span>
                <button
                  type="button"
                  className="min-h-[44px] min-w-[44px] px-2 text-sm font-medium disabled:opacity-40"
                  disabled={page >= numPages}
                  onClick={() => goPage(page + 1)}
                >
                  ▶
                </button>
                <button
                  type="button"
                  className="min-h-[44px] min-w-[44px] text-sm"
                  onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
                >
                  −
                </button>
                <button
                  type="button"
                  className="min-h-[44px] min-w-[44px] text-sm"
                  onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
                >
                  +
                </button>
                <button
                  type="button"
                  className="min-h-[44px] px-2 text-sm"
                  onClick={() => setJumpOpen((v) => !v)}
                >
                  Jump
                </button>
                <button
                  type="button"
                  className="min-h-[44px] px-2 text-sm disabled:opacity-40"
                  disabled={downloading || cached}
                  onClick={() => void downloadOffline()}
                >
                  {cached ? "✓" : "⬇"}
                </button>
                <button
                  type="button"
                  className="min-h-[44px] min-w-[44px] text-lg"
                  onClick={() => setFullscreen(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              {jumpOpen && (
                <form
                  className="mt-2 flex gap-2 justify-center"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const n = parseInt(jumpValue, 10);
                    if (!isNaN(n)) goPage(n);
                    setJumpOpen(false);
                    setJumpValue("");
                    bumpControls();
                  }}
                >
                  <input
                    type="number"
                    min={1}
                    max={numPages || 1}
                    value={jumpValue}
                    onChange={(e) => setJumpValue(e.target.value)}
                    className="w-20 h-10 px-2 rounded-lg bg-white/10 text-white text-sm border border-white/20"
                    placeholder="Page"
                  />
                  <button type="submit" className="h-10 px-3 rounded-lg bg-primary text-sm font-medium">
                    Go
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

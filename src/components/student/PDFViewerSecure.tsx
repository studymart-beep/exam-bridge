"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import Image from "next/image";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [cached, setCached] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [open, setOpen] = useState(false);
  const [controls, setControls] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [jumpValue, setJumpValue] = useState("");
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const cacheKey = `pdf:${material.id}`;

  const bumpControls = useCallback(() => {
    setControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControls(false), 3000);
  }, []);

  const renderPage = useCallback(
    async (pageNum: number, scale: number) => {
      const doc = pdfDocRef.current;
      const canvas = canvasRef.current;
      if (!doc || !canvas) return;
      const pdfPage = await doc.getPage(pageNum);
      const base = typeof window !== "undefined" ? window.innerWidth - 8 : 360;
      const viewport0 = pdfPage.getViewport({ scale: 1 });
      const fit = (base / viewport0.width) * scale;
      const viewport = pdfPage.getViewport({ scale: fit });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      await pdfPage.render({ canvasContext: ctx, viewport }).promise;
    },
    []
  );

  const openPdfData = useCallback(
    async (data: ArrayBuffer) => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      const doc = await pdfjs.getDocument({ data: new Uint8Array(data) }).promise;
      pdfDocRef.current = doc;
      setNumPages(doc.numPages);
      setPage(1);
      await renderPage(1, zoom);
    },
    [renderPage, zoom]
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

  async function openReader() {
    setOpen(true);
    document.body.style.overflow = "hidden";
    bumpControls();
    window.history.pushState({ ebPdfFs: true }, "");
    if (!pdfDocRef.current) await load();
    else await renderPage(page, zoom);
  }

  function closeReader() {
    setOpen(false);
    document.body.style.overflow = "";
    setJumpOpen(false);
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
    if (open && pdfDocRef.current) void renderPage(page, zoom);
  }, [page, zoom, open, renderPage]);

  useEffect(() => {
    return () => {
      setActiveCacheKey(null);
      document.body.style.overflow = "";
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  function goPage(n: number) {
    setPage(Math.min(Math.max(1, n), numPages || 1));
    bumpControls();
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    bumpControls();
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 60) return;
    if (dx < 0) goPage(page + 1);
    else goPage(page - 1);
  }

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
        <div className="relative w-full aspect-[4/3] bg-primary-light flex items-center justify-center">
          <Image
            src="/logo.png"
            alt=""
            width={96}
            height={96}
            className="object-contain opacity-90"
          />
          <span className="absolute bottom-3 left-3 text-xs font-bold uppercase tracking-wide bg-primary text-white px-2 py-1 rounded-md">
            PDF
          </span>
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
        <div className="fixed inset-0 z-[200] bg-[#1A1A1A] flex flex-col">
          {loading && (
            <p className="absolute inset-0 flex items-center justify-center text-white text-sm">
              Loading PDF…
            </p>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3 p-4">
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

          <div
            className="flex-1 overflow-auto"
            onClick={() => {
              if (controls) setControls(false);
              else bumpControls();
            }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <canvas
              ref={canvasRef}
              className="mx-auto max-w-full pointer-events-none"
            />
          </div>

          {/* page badge */}
          {numPages > 0 && (
            <div
              className={cn(
                "absolute top-3 left-3 z-30 rounded-full bg-black/70 text-white text-xs px-3 py-1.5 transition-opacity",
                controls ? "opacity-100" : "opacity-0"
              )}
            >
              {page} / {numPages}
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

          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-opacity duration-200",
              controls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <div className="rounded-2xl bg-black/80 backdrop-blur border border-white/10 px-2 py-2 text-white flex flex-wrap items-center justify-center gap-1">
              <button
                type="button"
                className="min-h-[44px] min-w-[44px] disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => goPage(page - 1)}
              >
                ◀
              </button>
              <span className="text-sm tabular-nums px-2">
                {page} / {numPages || "—"}
              </span>
              <button
                type="button"
                className="min-h-[44px] min-w-[44px] disabled:opacity-40"
                disabled={page >= numPages}
                onClick={() => goPage(page + 1)}
              >
                ▶
              </button>
              <button
                type="button"
                className="min-h-[44px] min-w-[44px]"
                onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
              >
                −
              </button>
              <button
                type="button"
                className="min-h-[44px] min-w-[44px]"
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
                }}
              >
                <input
                  type="number"
                  min={1}
                  max={numPages || 1}
                  value={jumpValue}
                  onChange={(e) => setJumpValue(e.target.value)}
                  className="w-20 h-11 px-2 rounded-lg bg-white/10 text-white text-sm border border-white/20"
                  placeholder="Page"
                />
                <button
                  type="submit"
                  className="h-11 px-4 rounded-lg bg-primary text-sm font-medium text-white"
                >
                  Go
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [cached, setCached] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const cacheKey = `pdf:${material.id}`;

  const renderPage = useCallback(async (pageNum: number) => {
    const doc = pdfDocRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas) return;
    const pdfPage = await doc.getPage(pageNum);
    const viewport = pdfPage.getViewport({ scale: 1.25 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const renderTask = pdfPage.render({
      canvasContext: ctx,
      viewport,
    });
    await renderTask.promise;
  }, []);

  const openPdfData = useCallback(
    async (data: ArrayBuffer) => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      const doc = await pdfjs.getDocument({ data: new Uint8Array(data) })
        .promise;
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
        const buf = await local.blob.arrayBuffer();
        await openPdfData(buf);
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
      const buf = await response.arrayBuffer();
      await openPdfData(buf);
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
  }, [page, renderPage]);

  useEffect(() => {
    const block = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "p")) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", block);
    return () => window.removeEventListener("keydown", block);
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
    <div
      className="space-y-3 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <p className="text-sm font-medium text-text-primary">{material.title}</p>
      {loading && (
        <p className="text-sm text-text-muted py-8 text-center">Loading PDF…</p>
      )}
      {error && <p className="text-sm text-error py-4 text-center">{error}</p>}
      <div className="overflow-auto max-h-[70vh] rounded-xl border border-border bg-surface">
        <canvas
          ref={canvasRef}
          className="mx-auto max-w-full pointer-events-none"
        />
      </div>
      {numPages > 0 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <span className="text-sm text-text-secondary">
            {page} / {numPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= numPages}
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={downloading || cached || !!error}
        loading={downloading}
        onClick={() => void downloadOffline()}
      >
        {cached ? "Downloaded" : "Download for offline"}
      </Button>
    </div>
  );
}

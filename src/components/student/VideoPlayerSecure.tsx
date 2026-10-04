"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

export default function VideoPlayerSecure({
  material,
}: {
  material: MaterialProp;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cached, setCached] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const objectUrlRef = useRef<string | null>(null);
  const cacheKey = `video:${material.id}`;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActiveCacheKey(cacheKey);
    try {
      const local = await getFile(cacheKey);
      if (local) {
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        const ou = URL.createObjectURL(local.blob);
        objectUrlRef.current = ou;
        setUrl(ou);
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
      setUrl(res.url);
      setCached(false);
    } catch {
      setError("Failed to load video");
    } finally {
      setLoading(false);
    }
  }, [cacheKey, material.id]);

  useEffect(() => {
    void load();
    return () => {
      setActiveCacheKey(null);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [load]);

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
    setProgress(0);
    try {
      const res = await getMaterialSignedUrl(material.id);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      const response = await fetch(res.url);
      const total = Number(response.headers.get("content-length") || 0);
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream");
      const chunks: BlobPart[] = [];
      let received = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total) setProgress(Math.round((received / total) * 100));
      }
      const blob = new Blob(chunks, { type: "video/mp4" });
      const meta: CacheMeta = {
        materialId: material.id,
        type: "video",
        title: material.title,
        size: blob.size,
        downloadedAt: Date.now(),
        subscriptionExpiresAt: res.subscriptionExpiresAt
          ? new Date(res.subscriptionExpiresAt).getTime()
          : null,
      };
      await putFile(cacheKey, blob, meta);
      setCached(true);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const ou = URL.createObjectURL(blob);
      objectUrlRef.current = ou;
      setUrl(ou);
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
        <p className="text-sm text-text-muted py-8 text-center">Loading video…</p>
      )}
      {error && (
        <p className="text-sm text-error py-4 text-center">{error}</p>
      )}
      {url && !loading && (
        <div className="rounded-xl overflow-hidden bg-black border border-border">
          <video
            src={url}
            controls
            controlsList="nodownload nofullscreen"
            disablePictureInPicture
            preload="metadata"
            className="w-full max-h-[70vh]"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          size="sm"
          variant="outline"
          disabled={downloading || cached || !!error}
          loading={downloading}
          onClick={() => void downloadOffline()}
        >
          {cached
            ? "Downloaded"
            : downloading
              ? `Downloading ${progress}%`
              : "Download for offline"}
        </Button>
      </div>
    </div>
  );
}

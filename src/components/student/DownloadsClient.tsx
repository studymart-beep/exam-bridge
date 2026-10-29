"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import PDFViewerSecure from "@/components/student/PDFViewerSecure";
import OfflineImageViewer from "@/components/student/OfflineImageViewer";
import {
  listFiles,
  deleteFile,
  getFile,
  type CacheMeta,
} from "@/lib/offline/cache";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import CoverThumb from "@/components/shared/CoverThumb";

type Row = { key: string; meta: CacheMeta };

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function DownloadsClient() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [removeKey, setRemoveKey] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const [pdfOpen, setPdfOpen] = useState<{
    blob: Blob;
    id: string;
    title: string;
  } | null>(null);
  const [videoOpen, setVideoOpen] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [imageOpen, setImageOpen] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const list = await listFiles();
      list.sort((a, b) => b.meta.downloadedAt - a.meta.downloadedAt);
      setRows(list);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const sync = () => setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, Row[]>>();
    for (const row of rows) {
      const subj = row.meta.subjectTitle || "My downloads";
      const topic = row.meta.topicTitle || "Saved items";
      if (!map.has(subj)) map.set(subj, new Map());
      const topics = map.get(subj)!;
      if (!topics.has(topic)) topics.set(topic, []);
      topics.get(topic)!.push(row);
    }
    return map;
  }, [rows]);

  /** Every cached type opens inside the app — never a browser tab. */
  async function openItem(row: Row) {
    try {
      const file = await getFile(row.key);
      if (!file) {
        showToast("File missing from cache", "error");
        return;
      }
      if (row.meta.type === "pdf") {
        setVideoOpen(null);
        setImageOpen(null);
        setPdfOpen({
          blob: file.blob,
          id: row.meta.materialId,
          title: row.meta.title,
        });
        return;
      }
      const url = URL.createObjectURL(file.blob);
      if (row.meta.type === "video") {
        setPdfOpen(null);
        setImageOpen(null);
        setVideoOpen({ url, title: row.meta.title });
        return;
      }
      // image — dedicated in-app viewer
      setPdfOpen(null);
      setVideoOpen(null);
      setImageOpen({ url, title: row.meta.title });
    } catch {
      showToast("Could not open file", "error");
    }
  }

  function closeVideo() {
    if (videoOpen?.url) URL.revokeObjectURL(videoOpen.url);
    setVideoOpen(null);
  }

  function closeImage() {
    if (imageOpen?.url) URL.revokeObjectURL(imageOpen.url);
    setImageOpen(null);
  }

  async function confirmRemove() {
    if (!removeKey) return;
    setRemoving(true);
    try {
      await deleteFile(removeKey);
      setRemoveKey(null);
      showToast("Removed from downloads", "success");
      await refresh();
    } catch {
      showToast("Could not remove", "error");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <>
      <Section title="Offline downloads" tint="blue">
        {!online && (
          <p className="text-xs text-text-secondary mb-3 px-1">
            You&apos;re offline. Only items already saved on this device are available.
          </p>
        )}

        {loading ? (
          <p className="text-sm text-text-muted text-center py-8">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="text-center py-10 px-4">
            <p className="text-sm text-text-secondary">
              {online
                ? "No downloads yet. Tap the download button inside a video or PDF to save it here."
                : "You're offline. Download videos, PDFs, and images while online to access them here."}
            </p>
            {online && (
              <Link href="/subjects" className="inline-block mt-4">
                <Button size="sm">Browse subjects</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([subject, topics]) => (
              <div key={subject}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <h3 className="font-heading font-bold text-sm text-text-primary">
                    {subject}
                  </h3>
                </div>
                {Array.from(topics.entries()).map(([topic, items]) => (
                  <div key={topic} className="mb-3 ml-2">
                    <p className="text-xs font-semibold text-text-secondary mb-2">
                      {topic}
                    </p>
                    <ul className="space-y-2.5">
                      {items.map((row) => (
                        <li
                          key={row.key}
                          className={cn(
                            "flex items-start gap-3 p-3.5 rounded-2xl border border-white/50 shadow-soft",
                            row.meta.type === "video"
                              ? "bg-gradient-to-br from-calm-light to-cream"
                              : "bg-gradient-to-br from-primary-light to-cream"
                          )}
                        >
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                            <CoverThumb
                              coverPath={row.meta.coverUrl}
                              kind={row.meta.type}
                              alt={row.meta.title}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-text-primary truncate">
                              {row.meta.title}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">
                              {formatDate(row.meta.downloadedAt)} ·{" "}
                              {formatBytes(row.meta.size)}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" onClick={() => void openItem(row)}>
                                Open
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-error border-error/40"
                                onClick={() => setRemoveKey(row.key)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Section>

      {pdfOpen && (
        <PDFViewerSecure
          material={{
            id: pdfOpen.id,
            title: pdfOpen.title,
            source: null,
          }}
          offlineBlob={pdfOpen.blob}
          forceOpen
          onClosed={() => setPdfOpen(null)}
        />
      )}

      {videoOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black flex flex-col"
          style={{
            width: "100vw",
            height: "100dvh",
            paddingTop: "env(safe-area-inset-top)",
          }}
        >
          <div className="flex items-center justify-between px-3 py-2 text-white">
            <p className="text-sm font-medium truncate pr-2">{videoOpen.title}</p>
            <button
              type="button"
              className="min-w-[44px] min-h-[44px] rounded-full bg-white/15"
              onClick={closeVideo}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <video
              src={videoOpen.url}
              controls
              playsInline
              autoPlay
              className="max-w-full max-h-full w-full"
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>
      )}

      {imageOpen && (
        <OfflineImageViewer
          url={imageOpen.url}
          title={imageOpen.title}
          offline
          onClose={closeImage}
        />
      )}

      <ConfirmDialog
        open={!!removeKey}
        onClose={() => setRemoveKey(null)}
        onConfirm={() => void confirmRemove()}
        title="Remove download?"
        message="This removes the offline copy from this device. You can download it again later."
        confirmLabel="Remove"
        danger
        loading={removing}
      />
    </>
  );
}

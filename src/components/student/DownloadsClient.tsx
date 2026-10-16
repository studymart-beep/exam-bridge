"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  listFiles,
  deleteFile,
  getFile,
  type CacheMeta,
} from "@/lib/offline/cache";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

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
  const [removeKey, setRemoveKey] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

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

  async function openItem(row: Row) {
    try {
      const file = await getFile(row.key);
      if (!file) {
        showToast("File missing from cache", "error");
        return;
      }
      const url = URL.createObjectURL(file.blob);
      // Open in new tab for PDF; video in new tab too
      window.open(url, "_blank", "noopener,noreferrer");
      // revoke later
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      showToast("Could not open file", "error");
    }
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
        {loading ? (
          <p className="text-sm text-text-muted text-center py-8">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="text-center py-10 px-4">
            <p className="text-sm text-text-secondary">
              No downloads yet. Tap the download button inside a video or PDF
              to save it here.
            </p>
            <Link href="/subjects" className="inline-block mt-4">
              <Button size="sm">Browse subjects</Button>
            </Link>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {rows.map((row) => (
              <li
                key={row.key}
                className={cn(
                  "flex items-start gap-3 p-3.5 rounded-2xl border border-white/50 shadow-soft",
                  row.meta.type === "video"
                    ? "bg-gradient-to-br from-calm-light to-cream"
                    : "bg-gradient-to-br from-primary-light to-cream"
                )}
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold shrink-0",
                    row.meta.type === "video"
                      ? "bg-calm text-white"
                      : "bg-primary text-white"
                  )}
                >
                  {row.meta.type === "video" ? "VID" : "PDF"}
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
        )}
      </Section>

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

"use client";

import { useEffect, useState } from "react";
import { getFile, type CacheMeta } from "@/lib/offline/cache";

/**
 * Resolve a media blob for display, preferring the offline copy saved in
 * IndexedDB. Used by the downloads page so cached PDFs / videos / images open
 * inside the app with no network at all.
 */
export function useOfflineBlob(
  cacheKey: string | null,
  fallbackLoader?: () => Promise<Blob | null>
) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"cache" | "network" | null>(null);

  useEffect(() => {
    let cancelled = false;
    let created: string | null = null;

    void (async () => {
      if (!cacheKey) return;
      setLoading(true);
      setError(null);
      try {
        const hit = await getFile(cacheKey);
        if (hit) {
          created = URL.createObjectURL(hit.blob);
          if (!cancelled) {
            setUrl(created);
            setSource("cache");
          }
          return;
        }
        if (fallbackLoader) {
          const blob = await fallbackLoader();
          if (cancelled) return;
          if (!blob) {
            setError("Nothing saved offline for this item.");
            return;
          }
          created = URL.createObjectURL(blob);
          setUrl(created);
          setSource("network");
        }
      } catch {
        if (!cancelled) setError("Could not open the saved file.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  return { url, loading, error, source };
}

export function cacheKeyForType(
  type: CacheMeta["type"],
  materialId: string
): string {
  return `${type}:${materialId}`;
}

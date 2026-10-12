"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as RPointerEvent,
} from "react";
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

const SPEEDS = [0.5, 1, 1.25, 1.5, 2] as const;

function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function VideoPlayerSecure({
  material,
}: {
  material: MaterialProp;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTap = useRef<{ t: number; side: "left" | "right" } | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dlProgress, setDlProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [iosFs, setIosFs] = useState(false);
  const [rotateHint, setRotateHint] = useState(false);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [controls, setControls] = useState(true);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [speedMenu, setSpeedMenu] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const [ripple, setRipple] = useState<"left" | "right" | null>(null);
  const [scrubbing, setScrubbing] = useState(false);

  const cacheKey = `video:${material.id}`;

  const bumpControls = useCallback(() => {
    setControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControls(false);
    }, 3000);
  }, []);

  const loadUrl = useCallback(async () => {
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

  async function openPlayer() {
    setOpen(true);
    if (!url) await loadUrl();
    requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      const afterFs = () => {
        // Allow natural portrait/landscape rotation (YouTube-style).
        // Best-effort unlock so the OS is not stuck in one orientation.
        try {
          const orient = screen.orientation as ScreenOrientation & {
            unlock?: () => void;
            lock?: (o: string) => Promise<void>;
          };
          orient?.unlock?.();
          if (orient?.lock) {
            void orient.lock("any").catch(() => undefined);
          }
        } catch {
          /* ignore */
        }
        bumpControls();
      };
      if (typeof el.requestFullscreen === "function") {
        void el
          .requestFullscreen()
          .then(afterFs)
          .catch(() => {
            setIosFs(true);
            document.body.style.overflow = "hidden";
            afterFs();
          });
      } else {
        setIosFs(true);
        document.body.style.overflow = "hidden";
        afterFs();
      }
    });
  }

  function closePlayer() {
    const v = videoRef.current;
    if (v) {
      v.pause();
      setPlaying(false);
    }
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
    try {
      const orient = screen.orientation as ScreenOrientation & {
        unlock?: () => void;
      };
      orient?.unlock?.();
    } catch {
      /* ignore */
    }
    setIosFs(false);
    setRotateHint(false);
    document.body.style.overflow = "";
    setOpen(false);
    setSpeedMenu(false);
  }

  useEffect(() => {
    return () => {
      setActiveCacheKey(null);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onFs = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFs(active);
      if (!active && open && !iosFs) {
        // user exited via browser/OS
        setOpen(false);
        const v = videoRef.current;
        if (v) v.pause();
      }
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [open, iosFs]);

  // Android back / popstate
  useEffect(() => {
    if (!open) return;
    const state = { ebVideoFs: true };
    window.history.pushState(state, "");
    const onPop = () => {
      closePlayer();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.playbackRate = speed;
  }, [speed, open, url]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closePlayer();
        return;
      }
      switch (e.key) {
        case " ":
          e.preventDefault();
          if (v.paused) void v.play();
          else v.pause();
          bumpControls();
          break;
        case "ArrowLeft":
          e.preventDefault();
          v.currentTime = Math.max(0, v.currentTime - 10);
          bumpControls();
          break;
        case "ArrowRight":
          e.preventDefault();
          v.currentTime = Math.min(v.duration || 0, v.currentTime + 10);
          bumpControls();
          break;
        case "m":
          e.preventDefault();
          v.muted = !v.muted;
          setMuted(v.muted);
          break;
        case "f":
          e.preventDefault();
          closePlayer();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bumpControls]);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
    bumpControls();
  }

  function skip(delta: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
    bumpControls();
  }

  function onSurfacePointer(e: RPointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const side: "left" | "right" = x < rect.width / 2 ? "left" : "right";
    const now = Date.now();
    const prev = lastTap.current;

    if (prev && now - prev.t < 320) {
      if (singleTapTimer.current) {
        clearTimeout(singleTapTimer.current);
        singleTapTimer.current = null;
      }
      skip(side === "left" ? -10 : 10);
      setRipple(side);
      setTimeout(() => setRipple(null), 400);
      lastTap.current = null;
      return;
    }

    lastTap.current = { t: now, side };
    singleTapTimer.current = setTimeout(() => {
      // single tap: if controls hidden, show them; if visible, play/pause
      if (!controls) {
        bumpControls();
      } else {
        togglePlay();
      }
      lastTap.current = null;
      singleTapTimer.current = null;
    }, 280);
  }

  function seekFromClientX(clientX: number, bar: HTMLElement) {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    v.currentTime = ratio * duration;
    setCurrent(v.currentTime);
  }

  async function downloadOffline() {
    setDownloading(true);
    setDlProgress(0);
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
        if (total) setDlProgress(Math.round((received / total) * 100));
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
    } catch {
      setError("Download failed");
    } finally {
      setDownloading(false);
    }
  }

  const playedPct = duration ? (current / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;

  const playerShell = open && (
    <div
      ref={containerRef}
      className={cn(
        "bg-black z-[200] flex flex-col",
        iosFs || isFs
          ? "fixed inset-0 w-[100vw] h-[100dvh]"
          : open
            ? "fixed inset-0 w-[100vw] h-[100dvh]"
            : "w-full h-full"
      )}
    >
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-sm z-10">
          Loading…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3 z-10 p-4">
          <p className="text-sm text-center">{error}</p>
          <button
            type="button"
            className="min-h-[44px] px-4 rounded-lg bg-white/20"
            onClick={closePlayer}
          >
            Close
          </button>
        </div>
      )}

      {url && (
        <div
          className="relative flex-1 min-h-0 w-full"
          onPointerUp={onSurfacePointer}
        >
          <video
            ref={videoRef}
            src={url}
            className="w-full h-full object-contain"
            playsInline
            preload="metadata"
            controlsList="nodownload nofullscreen"
            onContextMenu={(e) => e.preventDefault()}
            onPlay={() => {
              setPlaying(true);
              bumpControls();
            }}
            onPause={() => {
              setPlaying(false);
              setControls(true);
            }}
            onTimeUpdate={() => {
              const v = videoRef.current;
              if (!v || scrubbing) return;
              setCurrent(v.currentTime);
              if (v.buffered.length) {
                setBuffered(v.buffered.end(v.buffered.length - 1));
              }
            }}
            onLoadedMetadata={() => {
              const v = videoRef.current;
              if (v) {
                setDuration(v.duration || 0);
                void v.play().catch(() => undefined);
              }
            }}
            onClick={(e) => e.preventDefault()}
          />

          {ripple && (
            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 w-1/2 flex items-center justify-center text-white text-2xl font-bold bg-white/15",
                ripple === "left" ? "left-0" : "right-0"
              )}
            >
              {ripple === "left" ? "−10s" : "+10s"}
            </div>
          )}

          {/* Close */}
          <button
            type="button"
            className={cn(
              "absolute top-3 right-3 z-30 min-w-[44px] min-h-[44px] rounded-full bg-black/60 text-white text-lg",
              !controls && "opacity-0 pointer-events-none"
            )}
            onClick={(e) => {
              e.stopPropagation();
              closePlayer();
            }}
            aria-label="Close"
          >
            ✕
          </button>

          {/* Controls */}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-30 transition-opacity duration-200",
              "bg-gradient-to-t from-black/85 via-black/50 to-transparent pt-12 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-3",
              controls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            <div
              className="relative h-6 flex items-center cursor-pointer mb-2"
              onPointerDown={(e) => {
                setScrubbing(true);
                seekFromClientX(e.clientX, e.currentTarget);
                const bar = e.currentTarget;
                const move = (ev: PointerEvent) =>
                  seekFromClientX(ev.clientX, bar);
                const up = () => {
                  setScrubbing(false);
                  window.removeEventListener("pointermove", move);
                  window.removeEventListener("pointerup", up);
                  bumpControls();
                };
                window.addEventListener("pointermove", move);
                window.addEventListener("pointerup", up);
              }}
            >
              <div className="absolute inset-x-0 h-1 rounded-full bg-white/30">
                <div
                  className="absolute h-full rounded-full bg-white/40"
                  style={{ width: `${bufferedPct}%` }}
                />
                <div
                  className="absolute h-full rounded-full bg-primary"
                  style={{ width: `${playedPct}%` }}
                />
              </div>
              <div
                className="absolute w-3.5 h-3.5 rounded-full bg-secondary shadow -translate-x-1/2"
                style={{ left: `${playedPct}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 text-white">
              <button
                type="button"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-base"
                onClick={togglePlay}
              >
                {playing ? "❚❚" : "▶"}
              </button>
              <button
                type="button"
                className="min-w-[44px] min-h-[44px] text-xs font-semibold"
                onClick={() => skip(-10)}
              >
                −10
              </button>
              <button
                type="button"
                className="min-w-[44px] min-h-[44px] text-xs font-semibold"
                onClick={() => skip(10)}
              >
                +10
              </button>
              <span className="text-xs tabular-nums px-1">
                {formatTime(current)} / {formatTime(duration)}
              </span>
              <div className="flex-1 min-w-[8px]" />
              <button
                type="button"
                className="min-w-[44px] min-h-[44px] text-sm"
                onClick={() => {
                  const v = videoRef.current;
                  if (!v) return;
                  v.muted = !v.muted;
                  setMuted(v.muted);
                  bumpControls();
                }}
              >
                {muted ? "🔇" : "🔊"}
              </button>
              <div className="relative">
                <button
                  type="button"
                  className="min-w-[44px] min-h-[44px] text-xs font-semibold"
                  onClick={() => setSpeedMenu((s) => !s)}
                >
                  {speed}x
                </button>
                {speedMenu && (
                  <div className="absolute bottom-full right-0 mb-1 rounded-lg bg-black/95 border border-white/10 py-1 min-w-[4.5rem]">
                    {SPEEDS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={cn(
                          "block w-full text-left px-3 py-2 text-xs hover:bg-white/10",
                          s === speed && "text-secondary font-bold"
                        )}
                        onClick={() => {
                          setSpeed(s);
                          setSpeedMenu(false);
                        }}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="min-w-[44px] min-h-[44px] text-sm"
                onClick={closePlayer}
                aria-label="Exit"
              >
                ⛶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3 select-none" onContextMenu={(e) => e.preventDefault()}>
      {/* Preview card */}
      <button
        type="button"
        onClick={() => void openPlayer()}
        className="w-full text-left rounded-2xl overflow-hidden border border-border bg-surface shadow-sm active:scale-[0.99] transition"
      >
        <div className="relative w-full aspect-video bg-primary-dark">
          <Image
            src="/logo.png"
            alt=""
            fill
            className="object-contain p-8 opacity-90"
            sizes="(max-width: 768px) 100vw, 640px"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            <span className="w-16 h-16 rounded-full bg-black/55 text-white flex items-center justify-center text-2xl pl-1">
              ▶
            </span>
          </div>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-sm font-semibold text-text-primary truncate">
            {material.title}
          </p>
          <p className="text-xs text-text-muted">Tap to play fullscreen</p>
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
        {cached
          ? "Downloaded"
          : downloading
            ? `Downloading ${dlProgress}%`
            : "Download for offline"}
      </Button>

      {error && !open && (
        <p className="text-sm text-error text-center">{error}</p>
      )}

      {playerShell}
    </div>
  );
}

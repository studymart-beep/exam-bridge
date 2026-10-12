"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as RPointerEvent,
} from "react";
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
  const lastTap = useRef<{ t: number; x: number } | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cached, setCached] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dlProgress, setDlProgress] = useState(0);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [controls, setControls] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
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
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [load]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const onFs = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v || !url) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      switch (e.key) {
        case " ":
        case "k":
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
        case "ArrowUp":
          e.preventDefault();
          v.volume = Math.min(1, v.volume + 0.1);
          setVolume(v.volume);
          setMuted(v.volume === 0);
          break;
        case "ArrowDown":
          e.preventDefault();
          v.volume = Math.max(0, v.volume - 0.1);
          setVolume(v.volume);
          setMuted(v.volume === 0);
          break;
        case "f":
          e.preventDefault();
          void toggleFs();
          break;
        case "m":
          e.preventDefault();
          v.muted = !v.muted;
          setMuted(v.muted);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, bumpControls]);

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

  async function toggleFs() {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
    bumpControls();
  }

  function onVideoPointer(e: RPointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const now = Date.now();
    const prev = lastTap.current;
    if (prev && now - prev.t < 300) {
      const side = x < rect.width / 2 ? "left" : "right";
      skip(side === "left" ? -10 : 10);
      setRipple(side);
      setTimeout(() => setRipple(null), 400);
      lastTap.current = null;
      return;
    }
    lastTap.current = { t: now, x };
    setTimeout(() => {
      if (lastTap.current && Date.now() - lastTap.current.t >= 280) {
        setControls((c) => !c);
        if (!controls) bumpControls();
        lastTap.current = null;
      }
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

  const playedPct = duration ? (current / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      className="space-y-3 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <p className="text-sm font-medium text-text-primary md:px-0 px-0">
        {material.title}
      </p>

      {loading && (
        <p className="text-sm text-text-muted py-12 text-center">Loading video…</p>
      )}
      {error && (
        <p className="text-sm text-error py-4 text-center">{error}</p>
      )}

      {url && !loading && (
        <div
          ref={containerRef}
          className={cn(
            "relative bg-black overflow-hidden group",
            "w-full aspect-video",
            "md:rounded-2xl md:border md:border-border",
            isFs && "rounded-none"
          )}
          onPointerUp={onVideoPointer}
        >
          <video
            ref={videoRef}
            src={url}
            className="w-full h-full object-contain"
            playsInline
            preload="metadata"
            controlsList="nodownload nofullscreen"
            disablePictureInPicture={false}
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
              if (v) setDuration(v.duration || 0);
            }}
            onClick={(e) => e.preventDefault()}
          />

          {/* Double-tap ripple */}
          {ripple && (
            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 w-1/2 flex items-center justify-center text-white text-2xl font-bold bg-white/10",
                ripple === "left" ? "left-0" : "right-0"
              )}
            >
              {ripple === "left" ? "−10s" : "+10s"}
            </div>
          )}

          {/* Center play */}
          {controls && (
            <button
              type="button"
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-opacity duration-200 z-10"
              style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              )}
            </button>
          )}

          {/* Fullscreen close */}
          {isFs && controls && (
            <button
              type="button"
              className="absolute top-3 right-3 z-20 min-w-[44px] min-h-[44px] rounded-full bg-black/50 text-white text-lg"
              onClick={(e) => {
                e.stopPropagation();
                void toggleFs();
              }}
              aria-label="Exit fullscreen"
            >
              ✕
            </button>
          )}

          {/* Bottom bar */}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-20 transition-opacity duration-200",
              "bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-10 pb-2 px-2",
              controls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Seek */}
            <div
              className="relative h-5 flex items-center cursor-pointer group/seek mb-1"
              onPointerDown={(e) => {
                setScrubbing(true);
                seekFromClientX(e.clientX, e.currentTarget);
                const bar = e.currentTarget;
                const move = (ev: PointerEvent) => seekFromClientX(ev.clientX, bar);
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
                className="absolute w-3 h-3 rounded-full bg-secondary shadow -translate-x-1/2"
                style={{ left: `${playedPct}%` }}
              />
            </div>

            <div className="flex items-center gap-1 text-white">
              <button
                type="button"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center"
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? "❚❚" : "▶"}
              </button>
              <button
                type="button"
                className="min-w-[40px] min-h-[40px] text-xs font-semibold"
                onClick={() => skip(-10)}
              >
                −10
              </button>
              <button
                type="button"
                className="min-w-[40px] min-h-[40px] text-xs font-semibold"
                onClick={() => skip(10)}
              >
                +10
              </button>
              <span className="text-xs tabular-nums px-1 shrink-0">
                {formatTime(current)} / {formatTime(duration)}
              </span>
              <div className="flex-1" />
              <button
                type="button"
                className="min-w-[40px] min-h-[40px] text-sm"
                onClick={() => {
                  const v = videoRef.current;
                  if (!v) return;
                  v.muted = !v.muted;
                  setMuted(v.muted);
                }}
                aria-label="Mute"
              >
                {muted || volume === 0 ? "🔇" : "🔊"}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                className="w-16 accent-primary hidden sm:block"
                onChange={(e) => {
                  const v = videoRef.current;
                  const val = Number(e.target.value);
                  if (v) {
                    v.volume = val;
                    v.muted = val === 0;
                  }
                  setVolume(val);
                  setMuted(val === 0);
                }}
              />
              <div className="relative">
                <button
                  type="button"
                  className="min-w-[40px] min-h-[40px] text-xs font-semibold"
                  onClick={() => setSpeedMenu((s) => !s)}
                >
                  {speed}x
                </button>
                {speedMenu && (
                  <div className="absolute bottom-full right-0 mb-1 rounded-lg bg-black/90 border border-white/10 py-1 min-w-[4.5rem]">
                    {SPEEDS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={cn(
                          "block w-full text-left px-3 py-1.5 text-xs hover:bg-white/10",
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
                className="min-w-[40px] min-h-[40px] text-sm hidden sm:flex items-center justify-center"
                onClick={() => {
                  const v = videoRef.current;
                  if (v && document.pictureInPictureEnabled) {
                    if (document.pictureInPictureElement) {
                      void document.exitPictureInPicture();
                    } else {
                      void v.requestPictureInPicture();
                    }
                  }
                }}
                aria-label="Picture in picture"
              >
                PiP
              </button>
              <button
                type="button"
                className="min-w-[40px] min-h-[40px] text-sm"
                onClick={() => void toggleFs()}
                aria-label="Fullscreen"
              >
                {isFs ? "⛶" : "⛶"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center px-0">
        <Button
          size="sm"
          variant="outline"
          disabled={downloading || cached || !!error || loading}
          loading={downloading}
          onClick={() => void downloadOffline()}
        >
          {cached
            ? "Downloaded"
            : downloading
              ? `Downloading ${dlProgress}%`
              : "Download for offline"}
        </Button>
      </div>
    </div>
  );
}

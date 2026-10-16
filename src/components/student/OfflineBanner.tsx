"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SESSION_KEY = "eb_offline_banner_dismissed";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const sync = () => {
      const on = typeof navigator !== "undefined" ? navigator.onLine : true;
      setOffline(!on);
      if (!on) {
        try {
          setDismissed(sessionStorage.getItem(SESSION_KEY) === "1");
        } catch {
          setDismissed(false);
        }
      }
    };
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline || dismissed) return null;

  return (
    <div className="sticky top-0 z-40 bg-text-primary text-white px-3 py-2 flex items-center gap-2 text-xs sm:text-sm">
      <span className="flex-1">
        You&apos;re offline. Only downloaded content is available.
      </span>
      <Link
        href="/downloads"
        className="shrink-0 underline font-semibold whitespace-nowrap"
      >
        View Downloads
      </Link>
      <button
        type="button"
        className="shrink-0 min-w-[32px] min-h-[32px] rounded-full bg-white/15"
        aria-label="Dismiss"
        onClick={() => {
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            /* ignore */
          }
          setDismissed(true);
        }}
      >
        ✕
      </button>
    </div>
  );
}

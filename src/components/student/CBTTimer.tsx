"use client";

import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CBTTimerProps {
  secondsLeft: number;
  totalSeconds: number;
}

export default function CBTTimer({ secondsLeft, totalSeconds }: CBTTimerProps) {
  const isLow = secondsLeft <= 60;
  const isCritical = secondsLeft <= 30;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold",
        isCritical
          ? "bg-red-50 text-error"
          : isLow
          ? "bg-amber-50 text-warning"
          : "bg-primary-light text-primary"
      )}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {formatTime(secondsLeft)}
    </div>
  );
}

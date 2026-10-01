"use client";

import Link from "next/link";
import Avatar from "@/components/ui/Avatar";

interface StudentHeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  userName?: string;
  unreadCount?: number;
}

export default function StudentHeader({
  title,
  showBack,
  backHref = "/dashboard",
  userName = "Student",
  unreadCount = 0,
}: StudentHeaderProps) {
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "ST";

  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        {showBack ? (
          <Link
            href={backHref}
            className="text-primary text-sm font-medium min-h-[44px] flex items-center"
          >
            ← Back
          </Link>
        ) : null}
        {title && (
          <h1 className="font-heading font-semibold text-text-primary text-base flex-1 truncate">
            {title}
          </h1>
        )}
        {!title && <div className="flex-1" />}
        <Link href="/notifications" className="relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <svg
            className="w-5 h-5 text-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-error text-white text-[10px] flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/profile" className="min-w-[44px] min-h-[44px] flex items-center justify-center">
          <Avatar initials={initials} size="sm" />
        </Link>
      </div>
    </header>
  );
}

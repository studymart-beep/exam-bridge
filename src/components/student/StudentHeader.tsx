"use client";

import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import {
  useStudentMenu,
  useStudentUser,
} from "@/components/student/StudentMenuContext";

interface StudentHeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  userName?: string;
  avatarUrl?: string | null;
  unreadCount?: number;
  onOpenSidebar?: () => void;
}

export default function StudentHeader({
  title,
  showBack,
  backHref = "/dashboard",
  userName,
  avatarUrl,
  unreadCount = 0,
  onOpenSidebar,
}: StudentHeaderProps) {
  const openFromContext = useStudentMenu();
  const user = useStudentUser();
  const openSidebar = onOpenSidebar ?? openFromContext;

  const name = (userName && userName.trim()) || user.fullName || "Student";
  // Prefer non-empty prop; otherwise fall back to layout context
  const src =
    (avatarUrl && avatarUrl.trim()) || user.avatarUrl || null;

  const initials =
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST";

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-2">
        <button
          type="button"
          onClick={() => openSidebar?.()}
          className="lg:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-surface/80 border border-border text-text-primary hover:bg-primary-light hover:text-primary shadow-soft"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {showBack ? (
          <Link
            href={backHref}
            className="text-primary text-sm font-semibold min-h-[44px] flex items-center"
          >
            ← Back
          </Link>
        ) : null}
        {title ? (
          <h1 className="font-heading font-extrabold text-text-primary text-lg flex-1 truncate">
            {title}
          </h1>
        ) : (
          <div className="flex-1" />
        )}
        <Link
          href="/notifications"
          className="relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
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
            <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-coral text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <Link
          href="/profile"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Profile"
        >
          <Avatar initials={initials} src={src} size="sm" />
        </Link>
      </div>
    </header>
  );
}

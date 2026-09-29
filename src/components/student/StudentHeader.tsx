"use client";

import Link from "next/link";
import { currentUser } from "@/lib/mock/user";
import { notifications } from "@/lib/mock/notifications";
import Avatar from "@/components/ui/Avatar";

interface StudentHeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export default function StudentHeader({
  title,
  showBack = false,
  backHref = "/dashboard",
}: StudentHeaderProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link
              href={backHref}
              className="p-1.5 -ml-1.5 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          {title && (
            <h1 className="text-lg font-heading font-semibold text-text-primary">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="relative p-2 rounded-xl text-text-secondary hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link href="/profile" className="hidden sm:block">
            <Avatar initials={currentUser.initials} size="sm" />
          </Link>
        </div>
      </div>
    </header>
  );
}

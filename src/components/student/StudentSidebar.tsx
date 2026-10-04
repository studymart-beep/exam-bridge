"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "@/components/brand/Logo";

interface StudentSidebarProps {
  open?: boolean;
  onClose?: () => void;
  userName?: string;
}

const mainNav = [
  { href: "/dashboard", label: "Home" },
  { href: "/subjects", label: "Subjects" },
  { href: "/cbt", label: "CBT" },
  { href: "/progress", label: "Progress" },
  { href: "/results", label: "Results" },
  { href: "/profile", label: "Profile" },
];

const secondaryNav = [
  { href: "/notifications", label: "Notifications" },
  { href: "/settings", label: "Settings" },
  { href: "/subscribe", label: "Subscribe" },
];

export default function StudentSidebar({
  open = false,
  onClose,
  userName = "Student",
}: StudentSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-text-primary/40 transition-opacity duration-200 lg:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-[80%] max-w-[320px] lg:w-64 bg-surface border-r border-border flex flex-col transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-4 border-b border-border flex items-center justify-between gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0" onClick={onClose}>
            <Logo size={28} />
            <div className="min-w-0">
              <p className="font-heading font-bold text-primary text-sm leading-tight">
                Exam Bridge
              </p>
              <p className="text-xs text-text-muted truncate">{userName}</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-text-secondary hover:bg-primary-light hover:text-primary"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Menu
            </p>
            <ul className="space-y-0.5">
              {mainNav.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center",
                        active
                          ? "bg-primary-light text-primary"
                          : "text-text-secondary hover:bg-accent-light/70 hover:text-primary"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Account
            </p>
            <ul className="space-y-0.5">
              {secondaryNav.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center",
                        active
                          ? "bg-primary-light text-primary"
                          : "text-text-secondary hover:bg-accent-light/70 hover:text-primary"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}

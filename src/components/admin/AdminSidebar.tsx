"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "@/components/brand/Logo";
import Avatar from "@/components/ui/Avatar";

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
  userName?: string;
  avatarUrl?: string | null;
}

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/reports", label: "Reports" },
    ],
  },
  {
    label: "Users",
    items: [
      { href: "/admin/users", label: "Students" },
      { href: "/admin/subscriptions", label: "Subscriptions" },
      { href: "/admin/payments", label: "Payments" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/subjects", label: "Subjects" },
      { href: "/admin/cbt", label: "CBT Exams" },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/admin/notifications", label: "Notifications" },
      { href: "/admin/announcements", label: "Announcements" },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/admin/profile", label: "Profile" }],
  },
];

export default function AdminSidebar({
  open = false,
  onClose,
  userName = "Admin",
  avatarUrl = null,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const initials =
    userName
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

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
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 min-w-0"
            onClick={onClose}
          >
            <Logo size={40} />
            <div className="min-w-0">
              <p className="font-heading font-bold text-primary text-sm leading-tight truncate">
                Exam Bridge
              </p>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">
                Admin
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-text-secondary hover:bg-primary-light hover:text-primary"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
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
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <Link
            href="/admin/profile"
            onClick={onClose}
            className="flex items-center gap-3 min-h-[52px] px-2 rounded-xl hover:bg-primary-light/50"
          >
            <Avatar initials={initials} src={avatarUrl} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {userName}
              </p>
              <p className="text-xs text-text-muted">View profile</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

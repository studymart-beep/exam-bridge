"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "@/components/brand/Logo";

const nav = [
  { href: "/dashboard", label: "Home" },
  { href: "/subjects", label: "Subjects" },
  { href: "/cbt", label: "CBT" },
  { href: "/results", label: "Results" },
  { href: "/progress", label: "Progress" },
  { href: "/notifications", label: "Notifications" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export default function StudentSidebar({
  open,
  onClose,
  userName = "Student",
}: {
  open?: boolean;
  onClose?: () => void;
  userName?: string;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-text-primary/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-surface border-r border-border flex flex-col transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-5 border-b border-border flex items-center gap-2">
          <Logo size={28} />
          <div className="min-w-0">
            <p className="font-heading font-bold text-primary text-sm leading-tight">
              Exam Bridge
            </p>
            <p className="text-xs text-text-muted truncate">{userName}</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-light text-primary"
                    : "text-text-secondary hover:bg-accent-light/60 hover:text-primary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Link
            href="/subscribe"
            className="block text-center text-sm font-semibold text-accent-dark bg-accent-light py-2.5 rounded-lg hover:bg-secondary transition-colors"
            onClick={onClose}
          >
            Subscribe
          </Link>
        </div>
      </aside>
    </>
  );
}

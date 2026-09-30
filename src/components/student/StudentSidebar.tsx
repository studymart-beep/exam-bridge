"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-100 flex flex-col transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-5 border-b border-gray-100">
          <p className="font-heading font-bold text-primary text-lg">Exam Bridge</p>
          <p className="text-xs text-text-muted mt-1 truncate">{userName}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-light text-primary"
                    : "text-text-secondary hover:bg-gray-50"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <Link
            href="/subscribe"
            className="block text-center text-sm font-semibold text-accent py-2"
            onClick={onClose}
          >
            Subscribe
          </Link>
        </div>
      </aside>
    </>
  );
}

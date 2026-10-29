"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "@/components/brand/Logo";
import Avatar from "@/components/ui/Avatar";

interface StudentSidebarProps {
  open?: boolean;
  onClose?: () => void;
  userName?: string;
  avatarUrl?: string | null;
  isSubscribed?: boolean;
}

const mainNav = [
  { href: "/dashboard", label: "Home", icon: "M3 12l9-9 9 9M5 10v10h14V10" },
  { href: "/subjects", label: "Subjects", icon: "M4 6h16M4 12h16M4 18h10" },
  { href: "/cbt", label: "CBT", icon: "M4 5h16v11H4zM9 21h6M12 16v5" },
  { href: "/downloads", label: "Downloads", icon: "M12 4v10m0 0l-4-4m4 4l4-4M5 19h14" },
  { href: "/progress", label: "Progress", icon: "M4 19V9m5 10V5m5 14v-7m5 7V8" },
  { href: "/results", label: "Results", icon: "M9 11l3 3 8-8M20 12v7H4V5h11" },
  { href: "/profile", label: "Profile", icon: "M16 17l-4-3-4 3M12 3a4 4 0 100 8 4 4 0 000-8z" },
];

const secondaryNavBase = [
  { href: "/notifications", label: "Notifications", icon: "M15 17h5l-1.4-1.4A2 2 0 0118 14V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3A6 6 0 006 11v3c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
];

export default function StudentSidebar({
  open = false,
  onClose,
  userName = "Student",
  avatarUrl = null,
  isSubscribed = false,
}: StudentSidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const initials =
    userName
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST";

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
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-[80%] max-w-[320px] lg:w-64",
          "bg-sidebar-deep text-white flex flex-col transition-transform duration-200 ease-out",
          "border-r border-white/10",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand — raw circular logo, no tile, no shadow */}
        <div className="px-4 pt-5 pb-4 flex items-start justify-between gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 min-w-0"
            onClick={onClose}
          >
            <Logo size={38} />
            <span className="min-w-0">
              <span className="block font-heading font-bold text-[15px] leading-tight text-white truncate">
                ExamBridge
              </span>
              <span className="block text-[9.5px] uppercase tracking-[0.14em] text-[#A7F3D0] mt-0.5 truncate">
                Learn · Prepare · Succeed
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white"
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

        <nav className="flex-1 overflow-y-auto px-3 pb-2 space-y-1 scrollbar-hide">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 min-h-[42px] px-3.5 rounded-xl text-[13.5px] font-medium transition-colors",
                isActive(item.href)
                  ? "bg-[#135843] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "text-[#9DBBAE] hover:bg-white/5 hover:text-white"
              )}
            >
              <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
          <div className="pt-2 mt-2 border-t border-white/10 space-y-1">
            {(isSubscribed
              ? secondaryNavBase
              : [
                  ...secondaryNavBase,
                  { href: "/subscribe", label: "Subscribe", icon: "M12 3v18M5 8l7-5 7 5" },
                ]
            ).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 min-h-[42px] px-3.5 rounded-xl text-[13.5px] font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-[#135843] text-white"
                    : "text-[#9DBBAE] hover:bg-white/5 hover:text-white"
                )}
              >
                <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Script accent from the reference */}
        <div className="px-5 pt-3 pb-1 select-none" aria-hidden>
          <p className="script-note text-[21px] text-white -rotate-[7deg]">
            Your Future Starts Here
          </p>
          <span className="script-underline" />
        </div>

        <div className="p-3 border-t border-white/10">
          <Link
            href="/profile"
            onClick={onClose}
            className="flex items-center gap-3 min-h-[52px] px-2 rounded-xl hover:bg-white/10"
          >
            <Avatar initials={initials} src={avatarUrl} size="md" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">
                {userName}
              </p>
              <p className="text-[11px] text-[#9DBBAE]">View profile</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

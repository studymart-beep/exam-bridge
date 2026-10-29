"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard", label: "Home" },
  { href: "/subjects", label: "Subjects" },
  { href: "/cbt", label: "CBT" },
  { href: "/results", label: "Results" },
  { href: "/profile", label: "Profile" },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur border-t border-border safe-bottom shadow-[0_-6px_20px_rgba(11,66,50,0.10)]">
      <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center text-[10.5px] font-semibold gap-0.5 min-h-[44px]",
                active ? "text-primary" : "text-text-muted"
              )}
            >
              <span
                className={cn(
                  "w-5 h-[3px] rounded-full mb-1 transition-all",
                  active ? "bg-secondary" : "bg-transparent"
                )}
              />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

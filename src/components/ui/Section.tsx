import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tint = "default" | "green" | "gold" | "blue";

export default function Section({
  title,
  children,
  className,
  tint = "default",
  action,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  tint?: Tint;
  action?: ReactNode;
}) {
  const tintClass =
    tint === "green"
      ? "section-shell-green"
      : tint === "gold"
        ? "section-shell-gold"
        : tint === "blue"
          ? "section-shell-blue"
          : "";

  return (
    <section
      className={cn("section-shell space-y-3", tintClass, className)}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3">
          {title ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-1 h-5 rounded-full bg-secondary shrink-0"
                aria-hidden
              />
              <h2 className="font-heading font-bold text-base sm:text-lg text-text-primary truncate">
                {title}
              </h2>
            </div>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

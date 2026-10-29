import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tint = "default" | "green" | "gold" | "blue";

/**
 * Section shell from the reference: rounded panel, optional gold title bar
 * (as used before "Subjects"), soft translucent fill and green-tinted shadow.
 */
export default function Section({
  title,
  subtitle,
  children,
  className,
  tint = "default",
  action,
  goldBar = false,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  tint?: Tint;
  action?: ReactNode;
  /** Render the vertical gold bar to the left of the title */
  goldBar?: boolean;
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
    <section className={cn("section-shell space-y-3", tintClass, className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3">
          {title ? (
            <div className="flex items-start gap-2.5 min-w-0">
              {goldBar && <span className="title-bar mt-0.5" aria-hidden />}
              <div className="min-w-0">
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-text-primary leading-tight truncate">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs sm:text-[13px] text-text-secondary mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
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

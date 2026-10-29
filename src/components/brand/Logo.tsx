import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  withWordmark?: boolean;
  /** @deprecated use withWordmark */
  showWordmark?: boolean;
  variant?: "icon" | "full";
}

/**
 * Official Exam Bridge mark — the raw circular logo only.
 * No background box, tile, border, shadow or container: the asset itself is a
 * circle on a transparent canvas (see scripts/gen-brand-assets.py).
 */
export default function Logo({
  size = 32,
  className,
  withWordmark = false,
  showWordmark = false,
  variant = "icon",
}: LogoProps) {
  const wordmark = withWordmark || showWordmark || variant === "full";

  return (
    <span className={cn("inline-flex items-center gap-2 shrink-0", className)}>
      <Image
        src="/logo.png"
        alt={wordmark ? "Exam Bridge" : ""}
        width={size}
        height={size}
        className="rounded-full bg-transparent shadow-none"
        priority={size >= 40}
      />
      {wordmark && (
        <span className="font-heading font-bold text-primary tracking-tight leading-none text-[1.05em]">
          Exam Bridge
        </span>
      )}
    </span>
  );
}

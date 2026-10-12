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

/** Official Exam Bridge mark (recolored logo asset) */
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
        className="object-contain"
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

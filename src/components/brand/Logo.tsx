import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

/** Open book with bridge arch — brand mark */
export default function Logo({
  size = 32,
  className,
  showWordmark = false,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden={!showWordmark}
        role={showWordmark ? "img" : undefined}
      >
        {showWordmark ? <title>Exam Bridge</title> : null}
        {/* Bridge arch */}
        <path
          d="M12 28 C12 16, 52 16, 52 28"
          stroke="#EAB308"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Bridge posts */}
        <path
          d="M18 28 V34 M32 22 V34 M46 28 V34"
          stroke="#CA8A04"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Book base */}
        <path
          d="M8 36 C8 36, 32 32, 32 36 C32 32, 56 36, 56 36 L56 52 C56 52, 32 48, 32 52 C32 48, 8 52, 8 52 Z"
          fill="#166534"
        />
        {/* Book spine highlight */}
        <path
          d="M32 36 V52"
          stroke="#14532D"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Page lines (left) */}
        <path
          d="M14 42 H28 M14 46 H26"
          stroke="#DCFCE7"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* Page lines (right) */}
        <path
          d="M36 42 H50 M38 46 H50"
          stroke="#DCFCE7"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* Gold bookmark */}
        <path d="M30 36 L32 40 L34 36 Z" fill="#EAB308" />
      </svg>
      {showWordmark && (
        <span className="font-heading font-bold text-primary tracking-tight">
          Exam Bridge
        </span>
      )}
    </span>
  );
}

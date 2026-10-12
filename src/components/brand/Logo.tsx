import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  withWordmark?: boolean;
  /** @deprecated use withWordmark */
  showWordmark?: boolean;
  variant?: "full" | "icon";
}

/** Premium 3D open-book + bridge arch mark */
export default function Logo({
  size = 32,
  className,
  withWordmark = false,
  showWordmark = false,
  variant = "full",
}: LogoProps) {
  const wordmark = withWordmark || showWordmark;
  const isIcon = variant === "icon";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden={!wordmark}
        role={wordmark ? "img" : undefined}
      >
        {wordmark ? <title>Exam Bridge</title> : null}
        <defs>
          <linearGradient id="eb-book" x1="0" y1="0" x2="64" y2="64">
            <stop stopColor="#1A7A3C" />
            <stop offset="1" stopColor="#14532D" />
          </linearGradient>
          <linearGradient id="eb-bridge" x1="0" y1="0" x2="64" y2="0">
            <stop stopColor="#FACC15" />
            <stop offset="1" stopColor="#CA8A04" />
          </linearGradient>
          <linearGradient id="eb-page" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#DCFCE7" />
            <stop offset="1" stopColor="#BBF7D0" />
          </linearGradient>
          <filter id="eb-sh" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="1.5"
              stdDeviation="1.2"
              floodColor="#052E16"
              floodOpacity="0.35"
            />
          </filter>
        </defs>
        {/* Bridge arch */}
        <path
          d="M12 28 C12 14, 52 14, 52 28"
          stroke="url(#eb-bridge)"
          strokeWidth={isIcon ? 3.5 : 3.2}
          strokeLinecap="round"
          fill="none"
          filter="url(#eb-sh)"
        />
        {/* Posts */}
        <path
          d="M18 28 V35 M32 18 V35 M46 28 V35"
          stroke="#CA8A04"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M14 35 H50"
          stroke="#EAB308"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Book */}
        <path
          d="M8 37 C8 37, 32 32, 32 37 C32 32, 56 37, 56 37 L56 54 C56 54, 32 49, 32 54 C32 49, 8 54, 8 54 Z"
          fill="url(#eb-book)"
          filter="url(#eb-sh)"
        />
        <path d="M32 37 V54" stroke="#0A3D1C" strokeWidth="2" strokeLinecap="round" />
        {!isIcon && (
          <>
            <path
              d="M12 41 C12 41, 30 38, 31 41 L31 49 C31 49, 12 52, 12 49 Z"
              fill="url(#eb-page)"
              opacity="0.95"
            />
            <path
              d="M33 41 C33 38, 52 41, 52 41 L52 49 C52 52, 33 49, 33 49 Z"
              fill="url(#eb-page)"
              opacity="0.9"
            />
          </>
        )}
        <path d="M30 37 L32 42 L34 37 Z" fill="#FACC15" />
      </svg>
      {wordmark && (
        <span className="font-heading font-bold text-primary tracking-tight leading-none">
          Exam Bridge
        </span>
      )}
    </span>
  );
}

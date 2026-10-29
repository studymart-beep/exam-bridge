import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "error";
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  size = "md",
  color = "primary",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const heights = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-2.5",
  };

  const colors = {
    primary: "bg-gradient-to-r from-primary/80 to-primary",
    success: "bg-gradient-to-r from-[#34D399] to-success",
    warning: "bg-gradient-to-r from-amber-300 to-warning",
    error: "bg-gradient-to-r from-[#FF8A93] to-error",
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full bg-primary-light/80 rounded-full overflow-hidden",
          heights[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colors[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-text-secondary text-right">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
}

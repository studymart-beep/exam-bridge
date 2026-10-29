import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "error" | "warning" | "info" | "primary";
  size?: "sm" | "md";
}

export default function Badge({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-primary-light text-primary",
    success: "bg-[#DFF7EA] text-[#0E744E]",
    error: "bg-coral-light text-coral-dark",
    warning: "bg-accent-light text-accent-dark",
    info: "bg-calm-light text-calm-dark",
    primary: "bg-primary text-white",
  };
  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-bold",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
}

/**
 * Reference styling: 12px radius, emerald fill, white 700 label, soft
 * green-tinted shadow, no border.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-heading font-bold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] no-tap";

    const variants = {
      primary:
        "bg-primary text-white hover:bg-primary-hover shadow-[0_3px_10px_rgba(5,101,65,0.18)] hover:shadow-[0_6px_18px_-4px_rgba(5,101,65,0.3)]",
      secondary:
        "bg-secondary text-primary-dark hover:bg-accent shadow-soft font-bold",
      ghost:
        "bg-transparent text-text-secondary hover:bg-primary-light hover:text-primary",
      danger: "bg-coral text-white hover:bg-coral-dark shadow-soft",
      outline:
        "bg-surface text-primary border border-primary/40 hover:bg-primary-light hover:border-primary",
    };

    const sizes = {
      sm: "min-h-9 h-9 px-3.5 text-[13px]",
      md: "min-h-11 h-11 px-5 text-sm",
      lg: "min-h-12 h-12 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;

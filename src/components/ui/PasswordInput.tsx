"use client";

import { useState, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  helperText?: string;
  error?: string;
}

/**
 * Password field with show / hide toggle (eye button).
 */
export default function PasswordInput({
  className,
  label,
  helperText,
  error,
  id,
  name = "password",
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-") || name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          className={cn(
            "w-full min-h-11 h-11 pl-4 pr-12 rounded-lg border bg-surface text-text-primary placeholder:text-text-muted text-base sm:text-sm",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "transition-all duration-200",
            error
              ? "border-error focus:ring-error"
              : "border-border hover:border-accent",
            className
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 min-h-9 min-w-9 px-2 rounded-md text-text-muted hover:text-text-primary hover:bg-primary-light/50 text-xs font-medium"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-text-muted">{helperText}</p>
      )}
    </div>
  );
}

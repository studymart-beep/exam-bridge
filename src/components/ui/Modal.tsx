"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import Button from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  fullScreenOnMobile?: boolean;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  fullScreenOnMobile = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-text-primary/40 p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          "bg-surface shadow-elevated flex flex-col w-full",
          fullScreenOnMobile
            ? "h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-2xl border-0 sm:border sm:border-border"
            : "max-h-[90vh] rounded-2xl border border-border m-4",
          sizes[size],
          "sm:mx-auto"
        )}
      >
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-surface shrink-0">
            <h2 className="font-heading font-semibold text-text-primary text-base truncate">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-text-muted hover:bg-primary-light hover:text-primary"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer && (
          <div className="sticky bottom-0 border-t border-border px-4 py-3 bg-surface shrink-0 flex flex-col sm:flex-row gap-2 sm:justify-end">
            {footer}
          </div>
        )}
        {!footer && !title && (
          <div className="absolute top-2 right-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

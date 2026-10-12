"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  /** Soft interchangeable tint for grids */
  tint?: "white" | "mist" | "gold" | "cream" | "blue";
}

const tintClass: Record<NonNullable<CardProps["tint"]>, string> = {
  white: "bg-surface",
  mist: "bg-mist",
  gold: "bg-accent-light",
  cream: "bg-cream",
  blue: "bg-calm-light",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = "md", tint = "white", children, ...props }, ref) => {
    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-4 sm:p-5",
      lg: "p-6",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-border/80 shadow-soft",
          tintClass[tint],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
export default Card;

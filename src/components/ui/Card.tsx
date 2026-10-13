"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export type CardTint = "green" | "gold" | "blue" | "white" | "cream";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  /** Soft interchangeable tint — rotate in grids so adjacent differ */
  tint?: CardTint;
  /** Pass list index to auto-pick green/gold/blue (never adjacent same) */
  tintIndex?: number;
}

const tintClass: Record<CardTint, string> = {
  white: "bg-surface border-border/80",
  cream: "bg-cream border-border/80",
  green: "bg-primary-light border-border-green",
  gold: "bg-accent-light border-border",
  blue: "bg-calm-light border-border-blue",
};

const rotate: CardTint[] = ["green", "gold", "blue"];

export function cardTintForIndex(index: number): CardTint {
  return rotate[((index % 3) + 3) % 3];
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className, padding = "md", tint, tintIndex, children, ...props },
    ref
  ) => {
    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-4 sm:p-5",
      lg: "p-6",
    };

    const resolved: CardTint =
      tint ??
      (typeof tintIndex === "number" ? cardTintForIndex(tintIndex) : "green");

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border shadow-soft text-text-primary",
          tintClass[resolved],
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

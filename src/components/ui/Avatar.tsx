"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  src?: string | null;
}

export default function Avatar({
  initials,
  size = "md",
  className,
  src,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImg = Boolean(src && src.trim()) && !failed;

  if (showImg) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src!}
        alt={initials}
        onError={() => setFailed(true)}
        className={cn(
          "rounded-full object-cover bg-primary-light shrink-0",
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary text-white font-semibold flex items-center justify-center shrink-0",
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
}

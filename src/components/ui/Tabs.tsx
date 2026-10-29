"use client";

import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  /** Optional count badge, e.g. number of subjects/exams */
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  /** Pill "segmented" look from the reference design */
  segmented?: boolean;
}

export default function Tabs({
  tabs,
  activeId,
  onChange,
  className,
  segmented = false,
}: TabsProps) {
  if (segmented) {
    return (
      <div className={cn("segmented", className)} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeId === tab.id}
            data-active={activeId === tab.id}
            onClick={() => onChange(tab.id)}
            className="segmented-item"
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span
                className={cn(
                  "ml-1.5 text-[11px] font-bold",
                  activeId === tab.id ? "text-white/80" : "text-text-muted"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-1 p-1 bg-surface border border-border rounded-2xl overflow-x-auto shadow-soft",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-150",
            activeId === tab.id
              ? "bg-primary text-white shadow-soft"
              : "text-text-secondary hover:text-text-primary hover:bg-primary-light"
          )}
        >
          {tab.label}
          {typeof tab.count === "number" && (
            <span className="ml-1.5 text-[11px] font-bold opacity-75">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

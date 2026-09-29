"use client";

import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeId, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150",
            activeId === tab.id
              ? "bg-white text-text-primary shadow-soft"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

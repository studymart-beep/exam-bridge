import type { AdminActivityItem } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  items: AdminActivityItem[];
}

const typeStyles: Record<
  AdminActivityItem["type"],
  { bg: string; icon: React.ReactNode }
> = {
  user: {
    bg: "bg-primary-light",
    icon: (
      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  payment: {
    bg: "bg-green-50",
    icon: (
      <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  exam: {
    bg: "bg-amber-50",
    icon: (
      <svg className="w-4 h-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  subscription: {
    bg: "bg-purple-50",
    icon: (
      <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  content: {
    bg: "bg-primary-light",
    icon: (
      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
};

export default function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const style = typeStyles[item.type];
        return (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary-light/40 transition-colors"
          >
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                style.bg
              )}
            >
              {style.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary">{item.title}</p>
              <p className="text-xs text-text-secondary mt-0.5 truncate">
                {item.subtitle}
              </p>
            </div>
            <p className="text-[11px] text-text-muted flex-shrink-0 whitespace-nowrap">
              {formatDateTime(item.createdAt)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

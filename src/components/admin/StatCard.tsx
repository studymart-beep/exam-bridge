import { cn } from "@/lib/utils";
import Card from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  iconBg?: string;
  className?: string;
}

export default function StatCard({
  label,
  value,
  change,
  icon,
  iconBg = "bg-primary-light",
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-heading font-bold text-text-primary truncate">
            {value}
          </p>
          {change !== undefined && (
            <p
              className={cn(
                "mt-1.5 text-xs font-medium flex items-center gap-0.5",
                isPositive ? "text-success" : "text-error"
              )}
            >
              <svg
                className={cn("w-3.5 h-3.5", !isPositive && "rotate-180")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {Math.abs(change)}% vs last month
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
            iconBg
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

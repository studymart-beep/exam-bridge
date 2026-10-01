"use client";

import { cn } from "@/lib/utils";
import Card from "@/components/ui/Card";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  className?: string;
  /** Optional custom mobile card; default uses first columns */
  renderCard?: (row: T) => React.ReactNode;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data found",
  className,
  renderCard,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-text-muted">{emptyMessage}</div>
    );
  }

  const previewCols = columns.slice(0, 4);

  return (
    <div className={cn(className)}>
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {data.map((row) => (
          <Card key={keyExtractor(row)} className="space-y-2">
            {renderCard
              ? renderCard(row)
              : previewCols.map((col) => (
                  <div key={col.key} className="flex justify-between gap-2 text-sm">
                    <span className="text-text-muted shrink-0">{col.header}</span>
                    <span className="text-text-primary text-right font-medium truncate">
                      {col.render(row)}
                    </span>
                  </div>
                ))}
          </Card>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-border bg-surface shadow-soft">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-primary-light/50 border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-primary",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="hover:bg-accent-light/40 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-4 py-3.5 text-sm text-text-primary", col.className)}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

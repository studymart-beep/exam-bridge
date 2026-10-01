"use client";

import type { ReactNode } from "react";
import Card from "@/components/ui/Card";

export type ResponsiveColumn<T> = {
  key: string;
  label: string;
  className?: string;
  render: (row: T) => ReactNode;
};

interface ResponsiveTableProps<T> {
  columns: ResponsiveColumn<T>[];
  rows: T[];
  renderCard: (row: T) => ReactNode;
  emptyMessage?: string;
  keyFn?: (row: T) => string;
}

export default function ResponsiveTable<T>({
  columns,
  rows,
  renderCard,
  emptyMessage = "Nothing here yet.",
  keyFn,
}: ResponsiveTableProps<T>) {
  if (!rows.length) {
    return (
      <Card className="text-center py-10">
        <p className="text-sm text-text-muted">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <>
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {rows.map((row, i) => (
          <div key={keyFn ? keyFn(row) : String(i)}>{renderCard(row)}</div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-border bg-surface shadow-soft">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-primary-light/60 border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold text-text-primary ${col.className || ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={keyFn ? keyFn(row) : String(i)}
                className="border-b border-border/60 last:border-0 hover:bg-accent-light/30"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 ${col.className || ""}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

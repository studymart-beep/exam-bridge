"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type PickerSubject = {
  id: string;
  name: string;
  letter: string;
  slug: string;
};

interface Props {
  subjects: PickerSubject[];
  value?: string[];
  onChange: (ids: string[]) => void;
  /** name attribute is unused (chips are buttons); kept for form parity */
  error?: string | null;
  columns?: 2 | 3 | 4;
}

/**
 * Multi-select subject picker (registration + profile).
 * Reference styling: rounded chip, mint when idle, emerald when chosen.
 */
export default function SubjectPicker({
  subjects,
  value = [],
  onChange,
  error,
  columns = 2,
}: Props) {
  const [query, setQuery] = useState("");
  const selected = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter((s) => s.name.toLowerCase().includes(q));
  }, [subjects, query]);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(subjects.filter((s) => next.has(s.id)).map((s) => s.id));
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-sm font-medium text-text-primary">
          Your subjects{" "}
          <span className="text-error">*</span>{" "}
          <span className="text-text-muted font-normal">
            ({value.length} selected)
          </span>
        </p>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {subjects.length > 8 && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search subjects…"
          className="w-full h-10 mb-2.5 px-3.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
          aria-label="Search subjects"
        />
      )}

      <div
        className={cn(
          "grid gap-2 max-h-56 overflow-y-auto p-1 rounded-2xl border bg-primary-light/25 border-border",
          columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
        )}
      >
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-xs text-text-muted py-6">
            No subjects match “{query}”.
          </p>
        )}
        {filtered.map((s) => {
          const on = selected.has(s.id);
          return (
            <button
              key={s.id}
              type="button"
              data-checked={on}
              aria-pressed={on}
              onClick={() => toggle(s.id)}
              className="chip-check justify-start"
            >
              <span
                className={cn(
                  "w-6 h-6 rounded-full grid place-items-center text-[11px] font-extrabold shrink-0",
                  on ? "bg-white/25 text-white" : "bg-primary-light text-primary"
                )}
              >
                {s.letter}
              </span>
              <span className="truncate">{s.name}</span>
              {on && <span className="ml-auto shrink-0">✓</span>}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-error">{error}</p>
      ) : (
        <p className="mt-1.5 text-xs text-text-muted">
          Pick the subjects you are studying. You can change these later in
          Profile.
        </p>
      )}
    </div>
  );
}

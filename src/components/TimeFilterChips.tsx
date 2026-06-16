"use client";

import { TIME_FILTERS, type TimeFilter } from "@/lib/timeFilter";

export function TimeFilterChips({
  value,
  onChange,
}: {
  value: TimeFilter;
  onChange: (v: TimeFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TIME_FILTERS.map((f) => {
        const active = f.id === value;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            aria-pressed={active}
            className={
              "rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-wide transition-colors " +
              (active
                ? "bg-blue text-white"
                : "border border-line bg-card text-blue hover:border-blue")
            }
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

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
    <div className="flex gap-2">
      {TIME_FILTERS.map((f) => {
        const active = f.id === value;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            aria-pressed={active}
            className={
              "min-h-[44px] flex-1 rounded-full px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors sm:flex-initial sm:px-4 " +
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

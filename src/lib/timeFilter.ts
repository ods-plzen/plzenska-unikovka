import type { Closure } from "@/lib/types";

export type TimeFilter = "now" | "week" | "month";

const HORIZON: Record<TimeFilter, number> = { now: 0, week: 7, month: 30 };

export const TIME_FILTERS: { id: TimeFilter; label: string }[] = [
  { id: "now", label: "Teď" },
  { id: "week", label: "Tento týden" },
  { id: "month", label: "Tento měsíc" },
];

export function isInFilter(
  c: Closure,
  filter: TimeFilter,
  today: Date = new Date(),
): boolean {
  if (!c.od) return filter === "now"; // bez dat → fallback do "now"
  const start = new Date(c.od);
  const end = c.do ? new Date(c.do) : null;
  const todayD = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const cutoff = new Date(todayD);
  cutoff.setDate(cutoff.getDate() + HORIZON[filter]);
  const startsByCutoff = start <= cutoff;
  const stillActive = !end || end >= todayD;
  return startsByCutoff && stillActive;
}

export function parseFilter(v: string | null | undefined): TimeFilter {
  return v === "week" || v === "month" ? v : "now";
}

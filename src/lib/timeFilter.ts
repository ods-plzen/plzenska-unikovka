import type { Closure } from "@/lib/types";

export type TimeFilter = "now" | "week" | "month" | "all";

const HORIZON: Record<Exclude<TimeFilter, "all">, number> = {
  now: 0,
  week: 7,
  month: 30,
};

export const TIME_FILTERS: { id: TimeFilter; label: string }[] = [
  { id: "now", label: "Teď" },
  { id: "week", label: "Týden" },
  { id: "month", label: "Měsíc" },
  { id: "all", label: "Vše" },
];

export function isInFilter(
  c: Closure,
  filter: TimeFilter,
  today: Date = new Date(),
): boolean {
  if (filter === "all") return true;
  // Plánované projekty bez konkrétního data startu (např. Masarykova
  // z plzen.eu = "termín bude oznámen") nemají co dělat v "teď / týden /
  // měsíc" — vidí je jen filter "Vše".
  if (c.status === "plan" && !c.od) return false;
  if (!c.od) return filter === "now";
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
  return v === "week" || v === "month" || v === "all" ? v : "now";
}

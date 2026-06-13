import type { Area } from "@/lib/types";

// Celá Plzeň + 10 městských obvodů.
export const AREAS: Area[] = [
  { id: "all", label: "Celá Plzeň", short: "Celá Plzeň" },
  { id: "Plzeň 1", label: "Plzeň 1 — Bolevec, Lochotín", short: "Plzeň 1" },
  { id: "Plzeň 2", label: "Plzeň 2 — Slovany, Východní Předměstí", short: "Plzeň 2" },
  { id: "Plzeň 3", label: "Plzeň 3 — Bory, Jižní Předměstí, Skvrňany", short: "Plzeň 3" },
  { id: "Plzeň 4", label: "Plzeň 4 — Doubravka, Lobzy, Újezd", short: "Plzeň 4" },
  { id: "Plzeň 5", label: "Plzeň 5 — Křimice", short: "Plzeň 5" },
  { id: "Plzeň 6", label: "Plzeň 6 — Litice", short: "Plzeň 6" },
  { id: "Plzeň 7", label: "Plzeň 7 — Radčice", short: "Plzeň 7" },
  { id: "Plzeň 8", label: "Plzeň 8 — Černice", short: "Plzeň 8" },
  { id: "Plzeň 9", label: "Plzeň 9 — Malesice", short: "Plzeň 9" },
  { id: "Plzeň 10", label: "Plzeň 10 — Lhota", short: "Plzeň 10" },
];

export const DEFAULT_AREA = "all";

// Sedí daný obvod do vybrané oblasti? "all" = vše.
export function inArea(oblast: string | undefined, area: string): boolean {
  if (area === "all") return true;
  return oblast === area;
}

export function areaByeId(id: string): Area | undefined {
  return AREAS.find((a) => a.id === id);
}

import type { Closure } from "@/lib/types";

export type Severity = "major" | "medium" | "minor";

// Hlavní průtahy městem — major i bez explicitní "uzavřená silnice" v textu.
const HLAVNI_TAHY = new Set([
  "Americká", "Klatovská", "Klatovská třída", "Rokycanská", "Domažlická",
  "Karlovarská", "28. října", "Lochotínská", "Masarykova", "Folmavská",
  "Borská", "Tylova", "Jateční", "Mikulášská", "Na Roudné",
]);

export function classifySeverity(c: Closure): Severity {
  const text = `${c.akce} ${c.popis ?? ""}`.toLowerCase();
  const isStateRoute = /\b(i|ii|iii)\s*\/\s*\d+/i.test(text);
  const hasClosure = /\buzavřen|\buzavírk/.test(text);
  const onHlavniTah = HLAVNI_TAHY.has(c.name);
  if (hasClosure && (isStateRoute || onHlavniTah)) return "major";
  if (/jednosměr|kyvadlov|protisměr|omezení|sveden|jeden\s+jízdní/.test(text)) return "medium";
  return "minor";
}

export const SEVERITY_RANK: Record<Severity, number> = {
  major: 0,
  medium: 1,
  minor: 2,
};

import type { Phase } from "@/lib/types";

const MONTHS_CZ_PADEZ = [
  "ledna", "února", "března", "dubna", "května", "června",
  "července", "srpna", "září", "října", "listopadu", "prosince",
] as const;

function parseCzDate(s: string): Date | null {
  const numeric = s.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  if (numeric) {
    const [, d, m, y] = numeric;
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  }
  const slash = s.match(/(\d{1,2})\/(\d{4})/);
  if (slash) {
    const [, m, y] = slash;
    return new Date(parseInt(y), parseInt(m) - 1, 1);
  }
  const word = s.match(/(\d{1,2})\.\s+([a-zěščřžýáíéúůň]+)\s+(\d{4})/i);
  if (word) {
    const [, d, mn, y] = word;
    const idx = MONTHS_CZ_PADEZ.findIndex((m) => m === mn.toLowerCase());
    if (idx >= 0) return new Date(parseInt(y), idx, parseInt(d));
  }
  const yearOnly = s.match(/^(?!.*\d{1,2}\.)(\d{4})$/);
  if (yearOnly) {
    return new Date(parseInt(yearOnly[1]), 0, 1);
  }
  return null;
}

function parseRange(when: string): { start: Date | null; end: Date | null } {
  const cleaned = when.replace(/\s+/g, " ").trim();

  const range = cleaned.match(
    /(\d{1,2}\.\s*\d{1,2}\.\s*\d{4})\s*[–-]\s*(\d{1,2}\.\s*\d{1,2}\.\s*\d{4})/,
  );
  if (range) {
    return { start: parseCzDate(range[1]), end: parseCzDate(range[2]) };
  }

  const od = cleaned.match(/od\s+(.+)/i);
  if (od) {
    return { start: parseCzDate(od[1]), end: null };
  }

  const doMatch = cleaned.match(/do\s+(.+)/i);
  if (doMatch) {
    return { start: null, end: parseCzDate(doMatch[1]) };
  }

  const single = parseCzDate(cleaned);
  if (single) {
    return { start: null, end: single };
  }

  return { start: null, end: null };
}

/**
 * Auto-přepočítá `state` každé fáze podle dnešního data + dat ve `when`.
 * - done:  fáze už skončila (end < today)
 * - now:   today je v rozsahu nebo open-ended s prošlým start
 * - "":    upcoming
 *
 * Pokud `when` nelze parsnout, ponecháme původní state.
 */
export function resolvePhases(phases: Phase[], today: Date = new Date()): Phase[] {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const parsed = phases.map((p) => ({ phase: p, range: parseRange(p[1]) }));

  return parsed.map(({ phase, range }, i) => {
    const [label, when] = phase;
    const start = range.start?.getTime() ?? null;
    const end = range.end?.getTime() ?? null;

    if (start === null && end === null) {
      return phase;
    }

    let state: "done" | "now" | "" = "";

    if (end !== null && end < t) {
      state = "done";
    } else if (start !== null && end !== null && start <= t && t <= end) {
      state = "now";
    } else if (start !== null && end === null) {
      if (start <= t) {
        const laterStarted = parsed
          .slice(i + 1)
          .some((q) => {
            const s = q.range.start?.getTime();
            return s !== undefined && s !== null && s <= t;
          });
        state = laterStarted ? "done" : "now";
      }
    } else if (start === null && end !== null && end >= t) {
      const anyPriorActive = parsed.slice(0, i).some((q) => {
        const ps = q.range.start?.getTime();
        const pe = q.range.end?.getTime();
        if (ps && pe) return ps <= t && t <= pe;
        return false;
      });
      state = anyPriorActive ? "" : "now";
    }

    return [label, when, state] as Phase;
  });
}

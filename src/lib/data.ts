import type { Closure, ClosureExtra, Vote, Community } from "@/lib/types";
import closuresRaw from "@/data/closures.json";
import extrasRaw from "@/data/extras.json";
import votesRaw from "@/data/votes.json";
import communityRaw from "@/data/community.json";

// JSON přichází se širšími typy (string místo union, number[] místo n-tic),
// proto převádíme přes unknown na naše doménové typy.
export const closures = closuresRaw as unknown as Closure[];
export const extras = extrasRaw as unknown as Record<string, ClosureExtra>;
export const votes = votesRaw as unknown as Vote[];
export const community = communityRaw as unknown as Community;

// Editorial overlay (fáze, „co to znamená") se přiloží k naškrábané uzavírce podle id.
export function extraFor(id: string): ClosureExtra | undefined {
  return extras[id];
}

export function closureById(id: string): Closure | undefined {
  return closures.find((c) => c.id === id);
}

// Stabilní pořadí: probíhá → plánováno → hotovo.
const ORDER: Record<string, number> = { now: 0, plan: 1, done: 2 };

export function sortedClosures(list: Closure[]): Closure[] {
  return [...list].sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9));
}

export const STATUS_LABEL: Record<string, string> = {
  now: "Probíhá",
  plan: "Plánováno",
  done: "Hotovo",
};

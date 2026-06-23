import type {
  Closure,
  ClosureExtra,
  MhdInfo,
  RestrictedRoadsSnapshot,
} from "@/lib/types";
import closuresRaw from "@/data/closures.json";
import extrasRaw from "@/data/extras.json";
import pmdpRaw from "@/data/pmdp.json";
import restrictedRoadsRaw from "@/data/restricted-roads.json";
import { getSupabase } from "@/lib/supabase";

// JSON přichází se širšími typy (string místo union, number[] místo n-tic),
// proto převádíme přes unknown na naše doménové typy.
export const closures = closuresRaw as unknown as Closure[];
export const extras = extrasRaw as unknown as Record<string, ClosureExtra>;

interface PmdpSnapshot {
  snapshot: string;
  source: string;
  perClosure: Record<string, MhdInfo & { sourceUrlsAll?: string[] }>;
}

export const pmdp = pmdpRaw as unknown as PmdpSnapshot;
export const restrictedRoads =
  restrictedRoadsRaw as unknown as RestrictedRoadsSnapshot;

// Editorial overlay (fáze, „co to znamená") se přiloží k naškrábané uzavírce podle id.
export function extraFor(id: string): ClosureExtra | undefined {
  return extras[id];
}

// Sjednocené MHD info: PMDP (auto, denní) + extras.mhdInfo (human, override).
// Pravidlo: pokud má extras.mhdInfo neprázdné pole, vyhrává nad PMDP. Jinak se použije PMDP.
export function mhdInfoFor(closureId: string): MhdInfo | undefined {
  const fromPmdp = pmdp?.perClosure?.[closureId];
  const fromExtras = extras[closureId]?.mhdInfo;
  if (!fromPmdp && !fromExtras) return undefined;
  if (!fromPmdp) return fromExtras;
  if (!fromExtras) return fromPmdp;
  return {
    summary: fromExtras.summary ?? fromPmdp.summary,
    reroutes:
      fromExtras.reroutes && fromExtras.reroutes.length > 0
        ? fromExtras.reroutes
        : fromPmdp.reroutes,
    tempStops:
      fromExtras.tempStops && fromExtras.tempStops.length > 0
        ? fromExtras.tempStops
        : fromPmdp.tempStops,
    notes:
      fromExtras.notes && fromExtras.notes.length > 0
        ? fromExtras.notes
        : fromPmdp.notes,
    sourceUrl: fromExtras.sourceUrl ?? fromPmdp.sourceUrl,
    sourceLabel: fromExtras.sourceLabel ?? fromPmdp.sourceLabel,
  };
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

// ─── Supabase live overlay ───────────────────────────────────────────────
//
// extras.json je build-time fallback (vždy commitnut do gitu, deploy ho má).
// getExtra(id) zkusí nejdřív Supabase tabulku closure_extras (live editorial
// updaty bez deploye), pokud selže nebo NULL → spadne na statický extras.json.

export async function getExtra(id: string): Promise<ClosureExtra | undefined> {
  const supabase = getSupabase();
  if (!supabase) return extras[id];
  try {
    const { data, error } = await supabase
      .from("closure_extras")
      .select("payload")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      console.warn("[supabase] getExtra fallback to static:", error.message);
      return extras[id];
    }
    if (data?.payload) return data.payload as ClosureExtra;
  } catch (e) {
    console.warn("[supabase] getExtra threw, fallback:", e);
  }
  return extras[id];
}

export async function getMhdInfo(
  closureId: string,
): Promise<MhdInfo | undefined> {
  const fromPmdp = pmdp?.perClosure?.[closureId];
  const extra = await getExtra(closureId);
  const fromExtras = extra?.mhdInfo;
  if (!fromPmdp && !fromExtras) return undefined;
  if (!fromPmdp) return fromExtras;
  if (!fromExtras) return fromPmdp;
  return {
    summary: fromExtras.summary ?? fromPmdp.summary,
    reroutes:
      fromExtras.reroutes && fromExtras.reroutes.length > 0
        ? fromExtras.reroutes
        : fromPmdp.reroutes,
    tempStops:
      fromExtras.tempStops && fromExtras.tempStops.length > 0
        ? fromExtras.tempStops
        : fromPmdp.tempStops,
    notes:
      fromExtras.notes && fromExtras.notes.length > 0
        ? fromExtras.notes
        : fromPmdp.notes,
    sourceUrl: fromExtras.sourceUrl ?? fromPmdp.sourceUrl,
    sourceLabel: fromExtras.sourceLabel ?? fromPmdp.sourceLabel,
  };
}

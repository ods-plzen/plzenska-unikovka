"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { closures, closureById, restrictedRoads } from "@/lib/data";
import { inArea, areaByeId } from "@/data/areas";
import { useArea } from "@/components/AreaProvider";
import { ClosureMap } from "@/components/map/ClosureMap";
import { ClosurePanel } from "@/components/ClosurePanel";
import { ClosureCard } from "@/components/ClosureCard";
import { TimeFilterChips } from "@/components/TimeFilterChips";
import { isInFilter, parseFilter, type TimeFilter } from "@/lib/timeFilter";
import { SEVERITY_RANK } from "@/lib/severity";

export function MapView() {
  const { area } = useArea();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filter: TimeFilter = parseFilter(params.get("f"));
  const selectedId = params.get("sel") ?? null;
  const selected = selectedId ? closureById(selectedId) : null;
  const areaLabel = areaByeId(area)?.short ?? "Celá Plzeň";

  function pushParams(next: { f?: TimeFilter; sel?: string | null }) {
    const sp = new URLSearchParams(params.toString());
    if (next.f !== undefined) {
      if (next.f === "now") sp.delete("f");
      else sp.set("f", next.f);
    }
    if (next.sel !== undefined) {
      if (next.sel) sp.set("sel", next.sel);
      else sp.delete("sel");
    }
    const q = sp.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  const visible = useMemo(() => {
    return closures.filter(
      (c) => inArea(c.oblast, area) && isInFilter(c, filter),
    );
  }, [area, filter]);

  const top5 = useMemo(() => {
    const ranked = [...visible].sort(
      (a, b) =>
        SEVERITY_RANK[a.severity ?? "minor"] - SEVERITY_RANK[b.severity ?? "minor"],
    );
    return ranked.slice(0, 5);
  }, [visible]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="head text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">
            Co je v Plzni rozkopané
          </h1>
          <p className="text-sm text-muted">
            {areaLabel} · {visible.length}{" "}
            {visible.length === 1 ? "uzavírka" : visible.length < 5 ? "uzavírky" : "uzavírek"}{" "}
            · zdroj SITmP / JSDI ŘSD
          </p>
        </div>
        <TimeFilterChips value={filter} onChange={(f) => pushParams({ f })} />
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="rounded-xl overflow-hidden border border-line">
          <ClosureMap
            closures={visible}
            restrictedRoads={restrictedRoads.roads}
            height={520}
            selectedId={selectedId}
            onSelect={(id) => pushParams({ sel: id })}
          />
        </div>
        {selected ? (
          <ClosurePanel c={selected} onClose={() => pushParams({ sel: null })} />
        ) : (
          <aside className="rounded-xl border border-dashed border-line bg-card p-5 text-sm text-muted">
            Klikni na marker nebo na kartu uzavírky níž — detail se objeví tady.
          </aside>
        )}
      </div>

      <section>
        <h2 className="head mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Co ti zblokuje cestu
        </h2>
        {top5.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line bg-white p-6 text-center text-muted">
            V tomto filtru momentálně nic. 🎉
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {top5.map((c) => (
              <ClosureCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

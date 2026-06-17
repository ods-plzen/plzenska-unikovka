"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { closures, closureById, restrictedRoads } from "@/lib/data";
import { AREAS, inArea, areaByeId } from "@/data/areas";
import { ClosureMap } from "@/components/map/ClosureMap";
import { ClosurePanel } from "@/components/ClosurePanel";
import { ClosureCard } from "@/components/ClosureCard";
import { TimeFilterChips } from "@/components/TimeFilterChips";
import { isInFilter, parseFilter, type TimeFilter } from "@/lib/timeFilter";
import { HLAVNI_TAHY, SEVERITY_RANK } from "@/lib/severity";
import type { Closure } from "@/lib/types";

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;

export function MapView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filter: TimeFilter = parseFilter(params.get("f"));
  const obvodParam = params.get("o");
  const selectedId = params.get("sel") ?? null;
  const selected = selectedId ? closureById(selectedId) : null;
  const areaLabel = obvodParam
    ? (areaByeId(obvodParam)?.short ?? "Celá Plzeň")
    : "Celá Plzeň";

  function pushParams(next: {
    f?: TimeFilter;
    o?: string | null;
    sel?: string | null;
  }) {
    const sp = new URLSearchParams(params.toString());
    if (next.f !== undefined) {
      if (next.f === "now") sp.delete("f");
      else sp.set("f", next.f);
    }
    if (next.o !== undefined) {
      if (next.o) sp.set("o", next.o);
      else sp.delete("o");
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
      (c) =>
        (!obvodParam || inArea(c.oblast, obvodParam)) && isInFilter(c, filter),
    );
  }, [obvodParam, filter]);

  const top5 = useMemo(() => {
    const impact = (c: Closure) =>
      SEVERITY_RANK[c.severity ?? "minor"] * 2 +
      (HLAVNI_TAHY.has(c.name) ? 0 : 1);
    return [...visible]
      .sort((a, b) => {
        const sa = impact(a);
        const sb = impact(b);
        if (sa !== sb) return sa - sb;
        // tie-break: delší trvání = větší dopad
        const aLen =
          a.od && a.do
            ? new Date(a.do).getTime() - new Date(a.od).getTime()
            : 0;
        const bLen =
          b.od && b.do
            ? new Date(b.do).getTime() - new Date(b.od).getTime()
            : 0;
        return bLen - aLen;
      })
      .slice(0, 5);
  }, [visible]);

  const obvody = AREAS.filter((a) => a.id !== "all");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="head text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">
            Co je v Plzni rozkopané
          </h1>
          <p className="text-sm text-muted">
            {areaLabel} · {visible.length}{" "}
            {visible.length === 1
              ? "uzavírka"
              : visible.length < 5
                ? "uzavírky"
                : "uzavírek"}{" "}
            · zdroj SITmP / JSDI ŘSD
          </p>
        </div>
        <TimeFilterChips value={filter} onChange={(f) => pushParams({ f })} />
      </div>

      <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:px-0">
        <ChipBtn
          label="Celá Plzeň"
          active={!obvodParam}
          onClick={() => pushParams({ o: null })}
        />
        {obvody.map((a) => (
          <ChipBtn
            key={a.id}
            label={a.short.replace("Plzeň ", "P")}
            active={a.id === obvodParam}
            onClick={() =>
              pushParams({ o: a.id === obvodParam ? null : a.id })
            }
          />
        ))}
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
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="head text-xs font-semibold uppercase tracking-wide text-blue">
            Co ti zablokuje cestu
          </h2>
          <p className="text-[11px] text-muted">
            Top 5 podle dopadu — úplná uzavírka na hlavním tahu &gt; uzavírka
            na vedlejší &gt; omezení. Při shodě vyhrává delší trvání.
          </p>
        </div>
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

function ChipBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={HEAD_FONT}
      aria-pressed={active}
      className={
        "min-h-[36px] shrink-0 border-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors sm:text-[11px] " +
        (active
          ? "border-ink bg-ink text-paper"
          : "border-ink/25 bg-paper text-ink hover:border-ink")
      }
    >
      {label}
    </button>
  );
}

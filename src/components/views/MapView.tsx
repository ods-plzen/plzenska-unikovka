"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { closures, closureById, restrictedRoads } from "@/lib/data";
import { AREAS, inArea, areaByeId } from "@/data/areas";
import { ClosureMap } from "@/components/map/ClosureMap";
import { ClosurePanel } from "@/components/ClosurePanel";
import { TimeFilterChips } from "@/components/TimeFilterChips";
import { isInFilter, parseFilter, type TimeFilter } from "@/lib/timeFilter";

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

  const obvody = AREAS.filter((a) => a.id !== "all");

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1
          style={HEAD_FONT}
          className="text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl"
        >
          Velká mapa
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

      <div className="flex items-baseline justify-between gap-3 border-t-2 border-ink/15 pt-3">
        <span
          style={HEAD_FONT}
          className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/55 sm:text-[11px]"
        >
          Horizont
        </span>
        <TimeFilterChips value={filter} onChange={(f) => pushParams({ f })} />
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_360px] md:items-start">
        <div className="overflow-hidden rounded-xl border border-line">
          <ClosureMap
            closures={visible}
            restrictedRoads={restrictedRoads.roads}
            height={620}
            selectedId={selectedId}
            onSelect={(id) => pushParams({ sel: id })}
          />
        </div>
        <div className="md:sticky md:top-20 md:max-h-[620px] md:overflow-y-auto md:overscroll-contain md:pr-1">
          {selected ? (
            <ClosurePanel
              c={selected}
              onClose={() => pushParams({ sel: null })}
            />
          ) : (
            <aside className="rounded-xl border-2 border-dashed border-ink/20 bg-paper p-6 text-sm leading-relaxed text-ink/65">
              <div
                style={HEAD_FONT}
                className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-ink/45"
              >
                Detail uzavírky
              </div>
              <p>
                Klikni na barevný úsek nebo bod na mapě a tady se objeví
                všechno k té uzavírce — termín, důvod, kudy jet, MHD odklony.
              </p>
              <p
                style={HEAD_FONT}
                className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-ink/55"
              >
                Legenda
              </p>
              <ul className="mt-2 space-y-1.5 text-xs">
                <li className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: "#c0392b" }}
                  />
                  úplná uzavírka
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: "#009fe3" }}
                  />
                  omezení provozu / plánováno
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: "#94a3b8" }}
                  />
                  drobné omezení
                </li>
              </ul>
            </aside>
          )}
        </div>
      </div>
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

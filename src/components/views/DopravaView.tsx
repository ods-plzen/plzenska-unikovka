"use client";

import { useMemo } from "react";
import { closures, sortedClosures } from "@/lib/data";
import { inArea, areaByeId } from "@/data/areas";
import { useArea } from "@/components/AreaProvider";
import { ClosureMap } from "@/components/map/ClosureMap";
import { ClosureCard } from "@/components/ClosureCard";

export function DopravaView() {
  const { area } = useArea();
  const list = useMemo(
    () => sortedClosures(closures.filter((c) => inArea(c.oblast, area))),
    [area]
  );
  const areaLabel = areaByeId(area)?.short ?? "Celá Plzeň";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="kicker">Doprava · živá mapa</span>
          <h1 className="head mt-1 text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
            Uzavírky a omezení
          </h1>
          <p className="mt-1 text-sm text-muted">
            {areaLabel} · {list.length}{" "}
            {list.length === 1 ? "uzavírka" : "uzavírek"} · data z plzen.eu
          </p>
        </div>
        <span className="ods-chip">Aktualizováno denně</span>
      </header>

      <ClosureMap closures={list} />

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-white p-6 text-center text-muted">
          V tomto obvodu teď neevidujeme žádnou uzavírku. 🎉
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((c) => (
            <ClosureCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}

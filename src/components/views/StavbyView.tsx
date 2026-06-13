"use client";

import { useMemo } from "react";
import { projects } from "@/data/projects";
import { inArea, areaByeId } from "@/data/areas";
import { useArea } from "@/components/AreaProvider";
import { PhaseTimeline } from "@/components/PhaseTimeline";
import { StatusBadge } from "@/components/StatusBadge";

export function StavbyView() {
  const { area } = useArea();
  const list = useMemo(
    () => projects.filter((p) => inArea(p.oblast, area)),
    [area]
  );
  const areaLabel = areaByeId(area)?.short ?? "Celá Plzeň";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="head text-2xl font-bold text-ink">Stavby a sliby</h1>
        <p className="text-sm text-muted">
          {areaLabel} · co bylo slíbeno, kde to stojí a do kdy
        </p>
      </header>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-white p-6 text-center text-muted">
          Pro tento obvod zatím nesledujeme žádný projekt.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((p) => (
            <article
              key={p.id}
              className="rounded-xl border border-line bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="head text-lg font-semibold text-ink">
                    {p.title}
                  </h2>
                  <span className="ods-chip not-italic mt-1">{p.oblast}</span>
                </div>
                <StatusBadge status={p.statusKind} />
              </div>

              <p className="mt-3 text-sm text-ink">
                <span className="font-semibold text-blue">Slíbeno: </span>
                {p.promise}
              </p>
              <p className="mt-1.5 text-sm text-ink">
                <span className="font-semibold text-blue">Stav: </span>
                {p.status}
              </p>

              <div className="mt-4">
                <PhaseTimeline phases={p.phases} />
              </div>

              <div className="mt-3 border-t border-line pt-2 text-xs text-muted">
                Zdroj:{" "}
                {p.srcUrl ? (
                  <a
                    href={p.srcUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue hover:underline"
                  >
                    {p.src}
                  </a>
                ) : (
                  p.src
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

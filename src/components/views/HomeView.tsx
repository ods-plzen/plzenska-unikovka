"use client";

import Link from "next/link";
import { useMemo } from "react";
import { closures, votes, sortedClosures } from "@/lib/data";
import { projects } from "@/data/projects";
import { community } from "@/lib/data";
import { inArea, areaByeId } from "@/data/areas";
import { useArea } from "@/components/AreaProvider";
import { ClosureCard } from "@/components/ClosureCard";
import { UpdatesFeed } from "@/components/UpdatesFeed";
import { DataSources } from "@/components/DataSources";

export function HomeView() {
  const { area } = useArea();
  const areaLabel = areaByeId(area)?.short ?? "Celá Plzeň";

  const cl = useMemo(
    () => sortedClosures(closures.filter((c) => inArea(c.oblast, area))),
    [area]
  );
  const proj = useMemo(
    () => projects.filter((p) => inArea(p.oblast, area)),
    [area]
  );
  const running = cl.filter((c) => c.status === "now").length;

  const tiles = [
    {
      href: "/doprava",
      label: "Doprava",
      n: cl.length,
      unit: "uzavírek",
      hint: `${running} právě probíhá`,
      color: "var(--ods-red)",
    },
    {
      href: "/zastupitelstvo",
      label: "Zastupitelstvo",
      n: votes.length,
      unit: "rozhodnutí",
      hint: "jak hlasoval Lukáš",
      color: "var(--ods-blue)",
    },
    {
      href: "/stavby",
      label: "Stavby a sliby",
      n: proj.length,
      unit: "projektů",
      hint: "slíbeno → stav",
      color: "var(--ods-amber)",
    },
    {
      href: "/komunita",
      label: "Komunita",
      n: community.lost.length + community.events.length,
      unit: "příspěvků",
      hint: "ztráty, akce",
      color: "var(--ods-green)",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl bg-blue p-6 text-white sm:p-8">
        <span className="ods-chip not-italic">{areaLabel}</span>
        <h1 className="head mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
          Co se právě děje ve vašem obvodu — bez hledání po deseti webech.
        </h1>
        <p className="mt-2 max-w-xl text-white/80">
          Uzavírky, rozhodnutí radnice, stavby a sousedské info na jednom místě.
          Data z veřejných zdrojů, aktualizovaná každý den.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="rounded-xl border border-line bg-card p-4 transition-shadow hover:shadow-md"
          >
            <div
              className="head text-3xl font-bold"
              style={{ color: t.color }}
            >
              {t.n}
            </div>
            <div className="text-sm font-semibold text-ink">{t.label}</div>
            <div className="text-xs text-muted">{t.hint}</div>
          </Link>
        ))}
      </section>

      <UpdatesFeed />

      {cl.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="head text-xl font-bold text-ink">
              Aktuální uzavírky
            </h2>
            <Link
              href="/doprava"
              className="text-sm font-medium text-blue hover:underline"
            >
              Všechny na mapě →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {cl.slice(0, 4).map((c) => (
              <ClosureCard key={c.id} c={c} />
            ))}
          </div>
        </section>
      )}

      <DataSources />
    </div>
  );
}

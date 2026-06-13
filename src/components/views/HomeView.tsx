"use client";

import Link from "next/link";
import { useMemo } from "react";
import { closures, votes, sortedClosures, community } from "@/lib/data";
import { projects } from "@/data/projects";
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

  const stats = [
    {
      href: "/doprava",
      n: cl.length,
      label: "Uzavírky",
      hint: `${running} právě probíhá`,
      color: "var(--ods-red)",
    },
    {
      href: "/zastupitelstvo",
      n: votes.length,
      label: "Rozhodnutí",
      hint: "jak hlasoval Lukáš",
      color: "var(--ods-sky)",
    },
    {
      href: "/stavby",
      n: proj.length,
      label: "Stavby",
      hint: "slíbeno → stav",
      color: "var(--ods-amber)",
    },
    {
      href: "/komunita",
      n: community.lost.length + community.events.length,
      label: "Komunita",
      hint: "ztráty, akce",
      color: "var(--ods-green)",
    },
  ];

  return (
    <div className="space-y-12">
      {/* ---------- HERO ---------- */}
      <section
        className="reveal relative overflow-hidden rounded-3xl px-7 py-12 text-white sm:px-12 sm:py-16"
        style={{ background: "var(--hero)" }}
      >
        <div className="hero-grid absolute inset-0 opacity-60" />
        <div
          className="absolute -right-20 -top-24 h-80 w-80 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,159,227,0.55), transparent 65%)",
          }}
        />
        <div className="relative max-w-2xl">
          <span className="kicker reveal d1 text-sky">
            {areaLabel} · živý přehled
          </span>
          <h1 className="reveal d2 head mt-3 text-[2.6rem] font-bold uppercase leading-[0.92] sm:text-6xl">
            Co se právě
            <br />
            děje u vás
          </h1>
          <p className="lead reveal d3 mt-5 max-w-xl text-xl italic leading-snug text-white/80">
            Uzavírky, rozhodnutí radnice, stavby a sousedské info — bez hledání
            po deseti webech. Data jen z oficiálních zdrojů.
          </p>
          <div className="reveal d4 mt-7 flex flex-wrap gap-3">
            <Link
              href="/doprava"
              className="head rounded-full bg-sky px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-transform hover:-translate-y-0.5"
            >
              Zobrazit na mapě
            </Link>
            <Link
              href="/zastupitelstvo"
              className="head rounded-full border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-white"
            >
              Z radnice
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- BROADSHEET STATY ---------- */}
      <section className="reveal d2 grid grid-cols-2 divide-line overflow-hidden rounded-2xl border border-line bg-card sm:grid-cols-4 sm:divide-x">
        {stats.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group p-5 transition-colors hover:bg-paper sm:p-6"
          >
            <div
              className="stat text-5xl sm:text-6xl"
              style={{ color: s.color }}
            >
              {s.n}
            </div>
            <div className="head mt-2 text-sm font-semibold uppercase tracking-wide text-ink">
              {s.label}
            </div>
            <div className="text-xs text-muted">{s.hint}</div>
          </Link>
        ))}
      </section>

      {/* ---------- CO JE NOVÉHO ---------- */}
      <section className="reveal d3">
        <UpdatesFeed />
      </section>

      {/* ---------- AKTUÁLNÍ UZAVÍRKY ---------- */}
      {cl.length > 0 && (
        <section className="reveal d4">
          <div className="section-rule mb-4">
            <h2 className="head text-2xl font-bold uppercase tracking-tight text-ink">
              Aktuální uzavírky
            </h2>
            <Link
              href="/doprava"
              className="kicker shrink-0 hover:text-blue"
            >
              Vše na mapě →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {cl.slice(0, 4).map((c) => (
              <ClosureCard key={c.id} c={c} />
            ))}
          </div>
        </section>
      )}

      {/* ---------- ZDROJE ---------- */}
      <section className="reveal d5">
        <DataSources />
      </section>
    </div>
  );
}

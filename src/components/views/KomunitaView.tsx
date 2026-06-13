"use client";

import { community } from "@/lib/data";

export function KomunitaView() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="head text-2xl font-bold text-ink">Komunita</h1>
        <p className="text-sm text-muted">
          Ztráty a nálezy, sousedské akce. Bez algoritmu, jen ověřené příspěvky.
        </p>
      </header>

      <section>
        <h2 className="head mb-3 text-lg font-semibold text-blue">
          Ztráty a nálezy
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {community.lost.map((l, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-xl border border-line bg-card p-4"
            >
              <div className="text-2xl">{l.icon}</div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-white"
                    style={{
                      background:
                        l.state === "Nalezeno"
                          ? "var(--ods-green)"
                          : "var(--ods-amber)",
                    }}
                  >
                    {l.state}
                  </span>
                  <span className="font-semibold text-ink">{l.b}</span>
                </div>
                <div className="mt-1 text-sm text-muted">{l.meta}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="head mb-3 text-lg font-semibold text-blue">
          Sousedské akce
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {community.events.map((e, i) => (
            <div key={i} className="rounded-xl border border-line bg-card p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-sky">
                {e.d}
              </div>
              <div className="mt-0.5 head text-lg font-semibold text-ink">
                {e.h}
              </div>
              <div className="text-sm text-muted">{e.s}</div>
            </div>
          ))}
        </div>
      </section>

      <p className="rounded-lg bg-sky/5 p-3 text-xs text-muted">
        Komunita slouží k nálezům, ztrátám a sousedským akcím — ne k řešení
        bezpečnosti či sousedských sporů. Každý příspěvek prochází kontrolou před
        zveřejněním.
      </p>
    </div>
  );
}

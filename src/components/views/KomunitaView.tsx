"use client";

import { community } from "@/lib/data";
import { CommunityReport } from "@/components/CommunityReport";
import { WHATSAPP_GROUP } from "@/data/contact";

export function KomunitaView() {
  return (
    <div className="space-y-8">
      <header>
        <span className="kicker">Sousedé · bez algoritmu</span>
        <h1 className="head mt-1 text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
          Komunita
        </h1>
        <p className="mt-1 text-sm text-muted">
          Ztráty a nálezy, sousedské akce. Bez algoritmu, jen ověřené příspěvky.
          {community.updated && (
            <span className="ml-1">· aktualizováno {community.updated}</span>
          )}
        </p>
      </header>

      {WHATSAPP_GROUP && (
        <a
          href={WHATSAPP_GROUP}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 rounded-xl border border-green/40 bg-green/5 p-4 hover:border-green"
        >
          <span>
            <span className="block font-semibold text-ink">
              💬 WhatsApp skupina sousedů
            </span>
            <span className="block text-sm text-muted">
              Rychlé info, ztráty a nálezy přímo v telefonu
            </span>
          </span>
          <span className="rounded-md bg-green px-3 py-1.5 text-sm font-semibold text-white">
            Připojit se
          </span>
        </a>
      )}

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

      <CommunityReport />
    </div>
  );
}

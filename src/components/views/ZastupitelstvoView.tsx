"use client";

import { votes } from "@/lib/data";
import { VoteCard } from "@/components/VoteCard";
import { SessionChapters } from "@/components/SessionChapters";
import { OdsKlub } from "@/components/OdsKlub";

const USNESENI_URL = "https://usneseni.plzen.eu/";

export function ZastupitelstvoView() {
  return (
    <div className="space-y-10">
      <header>
        <span className="kicker">Z radnice · lidskou řečí</span>
        <h1 className="head mt-1 text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
          Ze zastupitelstva
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Klíčová rozhodnutí Zastupitelstva města Plzně srozumitelně — co se
          schválilo a co to znamená. Vždy s odkazem na usnesení a záznam.
        </p>
      </header>

      {/* rozhodnutí */}
      <section className="space-y-4">
        <div className="section-rule">
          <h2 className="head text-2xl font-bold uppercase tracking-tight text-ink">
            Vybraná rozhodnutí
          </h2>
          <a
            href={USNESENI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="kicker shrink-0 hover:text-blue"
          >
            Všechna usnesení →
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {votes.map((v, i) => (
            <VoteCard key={i} v={v} />
          ))}
        </div>
        <p className="rounded-lg bg-sky/5 p-3 text-xs text-muted">
          ℹ️ Vybíráme rozhodnutí s dopadem na Plzeňany a překládáme je do
          srozumitelného jazyka z veřejných usnesení a záznamu. Kompletní
          a&nbsp;oficiální seznam je na{" "}
          <a
            href={USNESENI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue hover:underline"
          >
            usneseni.plzen.eu
          </a>
          .
        </p>
      </section>

      {/* ODS klub */}
      <OdsKlub />

      {/* záznam jednání */}
      <SessionChapters />
    </div>
  );
}

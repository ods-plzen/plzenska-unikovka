"use client";

import { votes } from "@/lib/data";
import { VoteCard } from "@/components/VoteCard";
import { SessionChapters } from "@/components/SessionChapters";

export function ZastupitelstvoView() {
  return (
    <div className="space-y-6">
      <header>
        <span className="kicker">Z radnice · lidskou řečí</span>
        <h1 className="head mt-1 text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
          Ze zastupitelstva
        </h1>
        <p className="mt-1 text-sm text-muted">
          Co se schválilo a jak hlasoval Lukáš Hegner — vždy s odkazem na
          usnesení a záznam.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {votes.map((v, i) => (
          <VoteCard key={i} v={v} />
        ))}
      </div>

      <SessionChapters />

      <p className="rounded-lg bg-sky/5 p-3 text-xs text-muted">
        ℹ️ Přepis do srozumitelného jazyka připravujeme ručně z veřejných
        usnesení a záznamu jednání. Originální znění najdete vždy přes odkaz na
        zdroj u každé karty.
      </p>
    </div>
  );
}

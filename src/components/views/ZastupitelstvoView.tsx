"use client";

import { votes } from "@/lib/data";
import { VoteCard } from "@/components/VoteCard";

export function ZastupitelstvoView() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="head text-2xl font-bold text-ink">Ze zastupitelstva</h1>
        <p className="text-sm text-muted">
          Rozhodnutí lidskou řečí — co se schválilo a jak hlasoval Lukáš Hegner.
          Vždy s odkazem na usnesení.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {votes.map((v, i) => (
          <VoteCard key={i} v={v} />
        ))}
      </div>

      <p className="rounded-lg bg-sky/5 p-3 text-xs text-muted">
        ℹ️ Přepis do srozumitelného jazyka připravujeme ručně z veřejných
        usnesení a záznamu jednání. Originální znění najdete vždy přes odkaz na
        zdroj u každé karty.
      </p>
    </div>
  );
}

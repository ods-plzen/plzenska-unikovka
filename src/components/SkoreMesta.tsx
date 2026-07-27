"use client";

import { useMemo } from "react";
import Link from "next/link";
import { closures, extras } from "@/lib/data";

/**
 * Deadpan „skóre města" — provokace čistě přes vlastní ověřená data,
 * žádné přívlastky. Čísla se počítají z closures.json + extras.json,
 * takže nikdy netvrdíme nic, co v datech není.
 */
const AMERICKA_START = new Date("2026-05-11"); // rekonstrukce běží od 11. 5. 2026 (ověřeno)

export function SkoreMesta() {
  const { nowCount, americkaDay, maxKm } = useMemo(() => {
    const nowCount = closures.filter((c) => c.status === "now").length;
    const am = closures.find((c) => c.id === "americka");
    const americkaDay =
      am && am.status === "now"
        ? Math.max(
            1,
            Math.floor((Date.now() - AMERICKA_START.getTime()) / 86_400_000) + 1,
          )
        : null;
    let maxKm = 0;
    for (const ex of Object.values(extras)) {
      for (const d of ex?.detours ?? []) {
        if (typeof d.km === "number" && d.km > maxKm) maxKm = d.km;
      }
    }
    return { nowCount, americkaDay, maxKm };
  }, []);

  return (
    <div className="mb-6 rounded-xl bg-blue-deep px-5 py-4 text-white">
      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
        Skóre města
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
        <span>
          Právě rozkopáno:{" "}
          <b className="text-base">{nowCount}</b> míst
        </span>
        {americkaDay !== null && (
          <span>
            Americká: <b className="text-base">{americkaDay}.</b> den
          </span>
        )}
        {maxKm > 0 && (
          <span>
            Nejdelší oficiální objížďka:{" "}
            <b className="text-base">{maxKm} km</b>
          </span>
        )}
        <Link
          href="/proc-existuje"
          className="text-sky underline-offset-2 hover:underline"
        >
          Městská aplikace: slíbena 2×, dodána 0× →
        </Link>
      </div>
    </div>
  );
}

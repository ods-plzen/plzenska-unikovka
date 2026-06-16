"use client";

import Link from "next/link";
import type { Closure } from "@/lib/types";
import { mhdInfoFor } from "@/lib/data";

const SEVERITY_LABEL: Record<string, string> = {
  major: "úplná uzavírka",
  medium: "omezení provozu",
  minor: "běžné omezení",
};

export function ClosurePanel({
  c,
  onClose,
}: {
  c: Closure;
  onClose: () => void;
}) {
  const mhd = mhdInfoFor(c.id);
  return (
    <aside className="flex h-full flex-col gap-4 overflow-y-auto rounded-xl border border-line bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            {c.oblast}
            {c.severity && ` · ${SEVERITY_LABEL[c.severity]}`}
          </div>
          <h2 className="head mt-1 text-2xl font-bold text-ink">{c.name}</h2>
          {c.termin && <p className="mt-1 text-sm text-muted">{c.termin}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít detail"
          className="rounded-full p-1 text-muted hover:bg-line hover:text-ink"
        >
          ✕
        </button>
      </div>

      <section>
        <h3 className="head mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
          Co se tam děje
        </h3>
        <p className="text-sm leading-relaxed text-ink whitespace-pre-line">
          {c.popis || c.akce}
        </p>
      </section>

      {mhd && (mhd.reroutes?.length || mhd.tempStops?.length) ? (
        <section>
          <h3 className="head mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Kudy jet / jít
          </h3>
          <ul className="space-y-1 text-sm text-ink">
            {mhd.reroutes?.map((r, i) => (
              <li key={`r${i}`}>
                {r.lines?.length ? (
                  <span className="font-semibold">{r.lines.join(", ")} </span>
                ) : null}
                {r.via}
              </li>
            ))}
            {mhd.tempStops?.map((s, i) => (
              <li key={`s${i}`} className="text-muted">
                Zastávka {s.name} → {s.where}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-3">
        <Link
          href={`/doprava/${c.id}`}
          className="rounded-md bg-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-blue/90"
        >
          Otevřít detail →
        </Link>
        <a
          href="https://agp.plzen.eu/app/uzavirky/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-blue hover:border-blue"
        >
          Mapa SITmP ↗
        </a>
      </div>
      <p className="text-[11px] text-muted">
        Zdroj: {c.zdroj || "JSDI"} přes SITmP (agp.plzen.eu)
      </p>
    </aside>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { closures, extras } from "@/lib/data";
import { AREAS, inArea } from "@/data/areas";
import { TimeFilterChips } from "@/components/TimeFilterChips";
import { isInFilter, parseFilter, type TimeFilter } from "@/lib/timeFilter";
import type { Closure } from "@/lib/types";

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;

const STATUS_LABEL: Record<string, string> = {
  now: "Probíhá",
  plan: "Plánováno",
  done: "Hotovo",
};

const STATUS_BG: Record<string, string> = {
  now: "bg-[#c0392b] text-white",
  plan: "bg-blue text-white",
  done: "bg-ink/20 text-ink/70",
};

const STATUS_RANK: Record<string, number> = { now: 0, plan: 1, done: 2 };

const MONTHS_CZ = [
  "ledna", "února", "března", "dubna", "května", "června",
  "července", "srpna", "září", "října", "listopadu", "prosince",
];

function fmtCzDate(iso?: string): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  return `${d}. ${m}. ${y}`;
}

function fmtRange(c: Closure): string {
  const a = fmtCzDate(c.od);
  const b = fmtCzDate(c.do);
  if (a && b) return `${a} – ${b}`;
  if (a) return `od ${a}`;
  if (b) return `do ${b}`;
  return c.termin;
}

// Editorial overlay (extras.json) bez odpovídající closure v JSDI scrapu
// = velký plánovaný projekt, který obec ještě nenahlásila do JSDI feedu.
// Zviditelníme ho jen v /seznam jako manuální položku (bez detailu).
function virtualizeOrphans(): Closure[] {
  const existing = new Set(closures.map((c) => c.id));
  return Object.entries(extras)
    .filter(([id]) => !existing.has(id))
    .map(([id, ex]) => {
      // Odhadni oblast z názvu (Masaryk = P4 Doubravka, Domažlická = P3)
      const guessOblast =
        id === "masarykova"
          ? "Plzeň 4"
          : id === "domazlicka"
            ? "Plzeň 3"
            : "Plzeň";
      const guessOd =
        id === "masarykova"
          ? "2026-06-29"
          : id === "domazlicka"
            ? "2026-07-01"
            : undefined;
      return {
        id: `__virtual-${id}`,
        name: ex.title.replace(/^(Rekonstrukce|Oprava)\s+/, ""),
        akce: ex.sub,
        state: "Plánováno",
        status: "plan" as const,
        color: "#c0392b",
        oblast: guessOblast,
        termin: ex.sub,
        ways: [],
        severity: "major" as const,
        zdroj: "Manuální (editorial)",
        geomTier: 5 as const,
        od: guessOd,
        popis: `${ex.title}. ${ex.sub}`,
      };
    });
}

const SORT_OPTIONS = [
  { id: "status", label: "Podle stavu" },
  { id: "date", label: "Podle data" },
  { id: "name", label: "Podle ulice" },
] as const;

type SortBy = (typeof SORT_OPTIONS)[number]["id"];

export function ListView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // /seznam je A-Z list — default je "all" (ukáže i plánované), ne "now".
  const rawFilter = params.get("f");
  const filter: TimeFilter = rawFilter
    ? parseFilter(rawFilter)
    : "all";
  const obvodParam = params.get("o");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("status");

  function pushParams(next: { f?: TimeFilter; o?: string | null }) {
    const sp = new URLSearchParams(params.toString());
    if (next.f !== undefined) {
      if (next.f === "all") sp.delete("f");
      else sp.set("f", next.f);
    }
    if (next.o !== undefined) {
      if (next.o) sp.set("o", next.o);
      else sp.delete("o");
    }
    const q = sp.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  const all = useMemo<Closure[]>(
    () => [...closures, ...virtualizeOrphans()],
    [],
  );

  const filtered = useMemo(() => {
    const seen = new Set<string>();
    return all
      .filter((c) => isInFilter(c, filter))
      .filter((c) => !obvodParam || inArea(c.oblast, obvodParam))
      .filter((c) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.akce ?? "").toLowerCase().includes(q) ||
          (c.popis ?? "").toLowerCase().includes(q)
        );
      })
      .filter((c) => {
        const key = `${c.name}|${c.oblast}|${c.od ?? ""}|${c.do ?? ""}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [all, filter, obvodParam, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "status") {
        const sa = STATUS_RANK[a.status] ?? 9;
        const sb = STATUS_RANK[b.status] ?? 9;
        if (sa !== sb) return sa - sb;
        return (a.od ?? "").localeCompare(b.od ?? "");
      }
      if (sortBy === "date") {
        return (a.od ?? "9").localeCompare(b.od ?? "9");
      }
      return a.name.localeCompare(b.name, "cs");
    });
  }, [filtered, sortBy]);

  const obvody = AREAS.filter((a) => a.id !== "all");

  return (
    <div className="space-y-6 pb-8 md:space-y-8">
      <div className="flex flex-col gap-3 border-b-2 border-ink/90 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          style={HEAD_FONT}
          className="text-[10px] font-semibold uppercase tracking-[0.4em] text-ink/70"
        >
          <Link href="/" className="hover:text-blue">← Úvod</Link>
          <span className="mx-2 text-ink/30">/</span>
          Seznam všech uzavírek
        </div>
        <TimeFilterChips value={filter} onChange={(f) => pushParams({ f })} />
      </div>

      <header className="space-y-3">
        <h1
          style={HEAD_FONT}
          className="text-3xl font-bold uppercase leading-[0.95] text-ink sm:text-4xl md:text-5xl"
        >
          <span className="text-blue">{sorted.length}</span>{" "}
          {sorted.length === 1
            ? "uzavírka"
            : sorted.length < 5
              ? "uzavírky"
              : "uzavírek"}
        </h1>
        <p
          style={HEAD_FONT}
          className="text-sm font-normal leading-snug text-ink/70 sm:text-base"
        >
          Všechno aktivní i plánované — JSDI ŘSD, SITmP a editorial overlay pro
          velké projekty.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Hledat ulici…"
          className="min-h-[44px] flex-1 rounded-full border border-ink/30 bg-white px-4 py-2 text-sm text-ink outline-none focus:border-blue"
        />
        <div className="flex gap-2">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setSortBy(o.id)}
              aria-pressed={sortBy === o.id}
              style={HEAD_FONT}
              className={
                "min-h-[40px] rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors " +
                (sortBy === o.id
                  ? "bg-ink text-white"
                  : "border border-ink/30 text-ink/70 hover:border-ink")
              }
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => pushParams({ o: null })}
          style={HEAD_FONT}
          className={
            "min-h-[36px] rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors " +
            (!obvodParam
              ? "bg-blue text-white"
              : "border border-ink/30 text-ink/70 hover:border-ink")
          }
        >
          Celá Plzeň
        </button>
        {obvody.map((a) => {
          const active = a.id === obvodParam;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => pushParams({ o: active ? null : a.id })}
              style={HEAD_FONT}
              className={
                "min-h-[36px] rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors " +
                (active
                  ? "bg-blue text-white"
                  : "border border-ink/30 text-ink/70 hover:border-ink")
              }
            >
              {a.short.replace("Plzeň ", "P")}
            </button>
          );
        })}
      </div>

      <ul className="space-y-2.5 sm:space-y-3">
        {sorted.length === 0 ? (
          <li
            style={HEAD_FONT}
            className="rounded-2xl border-2 border-dashed border-ink/30 p-6 text-center text-base font-bold uppercase text-ink/60"
          >
            Nic nenalezeno
          </li>
        ) : (
          sorted.map((c) => <Row key={c.id} c={c} />)
        )}
      </ul>
    </div>
  );
}

function Row({ c }: { c: Closure }) {
  const isVirtual = c.id.startsWith("__virtual-");
  const statusLabel = STATUS_LABEL[c.status] ?? c.state;
  const rowInner = (
    <div className="flex items-start gap-3 p-3 sm:items-center sm:gap-4 sm:p-4">
      <span
        style={HEAD_FONT}
        className={
          "shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] " +
          (STATUS_BG[c.status] ?? "bg-ink/10 text-ink")
        }
      >
        {statusLabel}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            style={HEAD_FONT}
            className="text-base font-bold uppercase leading-tight text-ink sm:text-lg"
          >
            {c.name}
          </span>
          <span
            style={HEAD_FONT}
            className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink/55"
          >
            {c.oblast}
          </span>
        </div>
        <div className="mt-1 text-sm leading-snug text-ink/70">{c.akce}</div>
        <div
          style={HEAD_FONT}
          className="mt-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-blue"
        >
          {fmtRange(c)}
        </div>
        {isVirtual && (
          <div
            style={HEAD_FONT}
            className="mt-1.5 inline-block rounded-full bg-ink/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-ink/55"
          >
            Editorial · zatím není v JSDI
          </div>
        )}
      </div>
      {!isVirtual && (
        <span
          style={HEAD_FONT}
          className="hidden shrink-0 text-[11px] font-bold uppercase tracking-[0.25em] text-blue sm:inline"
          aria-hidden
        >
          →
        </span>
      )}
    </div>
  );

  if (isVirtual) {
    return (
      <li className="rounded-2xl border-2 border-ink/20 bg-white">
        {rowInner}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={`/doprava/${c.id}`}
        className="block rounded-2xl border-2 border-ink/20 bg-white transition-colors hover:border-blue"
      >
        {rowInner}
      </Link>
    </li>
  );
}

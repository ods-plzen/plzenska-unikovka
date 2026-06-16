"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Closure } from "@/lib/types";
import { closures, closureById } from "@/lib/data";
import { AREAS, inArea } from "@/data/areas";
import { useArea } from "@/components/AreaProvider";
import { ClosurePanel } from "@/components/ClosurePanel";
import { MiniMap } from "@/components/map/MiniMap";
import { TimeFilterChips } from "@/components/TimeFilterChips";
import { isInFilter, parseFilter, type TimeFilter } from "@/lib/timeFilter";
import { SEVERITY_RANK } from "@/lib/severity";

const SEVERITY_LABEL: Record<string, string> = {
  major: "Úplná uzavírka",
  medium: "Omezení provozu",
  minor: "Drobné omezení",
};

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

function fmtDateRange(c: Closure): string {
  const a = fmtCzDate(c.od);
  const b = fmtCzDate(c.do);
  if (a && b) return `${a} – ${b}`;
  if (b) return `do ${b}`;
  if (a) return `od ${a}`;
  return c.termin;
}

function todayPretty(): string {
  const d = new Date();
  return `${d.getDate()}. ${MONTHS_CZ[d.getMonth()]} ${d.getFullYear()}`;
}

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;

const ALERT_RED = "#c0392b";
const ODS_SKY = "#009fe3";
const NEUTRAL_GRAY = "#94a3b8";

export function HomeView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filter: TimeFilter = parseFilter(params.get("f"));
  const selectedId = params.get("sel") ?? null;
  const obvodParam = params.get("o");
  const selected = selectedId ? closureById(selectedId) : null;
  const { setArea } = useArea();

  function pushParams(next: { f?: TimeFilter; sel?: string | null; o?: string | null }) {
    const sp = new URLSearchParams(params.toString());
    if (next.f !== undefined) {
      if (next.f === "now") sp.delete("f");
      else sp.set("f", next.f);
    }
    if (next.sel !== undefined) {
      if (next.sel) sp.set("sel", next.sel);
      else sp.delete("sel");
    }
    if (next.o !== undefined) {
      if (next.o) sp.set("o", next.o);
      else sp.delete("o");
    }
    const q = sp.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  const visibleAll = useMemo(
    () => closures.filter((c) => isInFilter(c, filter)),
    [filter],
  );

  const visible = useMemo(
    () =>
      obvodParam
        ? visibleAll.filter((c) => inArea(c.oblast, obvodParam))
        : visibleAll,
    [visibleAll, obvodParam],
  );

  const top5 = useMemo(
    () =>
      [...visible]
        .sort(
          (a, b) =>
            SEVERITY_RANK[a.severity ?? "minor"] -
              SEVERITY_RANK[b.severity ?? "minor"] ||
            (a.od ?? "9999").localeCompare(b.od ?? "9999"),
        )
        .slice(0, 5),
    [visible],
  );

  const obvodCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const x of visibleAll) c[x.oblast] = (c[x.oblast] ?? 0) + 1;
    return c;
  }, [visibleAll]);

  const obvody = AREAS.filter((a) => a.id !== "all");
  const focusedObvod = obvodParam
    ? AREAS.find((a) => a.id === obvodParam)
    : null;

  return (
    <div className="space-y-10 pb-10">
      {/* ──────────────  TOP STRIP — filter ────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink/90 pb-3">
        <div
          style={HEAD_FONT}
          className="text-[10px] font-semibold uppercase tracking-[0.4em] text-ink/70"
        >
          Plzeň · {todayPretty()}
        </div>
        <TimeFilterChips
          value={filter}
          onChange={(f) => pushParams({ f })}
        />
      </div>

      {/* ──────────────  HERO — ODS billboard pattern ────────────── */}
      <section className="relative grid gap-6 lg:grid-cols-12">
        <div
          className="relative overflow-hidden rounded-3xl p-8 text-white sm:p-12 lg:col-span-7"
          style={{
            background: "var(--hero)",
          }}
        >
          {/* ODS ribbon top-left */}
          <span className="ods-ribbon absolute left-6 top-6 sm:left-8 sm:top-8">
            Plzeňská únikovka · {todayPretty()}
          </span>

          <h1
            style={HEAD_FONT}
            className="mt-16 text-[56px] font-bold uppercase leading-[0.9] sm:text-[80px] lg:text-[96px]"
          >
            {focusedObvod ? <>{focusedObvod.short}:</> : <>5 míst,</>}
            <br />
            která tě teď
            <br />
            <span className="text-sky">nepustí.</span>
          </h1>

          <p
            style={HEAD_FONT}
            className="mt-8 max-w-md text-base font-normal leading-snug text-white/85"
          >
            Pět největších uzavírek
            {focusedObvod ? ` v ${focusedObvod.short}` : " v Plzni"} teď. Auto,
            MHD, kolo — všechno cítí. Klikni a uvidíš proč a kudy jinudy.
          </p>

          {focusedObvod && (
            <button
              type="button"
              onClick={() => pushParams({ o: null })}
              style={HEAD_FONT}
              className="mt-6 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] backdrop-blur hover:bg-white/30"
            >
              ← Zpět na celou Plzeň
            </button>
          )}

          {/* ODS logo bottom-right */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ods-logo.svg"
            alt="ODS"
            className="absolute bottom-6 right-6 h-10 w-auto sm:bottom-8 sm:right-8 sm:h-12"
          />
        </div>

        <div className="lg:col-span-5">
          {selected ? (
            <ClosurePanel
              c={selected}
              onClose={() => pushParams({ sel: null })}
            />
          ) : (
            <div className="ods-board flex h-full flex-col justify-between rounded-3xl p-7">
              <div>
                <div
                  style={HEAD_FONT}
                  className="text-[10px] font-bold uppercase tracking-[0.4em] text-sky"
                >
                  Jak to číst
                </div>
                <h3
                  style={HEAD_FONT}
                  className="mt-2 text-3xl font-bold uppercase leading-tight"
                >
                  Karty
                  <br />
                  podle síly
                  <br />
                  zásahu.
                </h3>
                <p
                  style={HEAD_FONT}
                  className="mt-4 text-sm font-normal leading-snug text-white/80"
                >
                  Od úplných zákazů průjezdu, přes kyvadlovou dopravu, po menší
                  zúžení. Klik na kartu → detail vpravo. Klik na obvod →
                  filtruje jen na tvoje místo.
                </p>
              </div>
              <div
                style={HEAD_FONT}
                className="mt-6 flex items-baseline gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-sky"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-sky" />
                {visible.length} aktivních
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ──────────────  TOP 5 KARET — ODS billboard cards ────────────── */}
      <section>
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h2
            style={HEAD_FONT}
            className="text-[11px] font-bold uppercase tracking-[0.4em] text-ink/70"
          >
            {focusedObvod
              ? `Top ${Math.min(top5.length, 5)} · ${focusedObvod.short}`
              : "Top 5 · celá Plzeň"}
          </h2>
          <span
            style={HEAD_FONT}
            className="text-[10px] font-semibold uppercase tracking-[0.3em] text-ink/50"
          >
            zdroj SITmP / JSDI ŘSD
          </span>
        </div>

        {top5.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-ink/30 bg-white p-10 text-center">
            <p
              style={HEAD_FONT}
              className="text-2xl font-bold uppercase text-ink/60"
            >
              V tomto filtru nic. 🎉
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {top5.map((c, idx) => (
              <BoardCard
                key={c.id}
                c={c}
                rank={idx + 1}
                variant={idx === 0 ? "hero" : "medium"}
              />
            ))}
          </div>
        )}
      </section>

      {/* ──────────────  10 OBVODŮ — kandidátka grid ────────────── */}
      <section className="border-t-2 border-ink/90 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div
              style={HEAD_FONT}
              className="text-[11px] font-bold uppercase tracking-[0.5em] text-sky"
            >
              Tvůj obvod
            </div>
            <h2
              style={HEAD_FONT}
              className="mt-3 text-4xl font-bold uppercase leading-[0.95] sm:text-5xl"
            >
              Vyber, kde bydlíš.
            </h2>
          </div>
          <p
            style={HEAD_FONT}
            className="max-w-xs text-sm font-normal text-ink/70"
          >
            Klik na obvod → top 5 jen tady u tebe. Mapa zůstává celá Plzeň.
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {obvody.map((a) => (
            <ObvodTile
              key={a.id}
              areaId={a.id}
              areaShort={a.short}
              areaLabel={a.label}
              count={obvodCounts[a.id] ?? 0}
              active={a.id === obvodParam}
              onClick={() =>
                pushParams({ o: a.id === obvodParam ? null : a.id, sel: null })
              }
            />
          ))}
        </div>
      </section>

      {/* ──────────────  CTA → /mapa ────────────── */}
      <section className="ods-board rounded-3xl p-8 sm:p-12">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div
              style={HEAD_FONT}
              className="text-[11px] font-bold uppercase tracking-[0.5em] text-sky"
            >
              Pro otrlé
            </div>
            <h2
              style={HEAD_FONT}
              className="mt-3 text-4xl font-bold uppercase leading-[0.95] text-white sm:text-5xl"
            >
              Chceš všech {visibleAll.length} na mapě?
            </h2>
            <p
              style={HEAD_FONT}
              className="mt-5 max-w-xl text-base font-normal text-white/80"
            >
              Velká mapa se všema modrými puntíky, čárami a obvody. Pro
              dispečery, řidiče autobusů a nás, co kontrolujeme každý detail.
            </p>
            <Link
              href={
                obvodParam
                  ? `/mapa?o=${encodeURIComponent(obvodParam)}`
                  : "/mapa"
              }
              onClick={() => obvodParam && setArea(obvodParam)}
              style={HEAD_FONT}
              className="mt-7 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3 text-sm font-bold uppercase tracking-[0.25em] text-blue transition-colors hover:bg-sky hover:text-white"
            >
              Otevři velkou mapu
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="lg:col-span-4">
            <div
              style={HEAD_FONT}
              className="text-[10px] font-bold uppercase tracking-[0.4em] text-sky"
            >
              Data tečou odkud
            </div>
            <ul
              style={HEAD_FONT}
              className="mt-3 space-y-2 text-base font-normal text-white/85"
            >
              <li>SITmP · agp.plzen.eu</li>
              <li>JSDI ŘSD · státní dopravní info</li>
              <li>SUPERDIO · městská evidence staveb</li>
              <li>PMDP · MHD odklony a zastávky</li>
            </ul>
            <p className="mt-4 text-xs text-white/55">
              Aktualizováno denně v 7:00 ráno.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ──────────────  BoardCard — ODS billboard style ────────────── */

function getCenter(c: Closure): [number, number] | null {
  const pt = c.ways?.[0]?.[0];
  if (!pt || pt.length < 2) return null;
  return [pt[0], pt[1]];
}

function getWays(c: Closure): [number, number][][] | undefined {
  if (c.point) return undefined;
  const polylines = c.ways.filter((w) => w.length >= 2);
  return polylines.length > 0
    ? (polylines as [number, number][][])
    : undefined;
}

const TIER_LABELS: Record<number, { label: string; tone: "ok" | "approx" | "rough" }> = {
  1: { label: "Geometrie ze SITmP", tone: "ok" },
  2: { label: "Geometrie ze SITmP", tone: "ok" },
  3: { label: "Úsek z popisu", tone: "ok" },
  4: { label: "Přibližný úsek (~300 m)", tone: "approx" },
  5: { label: "Pouze bod", tone: "rough" },
};

const TIER_TOOLTIPS: Record<number, string> = {
  1: "Polyline přímo z SITmP / JSDI ŘSD — přesná hranice úseku.",
  2: "Polyline ze SITmP nalezená podle blízkosti — vysoká spolehlivost.",
  3: "Úsek určen z JSDI popisu („v úseku X po Y") a oklipnutý mezi OSM křižovatkami.",
  4: "Geometrie z OpenStreetMap, oklipnutá na 300 m okolo bodu uzavírky. Skutečný úsek může být kratší/delší — viz textový popis v detailu.",
  5: "Pro tuto uzavírku máme jen bod — typicky státní silnice s číselným označením, bez názvu v OSM.",
};

function BoardCard({
  c,
  rank,
  variant,
}: {
  c: Closure;
  rank: number;
  variant: "hero" | "medium";
}) {
  const sev = c.severity ?? "minor";
  const sevLabel = SEVERITY_LABEL[sev];
  const date = fmtDateRange(c);
  const center = getCenter(c);
  const ways = getWays(c);
  const hasPolyline = !!ways && ways.length > 0;
  const sevBadgeBg =
    sev === "major" ? ALERT_RED : sev === "medium" ? ODS_SKY : NEUTRAL_GRAY;
  const rankColor =
    sev === "major" ? "text-[#c0392b]" : sev === "medium" ? "text-sky" : "text-ink/30";

  if (variant === "hero") {
    return (
      <Link
        href={`/doprava/${c.id}`}
        className="group relative col-span-1 grid cursor-pointer grid-cols-1 overflow-hidden rounded-3xl border-2 border-ink/90 bg-white text-left transition-all duration-150 shadow-[3px_3px_0_0_var(--ods-blue)] hover:shadow-[8px_8px_0_0_var(--ods-sky)] md:grid-cols-12 lg:col-span-12"
      >
        {/* mini-mapa = location image s ulicemi a polyline (pokud existuje) */}
        <div className="relative h-[280px] overflow-hidden border-b-2 border-ink/90 md:col-span-5 md:h-auto md:border-b-0 md:border-r-2">
          {center ? (
            <MiniMap
              center={center}
              ways={ways}
              severity={sev}
              height={460}
              zoom={15}
            />
          ) : (
            <div className="h-full w-full bg-line" />
          )}
          {/* top-left ribbon */}
          <span
            className="ods-ribbon absolute left-4 top-4"
            style={{ background: sevBadgeBg }}
          >
            {sevLabel}
          </span>
          {/* tier badge: konkrétní přesnost geometrie */}
          {hasPolyline && c.geomTier && (
            <div
              style={HEAD_FONT}
              title={TIER_TOOLTIPS[c.geomTier]}
              className={
                "absolute bottom-0 left-0 right-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur " +
                (TIER_LABELS[c.geomTier].tone === "ok"
                  ? "bg-blue/85 text-white"
                  : TIER_LABELS[c.geomTier].tone === "approx"
                    ? "bg-ink/85 text-white"
                    : "bg-muted/80 text-white")
              }
            >
              {TIER_LABELS[c.geomTier].label}
            </div>
          )}
        </div>

        {/* body — bílá s tmavým textem, rank "1." velký vlevo nahoře */}
        <div className="relative flex flex-col justify-between p-7 sm:p-10 md:col-span-7">
          <div>
            <div
              style={HEAD_FONT}
              className={
                "stat text-[140px] leading-[0.85] sm:text-[180px] " + rankColor
              }
              aria-hidden
            >
              {rank}.
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-3">
              <span
                style={HEAD_FONT}
                className="text-[11px] font-bold uppercase tracking-[0.4em] text-ink/70"
              >
                {c.oblast}
              </span>
              <span
                style={HEAD_FONT}
                className="text-[11px] font-bold uppercase tracking-[0.4em] text-blue"
              >
                {date}
              </span>
            </div>
            <div
              style={HEAD_FONT}
              className="mt-3 text-[44px] font-bold uppercase leading-[0.9] text-ink sm:text-5xl lg:text-6xl"
            >
              {c.name}
            </div>
            <p
              style={HEAD_FONT}
              className="mt-3 max-w-xl text-lg font-normal leading-snug text-ink/75"
            >
              {c.akce}
            </p>
          </div>
          <div
            style={HEAD_FONT}
            className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-blue px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.3em] text-white group-hover:bg-sky"
          >
            Otevři detail
            <span aria-hidden className="text-base">→</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/doprava/${c.id}`}
      className="group relative col-span-1 flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border-2 border-ink/90 bg-white text-left transition-all duration-150 shadow-[3px_3px_0_0_var(--ods-blue)] hover:shadow-[6px_6px_0_0_var(--ods-sky)] lg:col-span-6"
    >
      <div className="relative h-[180px] overflow-hidden border-b-2 border-ink/90">
        {center ? (
          <MiniMap
            center={center}
            ways={ways}
            severity={sev}
            height={180}
            zoom={15}
          />
        ) : (
          <div className="h-full w-full bg-line" />
        )}
        <span
          className="ods-ribbon absolute left-3 top-3"
          style={{ background: sevBadgeBg }}
        >
          {sevLabel}
        </span>
        {hasPolyline && c.geomTier && (
          <div
            style={HEAD_FONT}
            title={TIER_TOOLTIPS[c.geomTier]}
            className={
              "absolute bottom-0 left-0 right-0 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur " +
              (TIER_LABELS[c.geomTier].tone === "ok"
                ? "bg-blue/85 text-white"
                : TIER_LABELS[c.geomTier].tone === "approx"
                  ? "bg-ink/85 text-white"
                  : "bg-muted/80 text-white")
            }
          >
            {TIER_LABELS[c.geomTier].label}
          </div>
        )}
      </div>
      <div className="relative flex flex-1 flex-col p-5">
        <div
          style={HEAD_FONT}
          className={"stat text-[88px] leading-[0.85] " + rankColor}
          aria-hidden
        >
          {rank}.
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <span
            style={HEAD_FONT}
            className="text-[10px] font-bold uppercase tracking-[0.35em] text-ink/70"
          >
            {c.oblast}
          </span>
          <span
            style={HEAD_FONT}
            className="text-[10px] font-bold uppercase tracking-[0.35em] text-blue"
          >
            {date}
          </span>
        </div>
        <div
          style={HEAD_FONT}
          className="mt-2 text-2xl font-bold uppercase leading-[0.95] text-ink sm:text-3xl"
        >
          {c.name}
        </div>
        <p
          style={HEAD_FONT}
          className="mt-2 text-base font-normal leading-snug text-ink/75"
        >
          {c.akce}
        </p>
        <div
          style={HEAD_FONT}
          className="mt-auto pt-5 text-[11px] font-bold uppercase tracking-[0.3em] text-blue group-hover:text-sky"
        >
          Otevři detail →
        </div>
      </div>
    </Link>
  );
}

/* ──────────────  ObvodTile — kandidátka pattern (modré dlaždice) ────────────── */

function ObvodTile({
  areaId,
  areaShort,
  areaLabel,
  count,
  active,
  onClick,
}: {
  areaId: string;
  areaShort: string;
  areaLabel: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const num = areaShort.replace("Plzeň ", "");
  // Modré tóny pouze: tmavá modrá / světlá modrá / bílá karta s černým textem
  const tier =
    count === 0
      ? "empty"
      : count <= 3
        ? "light"
        : count <= 6
          ? "mid"
          : "heavy";
  const styles: Record<string, string> = {
    empty: "bg-white text-ink/55 border-ink/30",
    light: "bg-white text-ink border-ink",
    mid: "bg-sky text-white border-ink",
    heavy: "bg-blue text-white border-ink",
  };
  const dotStyles: Record<string, string> = {
    empty: "bg-ink/20",
    light: "bg-sky",
    mid: "bg-white",
    heavy: "bg-white",
  };
  const localityLine = areaLabel.replace(/^Plzeň\s+\d+\s+—\s+/, "");
  const activeRing = active
    ? " ring-4 ring-sky ring-offset-2 ring-offset-paper"
    : "";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "group relative flex aspect-square cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border-2 p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--ods-sky)] " +
        styles[tier] +
        activeRing
      }
    >
      {/* big watermark číslo na pozadí */}
      <div
        style={HEAD_FONT}
        className="pointer-events-none absolute -bottom-8 -right-4 select-none text-[180px] font-bold leading-none opacity-[0.12]"
        aria-hidden
      >
        {num}
      </div>
      <div className="relative flex items-start justify-between gap-2">
        <div
          style={HEAD_FONT}
          className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-90"
        >
          Plzeň
        </div>
        <span
          className={"h-2 w-2 rounded-full " + dotStyles[tier]}
          aria-hidden
        />
      </div>
      <div
        style={HEAD_FONT}
        className="stat relative text-[72px] font-bold leading-none sm:text-[88px]"
      >
        {num}
      </div>
      <div
        style={HEAD_FONT}
        className="relative text-[10px] font-normal uppercase tracking-[0.15em] leading-tight opacity-80"
      >
        {localityLine}
      </div>
      <div
        style={HEAD_FONT}
        className="absolute right-3 top-3 rounded-full bg-paper/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-ink"
      >
        {count} {count === 1 ? "uzavírka" : count < 5 ? "uzavírky" : "uzavírek"}
      </div>
    </button>
  );
}

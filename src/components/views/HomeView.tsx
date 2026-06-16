"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Closure } from "@/lib/types";
import { closures } from "@/lib/data";
import { AREAS, inArea } from "@/data/areas";
import { useArea } from "@/components/AreaProvider";
import { MiniMap } from "@/components/map/MiniMap";
import { TimeFilterChips } from "@/components/TimeFilterChips";
import { isInFilter, parseFilter, type TimeFilter } from "@/lib/timeFilter";
import { HLAVNI_TAHY, SEVERITY_RANK } from "@/lib/severity";

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

interface Progress {
  pct: number;
  daysElapsed: number;
  daysLeft: number;
  daysTotal: number;
  notStarted: boolean;
}

function computeProgress(c: Closure): Progress | null {
  if (!c.od || !c.do) return null;
  const start = new Date(c.od).getTime();
  const end = new Date(c.do).getTime();
  const now = Date.now();
  const total = end - start;
  if (total <= 0 || isNaN(total)) return null;
  const dayMs = 86_400_000;
  if (now < start) {
    return {
      pct: 0,
      daysElapsed: 0,
      daysLeft: Math.max(1, Math.ceil((end - now) / dayMs)),
      daysTotal: Math.ceil(total / dayMs),
      notStarted: true,
    };
  }
  const elapsed = Math.min(total, now - start);
  return {
    pct: Math.round((elapsed / total) * 100),
    daysElapsed: Math.floor(elapsed / dayMs),
    daysLeft: Math.max(0, Math.ceil((end - now) / dayMs)),
    daysTotal: Math.ceil(total / dayMs),
    notStarted: false,
  };
}

function ProgressBar({ p, dense }: { p: Progress; dense?: boolean }) {
  const urgent = p.daysLeft <= 7 && !p.notStarted;
  const barColor = urgent
    ? "bg-red"
    : p.notStarted
      ? "bg-ink/30"
      : "bg-blue";
  return (
    <div className={dense ? "" : ""}>
      <div
        className={
          "flex items-baseline justify-between text-[10px] font-bold uppercase tracking-[0.2em] " +
          (urgent ? "text-red" : "text-ink/60")
        }
        style={HEAD_FONT}
      >
        <span>
          {p.notStarted
            ? `Začíná za ${p.daysLeft} ${p.daysLeft === 1 ? "den" : p.daysLeft < 5 ? "dny" : "dní"}`
            : `${p.daysLeft} ${p.daysLeft === 1 ? "den" : p.daysLeft < 5 ? "dny" : "dní"} zbývá`}
        </span>
        <span className="text-ink/40">
          {p.daysElapsed}/{p.daysTotal}
        </span>
      </div>
      <div
        className={
          "mt-1 w-full overflow-hidden rounded-full bg-ink/10 " +
          (dense ? "h-1.5" : "h-2")
        }
      >
        <div
          className={"h-full rounded-full transition-all " + barColor}
          style={{ width: `${p.pct}%` }}
        />
      </div>
    </div>
  );
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
  const obvodParam = params.get("o");
  const { setArea } = useArea();

  function pushParams(next: { f?: TimeFilter; o?: string | null }) {
    const sp = new URLSearchParams(params.toString());
    if (next.f !== undefined) {
      if (next.f === "now") sp.delete("f");
      else sp.set("f", next.f);
    }
    if (next.o !== undefined) {
      if (next.o) sp.set("o", next.o);
      else sp.delete("o");
    }
    const q = sp.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  const visibleAll = useMemo(() => {
    // JSDI občas vrátí pro 1 fyzickou uzavírku víc záznamů (různé směry
    // / etapy). Dedupujem podle (name + oblast + od + do) — vizuálně i pro
    // počet uzavírek je to "1 uzavírka", ne 3.
    const filtered = closures.filter((c) => isInFilter(c, filter));
    const seen = new Set<string>();
    return filtered.filter((c) => {
      const key = `${c.name}|${c.oblast}|${c.od ?? ""}|${c.do ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filter]);

  const visible = useMemo(
    () =>
      obvodParam
        ? visibleAll.filter((c) => inArea(c.oblast, obvodParam))
        : visibleAll,
    [visibleAll, obvodParam],
  );

  const top5 = useMemo(() => {
    // Impact score: severity má větší váhu, hlavní průtah = bonus.
    // Major + Americká < Major + Dobřanská (= Američanka jde dřív)
    const score = (c: Closure) =>
      SEVERITY_RANK[c.severity ?? "minor"] * 2 +
      (HLAVNI_TAHY.has(c.name) ? 0 : 1);
    return [...visible]
      .sort((a, b) => {
        const sa = score(a);
        const sb = score(b);
        if (sa !== sb) return sa - sb;
        // tie-break: delší trvání = větší impact (Americká 6 týdnů > Lochotín 2 dny)
        const aLen =
          a.od && a.do
            ? new Date(a.do).getTime() - new Date(a.od).getTime()
            : 0;
        const bLen =
          b.od && b.do
            ? new Date(b.do).getTime() - new Date(b.od).getTime()
            : 0;
        return bLen - aLen;
      })
      .slice(0, 5);
  }, [visible]);

  const obvodCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const x of visibleAll) c[x.oblast] = (c[x.oblast] ?? 0) + 1;
    return c;
  }, [visibleAll]);

  const obvody = AREAS.filter((a) => a.id !== "all");
  const focusedObvod = obvodParam
    ? AREAS.find((a) => a.id === obvodParam)
    : null;

  const placeLabel = focusedObvod ? focusedObvod.short : "Plzeň";

  return (
    <div className="space-y-6 pb-8 md:space-y-10 md:pb-10">
      {/* ──────────────  COMPACT HEADER — datum + filter ────────────── */}
      <div className="flex flex-col gap-3 border-b-2 border-ink/90 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          style={HEAD_FONT}
          className="text-[10px] font-semibold uppercase tracking-[0.4em] text-ink/70"
        >
          {placeLabel} · {todayPretty()}
        </div>
        <TimeFilterChips
          value={filter}
          onChange={(f) => pushParams({ f })}
        />
      </div>

      {/* ──────────────  VALUE STATEMENT ────────────── */}
      <section className="space-y-3">
        <h1
          style={HEAD_FONT}
          className="text-3xl font-bold uppercase leading-[0.95] text-ink sm:text-4xl md:text-5xl"
        >
          <span className="text-blue">{visible.length}</span>{" "}
          {visible.length === 1
            ? "uzavírka"
            : visible.length < 5
              ? "uzavírky"
              : "uzavírek"}{" "}
          {focusedObvod ? `v ${focusedObvod.short}` : "v Plzni"} dnes.
        </h1>
        <p
          style={HEAD_FONT}
          className="text-base font-normal leading-snug text-ink/70 sm:text-lg"
        >
          {top5.length === 0
            ? "Dnes je klid — žádné velké uzavírky."
            : "Pětka, kterou nezapomeňte objet:"}
        </p>

        {focusedObvod && (
          <button
            type="button"
            onClick={() => pushParams({ o: null })}
            style={HEAD_FONT}
            className="inline-flex min-h-[40px] items-center gap-1 rounded-full border border-ink/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink/70 hover:border-blue hover:text-blue"
          >
            ← Celá Plzeň
          </button>
        )}
      </section>

      {/* ──────────────  10 OBVODŮ — picker nahoře, ať si Plzeňák hned vybere ────────────── */}
      <section>
        <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h2
            style={HEAD_FONT}
            className="text-xl font-bold uppercase leading-[0.95] text-ink sm:text-2xl md:text-3xl"
          >
            Najděte svůj obvod
          </h2>
          <p
            style={HEAD_FONT}
            className="text-sm font-normal text-ink/70"
          >
            Klik → pětka jen z vašeho obvodu.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-5">
          {obvody.map((a) => (
            <ObvodTile
              key={a.id}
              areaId={a.id}
              areaShort={a.short}
              areaLabel={a.label}
              count={obvodCounts[a.id] ?? 0}
              active={a.id === obvodParam}
              onClick={() =>
                pushParams({ o: a.id === obvodParam ? null : a.id })
              }
            />
          ))}
        </div>
      </section>

      {/* ──────────────  TOP 5 KARET ────────────── */}
      <section className="border-t-2 border-ink/90 pt-6 md:pt-10">
        <h2
          style={HEAD_FONT}
          className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-ink/70 sm:mb-5"
        >
          {focusedObvod
            ? `Pětka v ${focusedObvod.short}`
            : "Pětka v celé Plzni"}
        </h2>
        {top5.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-ink/30 bg-white p-8 text-center sm:p-10">
            <p
              style={HEAD_FONT}
              className="text-xl font-bold uppercase text-ink/60 sm:text-2xl"
            >
              V tomto filtru nic. 🎉
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
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
        <p
          style={HEAD_FONT}
          className="mt-3 text-right text-[10px] font-semibold uppercase tracking-[0.3em] text-ink/50"
        >
          zdroj SITmP / JSDI ŘSD
        </p>
      </section>

      {/* ──────────────  CTA → /mapa ────────────── */}
      <section className="ods-board rounded-3xl p-5 sm:p-8 md:p-12">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <div
              style={HEAD_FONT}
              className="text-[11px] font-bold uppercase tracking-[0.5em] text-sky"
            >
              Chcete víc?
            </div>
            <h2
              style={HEAD_FONT}
              className="mt-2 text-3xl font-bold uppercase leading-[0.95] text-white sm:mt-3 sm:text-4xl md:text-5xl"
            >
              Celá mapa Plzně.
            </h2>
            <p
              style={HEAD_FONT}
              className="mt-4 max-w-xl text-sm font-normal text-white/80 sm:mt-5 sm:text-base"
            >
              Všech {visibleAll.length} uzavírek najednou. Pro dispečery,
              řidiče autobusů a kohokoliv, kdo plánuje cestu na celý týden.
            </p>
            <Link
              href={
                obvodParam
                  ? `/mapa?o=${encodeURIComponent(obvodParam)}`
                  : "/mapa"
              }
              onClick={() => obvodParam && setArea(obvodParam)}
              style={HEAD_FONT}
              className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-blue transition-colors hover:bg-sky hover:text-white sm:mt-7 sm:w-auto sm:px-7"
            >
              Otevřít mapu
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
  3: 'Úsek určen z JSDI popisu („v úseku X po Y") a oklipnutý mezi OSM křižovatkami.',
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
  const progress = computeProgress(c);
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
        <div className="relative h-[180px] overflow-hidden border-b-2 border-ink/90 sm:h-[240px] md:col-span-5 md:h-auto md:border-b-0 md:border-r-2">
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
            className="ods-ribbon absolute left-3 top-3 sm:left-4 sm:top-4"
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
        <div className="relative flex flex-col justify-between p-5 sm:p-7 md:col-span-7 md:p-10">
          <div>
            <div
              style={HEAD_FONT}
              className={
                "stat text-[88px] leading-[0.82] sm:text-[120px] md:text-[160px] lg:text-[180px] " +
                rankColor
              }
              aria-hidden
            >
              {rank}.
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-3 sm:mt-4">
              <span
                style={HEAD_FONT}
                className="text-[10px] font-bold uppercase tracking-[0.35em] text-ink/70 sm:text-[11px]"
              >
                {c.oblast}
              </span>
              <span
                style={HEAD_FONT}
                className="text-[10px] font-bold uppercase tracking-[0.35em] text-blue sm:text-[11px]"
              >
                {date}
              </span>
            </div>
            <div
              style={HEAD_FONT}
              className="mt-2 text-3xl font-bold uppercase leading-[0.9] text-ink sm:mt-3 sm:text-5xl lg:text-6xl"
            >
              {c.name}
            </div>
            <p
              style={HEAD_FONT}
              className="mt-2 max-w-xl text-base font-normal leading-snug text-ink/75 sm:mt-3 sm:text-lg"
            >
              {c.akce}
            </p>
            {progress && (
              <div className="mt-5">
                <ProgressBar p={progress} />
              </div>
            )}
          </div>
          <div
            style={HEAD_FONT}
            className="mt-6 inline-flex min-h-[44px] w-fit items-center gap-2 rounded-full bg-blue px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.3em] text-white group-hover:bg-sky sm:mt-8"
          >
            Co se tam děje
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
      <div className="relative h-[160px] overflow-hidden border-b-2 border-ink/90 sm:h-[180px]">
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
      <div className="relative flex flex-1 flex-col p-4 sm:p-5">
        <div
          style={HEAD_FONT}
          className={
            "stat text-[64px] leading-[0.82] sm:text-[88px] " + rankColor
          }
          aria-hidden
        >
          {rank}.
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-3 sm:mt-3">
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
          className="mt-2 text-xl font-bold uppercase leading-[0.95] text-ink sm:text-2xl md:text-3xl"
        >
          {c.name}
        </div>
        <p
          style={HEAD_FONT}
          className="mt-2 text-sm font-normal leading-snug text-ink/75 sm:text-base"
        >
          {c.akce}
        </p>
        {progress && (
          <div className="mt-4">
            <ProgressBar p={progress} dense />
          </div>
        )}
        <div
          style={HEAD_FONT}
          className="mt-auto pt-4 text-[11px] font-bold uppercase tracking-[0.3em] text-blue group-hover:text-sky sm:pt-5"
        >
          Co se tam děje →
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
        className="stat relative text-[56px] font-bold leading-none sm:text-[72px] md:text-[88px]"
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

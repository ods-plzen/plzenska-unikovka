"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Closure } from "@/lib/types";
import { closures, closureById } from "@/lib/data";
import { AREAS, inArea } from "@/data/areas";
import { useArea } from "@/components/AreaProvider";
import { ClosurePanel } from "@/components/ClosurePanel";
import { TimeFilterChips } from "@/components/TimeFilterChips";
import { isInFilter, parseFilter, type TimeFilter } from "@/lib/timeFilter";
import { SEVERITY_RANK } from "@/lib/severity";

const SEVERITY_LABEL: Record<string, string> = {
  major: "Úplná uzavírka",
  medium: "Omezení",
  minor: "Drobné omezení",
};

const DAYS_CZ = [
  "Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota",
];
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

function todayBlock(): { weekday: string; date: string } {
  const d = new Date();
  return {
    weekday: DAYS_CZ[d.getDay()],
    date: `${d.getDate()}. ${MONTHS_CZ[d.getMonth()]} ${d.getFullYear()}`,
  };
}

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;
const SERIF_FONT = { fontFamily: "var(--font-newsreader), serif" } as const;

export function HomeView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filter: TimeFilter = parseFilter(params.get("f"));
  const selectedId = params.get("sel") ?? null;
  const obvodParam = params.get("o");
  const selected = selectedId ? closureById(selectedId) : null;
  const today = todayBlock();
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
    <div className="space-y-12 pb-10">
      {/* ────────────────  MASTHEAD  ──────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-y-2 border-ink py-3">
        <div
          style={HEAD_FONT}
          className="text-[10px] font-semibold uppercase tracking-[0.4em] text-ink/70"
        >
          {today.weekday} <span className="px-1.5">·</span> {today.date}
          <span className="px-1.5">·</span> ROČNÍK 1
        </div>
        <TimeFilterChips
          value={filter}
          onChange={(f) => pushParams({ f })}
        />
      </div>

      {/* ────────────────  HERO  ──────────────── */}
      <section className="grid gap-10 lg:grid-cols-12">
        <div className="reveal d1 lg:col-span-7">
          <div
            style={HEAD_FONT}
            className="text-[11px] font-semibold uppercase tracking-[0.5em] text-red"
          >
            Právě teď v Plzni
          </div>
          <h1
            style={HEAD_FONT}
            className="mt-5 text-[64px] font-bold uppercase leading-[0.88] text-ink sm:text-[88px] lg:text-[104px]"
          >
            {focusedObvod ? <>{focusedObvod.short}:</> : <>5 míst,</>}
            <br />
            která tě
            <br />
            <span
              style={SERIF_FONT}
              className="italic font-normal text-red"
            >
              teď nepustí.
            </span>
          </h1>
          <p
            style={SERIF_FONT}
            className="lead mt-7 max-w-md text-lg italic leading-snug text-ink/80"
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
              className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-ink/60 hover:text-red"
            >
              ← Zpět na celou Plzeň
            </button>
          )}
        </div>

        <div className="reveal d2 lg:col-span-5">
          {selected ? (
            <ClosurePanel
              c={selected}
              onClose={() => pushParams({ sel: null })}
            />
          ) : (
            <div className="rounded-3xl border-2 border-ink bg-white p-7">
              <div
                style={HEAD_FONT}
                className="text-[10px] font-semibold uppercase tracking-[0.4em] text-sky"
              >
                Jak to číst
              </div>
              <p
                style={SERIF_FONT}
                className="mt-3 text-lg italic leading-snug text-ink/80"
              >
                Karty níž jsou seřazené podle toho, jak moc tě uzavírka{" "}
                <strong className="not-italic font-semibold text-ink">
                  praští do dne
                </strong>{" "}
                — od úplných zákazů přes kyvadlovou dopravu po menší zúžení.
              </p>
              <p className="mt-4 text-sm text-muted">
                Klik na kteroukoliv kartu → detail vpravo. Klik na svůj obvod
                pod kartami → vidíš jen tvoje místo.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ────────────────  TOP 5  ──────────────── */}
      <section className="reveal d3">
        <div className="section-rule mb-5">
          <h2
            style={HEAD_FONT}
            className="text-[11px] font-semibold uppercase tracking-[0.4em] text-ink/70"
          >
            {focusedObvod
              ? `Top ${Math.min(top5.length, 5)} · ${focusedObvod.short}`
              : "Top 5 · celá Plzeň"}
          </h2>
        </div>

        {top5.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-ink/30 bg-white/40 p-10 text-center">
            <p style={SERIF_FONT} className="text-xl italic text-muted">
              V tomto filtru momentálně nic. 🎉
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {top5.map((c, idx) => (
              <RankCard
                key={c.id}
                c={c}
                rank={idx + 1}
                variant={idx === 0 ? "hero" : "medium"}
                onClick={() =>
                  pushParams({ sel: c.id === selectedId ? null : c.id })
                }
                selected={c.id === selectedId}
              />
            ))}
          </div>
        )}
      </section>

      {/* ────────────────  10 OBVODŮ  ──────────────── */}
      <section className="reveal d4 border-t-2 border-ink pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div
              style={HEAD_FONT}
              className="text-[11px] font-semibold uppercase tracking-[0.5em] text-red"
            >
              Tvůj obvod
            </div>
            <h2
              style={HEAD_FONT}
              className="mt-3 text-4xl font-bold uppercase leading-[0.92] text-ink sm:text-5xl"
            >
              Vyber, kde
              <br />
              <span style={SERIF_FONT} className="italic font-normal">
                bydlíš.
              </span>
            </h2>
          </div>
          <p
            style={SERIF_FONT}
            className="max-w-xs text-base italic text-ink/70"
          >
            Klik na svůj obvod → uvidíš top 5 jen tady u tebe. Mapa zůstává
            celá Plzeň.
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

      {/* ────────────────  CTA  ──────────────── */}
      <section className="reveal d5 border-t-2 border-ink pt-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div
              style={HEAD_FONT}
              className="text-[11px] font-semibold uppercase tracking-[0.5em] text-sky"
            >
              Pro otrlé
            </div>
            <h2
              style={HEAD_FONT}
              className="mt-3 text-4xl font-bold uppercase leading-[0.92] text-ink sm:text-5xl"
            >
              Chceš{" "}
              <span style={SERIF_FONT} className="italic font-normal text-red">
                všech {visibleAll.length}
              </span>{" "}
              na mapě?
            </h2>
            <p style={SERIF_FONT} className="mt-4 max-w-md text-lg italic text-ink/70">
              Velká mapa se všema červenýma puntíkama, čárama a obvody. Pro
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
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white transition-transform hover:-translate-y-0.5 hover:bg-red"
            >
              Otevři velkou mapu →
            </Link>
          </div>
          <div
            className="lg:col-span-5 rounded-3xl border-2 border-ink p-6"
            style={{ background: "var(--hero)", color: "#fff" }}
          >
            <div
              style={HEAD_FONT}
              className="text-[10px] font-semibold uppercase tracking-[0.4em] text-sky"
            >
              Data tečou odkud
            </div>
            <p
              style={SERIF_FONT}
              className="mt-3 text-lg italic leading-snug text-white/90"
            >
              SITmP <span className="not-italic">·</span> JSDI ŘSD{" "}
              <span className="not-italic">·</span> SUPERDIO{" "}
              <span className="not-italic">·</span> PMDP
            </p>
            <p className="mt-3 text-xs text-white/65">
              Aktualizováno denně v 7:00 ráno. Data jen z veřejných a
              oficiálních zdrojů.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ──────────────  RankCard  ────────────── */

function RankCard({
  c,
  rank,
  variant,
  onClick,
  selected,
}: {
  c: Closure;
  rank: number;
  variant: "hero" | "medium";
  onClick: () => void;
  selected: boolean;
}) {
  const sev = c.severity ?? "minor";
  const sevColor =
    sev === "major" ? "text-red" : sev === "medium" ? "text-blue" : "text-muted";
  const sevLabel = SEVERITY_LABEL[sev];
  const date = fmtDateRange(c);

  const baseShadow =
    "shadow-[3px_3px_0_0_var(--ods-blue)] hover:shadow-[6px_6px_0_0_var(--ods-red)]";
  const selShadow = selected
    ? " shadow-[6px_6px_0_0_var(--ods-red)] bg-card"
    : "";

  if (variant === "hero") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={
          "group relative col-span-1 overflow-hidden rounded-3xl border-2 border-ink bg-white p-7 text-left transition-all duration-150 sm:p-10 lg:col-span-12 " +
          baseShadow +
          selShadow
        }
      >
        <div
          style={HEAD_FONT}
          className="stat absolute -left-1 -top-3 text-[200px] leading-none text-red sm:text-[260px]"
          aria-hidden
        >
          {rank}.
        </div>
        <div className="relative ml-0 sm:ml-[180px] lg:ml-[260px]">
          <div className="flex items-start justify-between gap-3">
            <div
              style={HEAD_FONT}
              className={
                "text-[10px] font-semibold uppercase tracking-[0.4em] " + sevColor
              }
            >
              {sevLabel}
            </div>
            <span className="ods-chip">{c.oblast}</span>
          </div>
          <div
            style={HEAD_FONT}
            className="mt-5 text-[44px] font-bold uppercase leading-[0.9] text-ink sm:text-6xl lg:text-7xl"
          >
            {c.name}
          </div>
          <p
            style={SERIF_FONT}
            className="mt-4 max-w-xl text-xl italic leading-snug text-ink/75"
          >
            {c.akce}
          </p>
          <div
            style={HEAD_FONT}
            className="mt-6 flex flex-wrap items-baseline gap-4 text-xs font-semibold uppercase tracking-[0.25em] text-ink/60"
          >
            <span>{date}</span>
            <span aria-hidden>·</span>
            <span className="text-red">Klik pro detail →</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "group relative col-span-1 flex h-full flex-col overflow-hidden rounded-3xl border-2 border-ink bg-white p-6 text-left transition-all duration-150 lg:col-span-6 " +
        baseShadow +
        selShadow
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div
          style={HEAD_FONT}
          className="stat text-[88px] leading-none text-red"
          aria-hidden
        >
          {rank}.
        </div>
        <div className="text-right">
          <div
            style={HEAD_FONT}
            className={
              "text-[10px] font-semibold uppercase tracking-[0.35em] " + sevColor
            }
          >
            {sevLabel}
          </div>
          <span className="ods-chip mt-2 inline-flex">{c.oblast}</span>
        </div>
      </div>
      <div
        style={HEAD_FONT}
        className="mt-5 text-3xl font-bold uppercase leading-[0.95] text-ink sm:text-4xl"
      >
        {c.name}
      </div>
      <p
        style={SERIF_FONT}
        className="mt-2 text-base italic leading-snug text-ink/75"
      >
        {c.akce}
      </p>
      <div
        style={HEAD_FONT}
        className="mt-auto pt-5 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink/60"
      >
        {date} <span className="px-1 text-red">›</span>
      </div>
    </button>
  );
}

/* ──────────────  ObvodTile  ────────────── */

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
  const intensity =
    count === 0
      ? "calm"
      : count <= 3
        ? "low"
        : count <= 6
          ? "medium"
          : "high";
  const styles: Record<string, string> = {
    calm: "bg-white text-ink/55 border-ink/30",
    low: "bg-white text-ink border-ink",
    medium: "bg-amber/10 text-ink border-amber",
    high: "bg-red/10 text-ink border-red",
  };
  const dotStyles: Record<string, string> = {
    calm: "bg-ink/20",
    low: "bg-sky",
    medium: "bg-amber",
    high: "bg-red",
  };
  const localityLine = areaLabel.replace(/^Plzeň\s+\d+\s+—\s+/, "");
  const activeRing = active ? " ring-4 ring-red ring-offset-2 ring-offset-paper" : "";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "group relative flex aspect-square flex-col justify-between rounded-3xl border-2 p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--ods-blue)] " +
        styles[intensity] +
        activeRing
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div
          style={HEAD_FONT}
          className="text-[10px] font-semibold uppercase tracking-[0.3em] opacity-90"
        >
          Plzeň
        </div>
        <span
          className={
            "h-2 w-2 rounded-full " + dotStyles[intensity]
          }
          aria-hidden
        />
      </div>
      <div
        style={HEAD_FONT}
        className="stat text-[80px] leading-none sm:text-[96px]"
      >
        {num}
      </div>
      <div className="text-[10px] uppercase tracking-[0.15em] leading-tight opacity-80">
        {localityLine}
      </div>
      <div
        style={HEAD_FONT}
        className="absolute right-3 top-3 text-[10px] font-semibold uppercase tracking-[0.15em]"
      >
        {count} {count === 1 ? "uzavírka" : count < 5 ? "uzavírky" : "uzavírek"}
      </div>
    </button>
  );
}

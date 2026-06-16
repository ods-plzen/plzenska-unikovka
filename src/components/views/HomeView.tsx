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
      <section className="relative grid gap-10 lg:grid-cols-12">
        {/* watermark dekorace za hero textem */}
        <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
          <div
            style={{
              ...HEAD_FONT,
              transform: "rotate(-6deg)",
              color: "var(--ods-red)",
              opacity: 0.04,
            }}
            className="absolute -left-10 top-0 select-none text-[280px] font-bold uppercase leading-none sm:text-[420px]"
            aria-hidden
          >
            ÚNIKOVKA
          </div>
        </div>

        <div className="reveal d1 relative lg:col-span-7">
          {/* stamp postmark */}
          <div
            className="mb-5 inline-flex items-center gap-2 border-2 border-red px-3 py-1"
            style={{ ...HEAD_FONT, transform: "rotate(-2deg)" }}
            aria-hidden
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red">
              Aktivní · {today.date}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-red" />
          </div>

          <h1
            style={HEAD_FONT}
            className="text-[64px] font-bold uppercase leading-[0.88] text-ink sm:text-[88px] lg:text-[104px]"
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

function getCenter(c: Closure): [number, number] | null {
  const pt = c.ways?.[0]?.[0];
  if (!pt || pt.length < 2) return null;
  return [pt[0], pt[1]];
}

const TAPE_STYLE: React.CSSProperties = {
  background:
    "repeating-linear-gradient(45deg, #c0392b 0 14px, #ffd400 14px 28px)",
};

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
  const center = getCenter(c);

  const baseShadow =
    "shadow-[3px_3px_0_0_var(--ods-blue)] hover:shadow-[8px_8px_0_0_var(--ods-red)]";
  const selShadow = selected
    ? " shadow-[8px_8px_0_0_var(--ods-red)] bg-card"
    : "";

  if (variant === "hero") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={
          "group relative col-span-1 grid cursor-pointer grid-cols-1 overflow-hidden rounded-3xl border-2 border-ink bg-white text-left transition-all duration-150 md:grid-cols-12 lg:col-span-12 " +
          baseShadow +
          selShadow
        }
      >
        {/* obrázek: mini-mapa */}
        <div className="relative h-[200px] overflow-hidden border-b-2 border-ink md:col-span-5 md:h-auto md:border-b-0 md:border-r-2">
          {center ? (
            <MiniMap center={center} severity={sev} height={360} zoom={15} />
          ) : (
            <div className="h-full w-full bg-line" />
          )}
          {/* construction tape pruh */}
          <div
            className="absolute bottom-0 left-0 right-0 h-2"
            style={TAPE_STYLE}
            aria-hidden
          />
          {/* obrovský rank watermark na mapě */}
          <div
            style={HEAD_FONT}
            className="pointer-events-none absolute -bottom-12 -right-4 select-none text-[260px] font-bold leading-none text-white drop-shadow-[3px_3px_0_var(--ods-red)] sm:text-[320px]"
            aria-hidden
          >
            {rank}
          </div>
        </div>
        {/* tělo */}
        <div className="relative p-7 sm:p-9 md:col-span-7">
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
            className="mt-4 text-[40px] font-bold uppercase leading-[0.92] text-ink sm:text-5xl lg:text-6xl"
          >
            {c.name}
          </div>
          <p
            style={SERIF_FONT}
            className="mt-3 max-w-xl text-lg italic leading-snug text-ink/75"
          >
            {c.akce}
          </p>
          <div
            style={HEAD_FONT}
            className="mt-6 flex flex-wrap items-baseline gap-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-ink/60"
          >
            <span>{date}</span>
          </div>
          <div
            style={HEAD_FONT}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-red px-5 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-white group-hover:bg-ink"
          >
            Otevři detail
            <span aria-hidden className="text-base">→</span>
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
        "group relative col-span-1 flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border-2 border-ink bg-white text-left transition-all duration-150 lg:col-span-6 " +
        baseShadow +
        selShadow
      }
    >
      {/* obrázek mini-mapa */}
      <div className="relative h-[150px] overflow-hidden border-b-2 border-ink">
        {center ? (
          <MiniMap center={center} severity={sev} height={150} zoom={14} />
        ) : (
          <div className="h-full w-full bg-line" />
        )}
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5"
          style={TAPE_STYLE}
          aria-hidden
        />
        {/* rank watermark */}
        <div
          style={HEAD_FONT}
          className="pointer-events-none absolute -bottom-6 right-2 select-none text-[140px] font-bold leading-none text-white drop-shadow-[2px_2px_0_var(--ods-red)]"
          aria-hidden
        >
          {rank}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div
            style={HEAD_FONT}
            className={
              "text-[10px] font-semibold uppercase tracking-[0.35em] " + sevColor
            }
          >
            {sevLabel}
          </div>
          <span className="ods-chip">{c.oblast}</span>
        </div>
        <div
          style={HEAD_FONT}
          className="mt-4 text-2xl font-bold uppercase leading-[0.95] text-ink sm:text-3xl"
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
          className="mt-auto flex items-center justify-between gap-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-ink/60"
        >
          <span>{date}</span>
          <span className="text-red group-hover:text-ink">
            Klik →
          </span>
        </div>
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
        "group relative flex aspect-square cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border-2 p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--ods-blue)] " +
        styles[intensity] +
        activeRing
      }
    >
      {/* obří watermark číslo pozadí */}
      <div
        style={HEAD_FONT}
        className="pointer-events-none absolute -bottom-8 -right-4 select-none text-[180px] font-bold leading-none opacity-[0.08]"
        aria-hidden
      >
        {num}
      </div>
      <div className="relative flex items-start justify-between gap-2">
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
        className="relative stat text-[72px] leading-none sm:text-[88px]"
      >
        {num}
      </div>
      <div className="relative text-[10px] uppercase tracking-[0.15em] leading-tight opacity-80">
        {localityLine}
      </div>
      <div
        style={HEAD_FONT}
        className="absolute right-3 top-3 rounded-full border border-current/30 bg-paper/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em]"
      >
        {count} {count === 1 ? "uzavírka" : count < 5 ? "uzavírky" : "uzavírek"}
      </div>
      {/* hover prompt */}
      <div
        style={HEAD_FONT}
        className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-[0.2em] opacity-0 transition-opacity group-hover:opacity-100"
      >
        Klik →
      </div>
    </button>
  );
}

"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Closure } from "@/lib/types";
import { closures } from "@/lib/data";
import { HLAVNI_TAHY, SEVERITY_RANK } from "@/lib/severity";
import { MiniMap } from "@/components/map/MiniMap";

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;

const ALERT_RED = "#c0392b";

const SEVERITY_LABEL: Record<string, string> = {
  major: "úplná uzavírka",
  medium: "omezení provozu",
  minor: "drobné omezení",
};

const MONTHS_CZ = [
  "ledna", "února", "března", "dubna", "května", "června",
  "července", "srpna", "září", "října", "listopadu", "prosince",
];

function fmtCzDate(iso?: string | null): string | null {
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

function planYear(c: Closure): number {
  const m = c.termin.match(/20\d{2}/);
  return m ? parseInt(m[0], 10) : 2026;
}

function isActiveNow(c: Closure): boolean {
  if (c.status === "plan") return false;
  if (!c.od) return c.status === "now";
  const start = new Date(c.od).getTime();
  const end = c.do ? new Date(c.do).getTime() : Infinity;
  const now = Date.now();
  return start <= now && now <= end;
}

function daysLeftIfSoon(c: Closure): number | null {
  if (!c.do) return null;
  const end = new Date(c.do).getTime();
  const now = Date.now();
  if (end < now) return null;
  const days = Math.ceil((end - now) / 86_400_000);
  return days <= 14 ? days : null;
}

// Akce duplikuje severity label, když je oboje "úplná uzavírka / uzavřená
// silnice", "omezení provozu / omezení provozu" apod. Vrací true = vynech.
function isAkceRedundant(akce: string, severity: string): boolean {
  const a = akce.toLowerCase().trim();
  if (severity === "major") return /uzav[řr]en[áéí]\s+silnice|úplná uzavírka/.test(a);
  if (severity === "medium") return /omezení|jednosměrná|kyvadlová/.test(a);
  return false;
}

function impactScore(c: Closure): number {
  return (
    SEVERITY_RANK[c.severity ?? "minor"] * 2 +
    (HLAVNI_TAHY.has(c.name) ? 0 : 1)
  );
}

export function HomeView() {
  const visible = useMemo(() => {
    const seen = new Set<string>();
    return closures.filter((c) => {
      const key = `${c.name}|${c.oblast}|${c.od ?? ""}|${c.do ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  const nowList = useMemo(() => visible.filter(isActiveNow), [visible]);
  const planList = useMemo(
    () => visible.filter((c) => c.status === "plan"),
    [visible],
  );

  const topActive = useMemo(
    () =>
      [...nowList]
        .sort((a, b) => {
          const sa = impactScore(a);
          const sb = impactScore(b);
          if (sa !== sb) return sa - sb;
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
        .slice(0, 7),
    [nowList],
  );

  const planSooner = useMemo(
    () =>
      planList
        .filter((p) => planYear(p) <= 2026)
        .sort((a, b) => (a.od ?? "9").localeCompare(b.od ?? "9")),
    [planList],
  );
  const planLater = useMemo(
    () =>
      planList
        .filter((p) => planYear(p) >= 2027)
        .sort((a, b) => planYear(a) - planYear(b)),
    [planList],
  );

  return (
    <div className="space-y-7 pb-12 sm:space-y-9">
      {/* ────────  HERO COUNTER  ──────── */}
      <section className="border-y-[3px] border-ink py-5 sm:py-7">
        <div
          style={HEAD_FONT}
          className="grid grid-cols-[1fr_auto_1fr_auto] items-end gap-3 sm:gap-5"
        >
          <div>
            <div
              className="text-6xl font-bold leading-[0.85] sm:text-[6rem] md:text-[8rem]"
              style={{ color: ALERT_RED }}
            >
              {nowList.length}
            </div>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-ink/65 sm:mt-3 sm:text-[11px]">
              probíhá teď
            </div>
          </div>
          <div className="self-center text-5xl font-light leading-none text-ink/15 sm:text-7xl md:text-[6rem]">
            /
          </div>
          <div>
            <div className="text-6xl font-bold leading-[0.85] text-blue sm:text-[6rem] md:text-[8rem]">
              {planList.length}
            </div>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-ink/65 sm:mt-3 sm:text-[11px]">
              plánuje se
            </div>
          </div>
          <div className="self-start text-right text-[10px] font-bold uppercase tracking-[0.25em] text-ink/65 sm:text-[11px]">
            <div className="text-blue">Plzeň</div>
            <div className="mt-1 text-ink/45">{todayPretty()}</div>
          </div>
        </div>
        <div
          style={HEAD_FONT}
          className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t-2 border-ink/10 pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/55"
        >
          <span>Zdroj:</span>
          <span>SITmP</span>
          <span className="text-ink/25">·</span>
          <span>JSDI ŘSD</span>
          <span className="text-ink/25">·</span>
          <span>plzen.eu</span>
          <span className="ml-auto text-ink/45">Aktualizace denně 7:00</span>
        </div>
      </section>

      {/* ────────  TEĎ  ──────── */}
      {topActive.length > 0 ? (
        <Section title="Teď" count={nowList.length} accent="red">
          {topActive.map((c, i) => (
            <Row key={c.id} c={c} rank={i + 1} variant="now" />
          ))}
          {nowList.length > topActive.length && (
            <Link
              href="/seznam"
              style={HEAD_FONT}
              className="block py-3 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-blue hover:underline sm:text-[11px]"
            >
              + dalších {nowList.length - topActive.length} v seznamu →
            </Link>
          )}
        </Section>
      ) : (
        <Section title="Teď" count={0} accent="red">
          <div
            style={HEAD_FONT}
            className="py-8 text-center text-base font-bold uppercase text-ink/55 sm:text-lg"
          >
            Klid. Žádná aktivní uzavírka.
          </div>
        </Section>
      )}

      {/* ────────  PLÁN LÉTO 2026  ──────── */}
      {planSooner.length > 0 && (
        <Section
          title="V plánu na rok 2026"
          count={planSooner.length}
          note="Velké projekty, které město oznámilo, ale ještě nemají přesný start"
        >
          {planSooner.map((c, i) => (
            <Row key={c.id} c={c} rank={i + 1} variant="plan" />
          ))}
        </Section>
      )}

      {/* ────────  PLÁN 2027+  ──────── */}
      {planLater.length > 0 && (
        <Section
          title="V plánu na 2027 a dál"
          count={planLater.length}
          note="Velké projekty s víceletým horizontem"
        >
          {planLater.map((c, i) => (
            <Row key={c.id} c={c} rank={i + 1} variant="plan" />
          ))}
        </Section>
      )}

      {/* ────────  FOOTER MODE LINKS  ──────── */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-none border-2 border-ink bg-ink/90">
        <Link
          href="/mapa"
          style={HEAD_FONT}
          className="flex min-h-[64px] items-center justify-center bg-paper px-4 py-4 text-sm font-bold uppercase tracking-[0.3em] text-ink transition-colors hover:bg-blue hover:text-paper sm:text-base"
        >
          Mapa →
        </Link>
        <Link
          href="/seznam"
          style={HEAD_FONT}
          className="flex min-h-[64px] items-center justify-center bg-paper px-4 py-4 text-sm font-bold uppercase tracking-[0.3em] text-ink transition-colors hover:bg-blue hover:text-paper sm:text-base"
        >
          A–Z seznam →
        </Link>
      </div>
    </div>
  );
}

/* ────────  SECTION  ──────── */
function Section({
  title,
  count,
  note,
  accent = "blue",
  children,
}: {
  title: string;
  count: number;
  note?: string;
  accent?: "blue" | "red";
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 border-b-[3px] border-ink pb-2 sm:pb-3">
        <h2
          style={{ ...HEAD_FONT, color: accent === "red" ? ALERT_RED : undefined }}
          className={
            "text-2xl font-bold uppercase tracking-tight sm:text-3xl md:text-4xl " +
            (accent === "blue" ? "text-blue" : "")
          }
        >
          {title}
        </h2>
        <span
          style={HEAD_FONT}
          className="shrink-0 text-[10px] font-bold uppercase tracking-[0.3em] text-ink/55 sm:text-[11px]"
        >
          {count}{" "}
          {count === 1 ? "uzavírka" : count < 5 ? "uzavírky" : "uzavírek"}
        </span>
      </div>
      {note && (
        <div
          style={HEAD_FONT}
          className="border-b-2 border-ink/15 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/55 sm:text-[11px]"
        >
          {note}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}

/* ────────  ROW  ──────── */
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

function getDetourWays(c: Closure): [number, number][][] | undefined {
  if (!c.detourWays || c.detourWays.length === 0) return undefined;
  const filtered = c.detourWays.filter((w) => w.length >= 2);
  return filtered.length > 0 ? filtered : undefined;
}

function Row({
  c,
  rank,
  variant,
}: {
  c: Closure;
  rank: number;
  variant: "now" | "plan";
}) {
  const sev = c.severity ?? "minor";
  const sevLabel = SEVERITY_LABEL[sev];
  const isMajor = sev === "major";
  const dateRange = fmtDateRange(c);
  const dLeft = daysLeftIfSoon(c);
  const isVirtualOrPlanNoData = variant === "plan" && !c.od;
  const center = getCenter(c);
  const ways = getWays(c);
  const detourWays = getDetourWays(c);

  return (
    <Link
      href={`/doprava/${c.id}`}
      className="group flex items-start gap-3 border-b-2 border-ink/12 py-4 transition-colors last:border-b-0 hover:bg-blue/[0.04] sm:gap-4 sm:py-5"
    >
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div
          style={HEAD_FONT}
          className={
            "stat text-2xl font-bold leading-none transition-colors group-hover:text-blue sm:text-3xl md:text-4xl " +
            (variant === "plan" ? "text-ink/25" : "text-ink/30")
          }
          aria-hidden
        >
          {rank}.
        </div>
        {center && (
          <div
            className={
              "relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 border-ink/15 bg-line sm:h-[72px] sm:w-[72px] " +
              (variant === "plan" ? "opacity-70 grayscale-[35%]" : "")
            }
            aria-hidden
          >
            <MiniMap
              center={center}
              ways={ways}
              detourWays={detourWays}
              severity={sev}
              height={72}
              zoom={14}
            />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div
          style={HEAD_FONT}
          className="text-xl font-bold uppercase leading-tight text-ink sm:text-2xl md:text-[1.75rem]"
        >
          {c.name}
        </div>
        <div className="mt-1 text-sm leading-snug text-ink/65 sm:text-[15px]">
          {variant === "plan" ? (
            <span>{c.akce}</span>
          ) : (
            <>
              <span
                className={isMajor ? "font-semibold" : ""}
                style={isMajor ? { color: ALERT_RED } : undefined}
              >
                {sevLabel}
              </span>
              {/* Akce vynech, pokud je sémanticky duplicitní k sevLabel
                  (např. major + "Uzavřená silnice" = řekneš dvakrát totéž). */}
              {!isAkceRedundant(c.akce, sev) && (
                <>
                  {" · "}
                  <span className="text-ink/55">
                    {c.akce.toLowerCase()}
                  </span>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <div
        style={HEAD_FONT}
        className="shrink-0 text-right"
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue sm:text-[11px]">
          {c.oblast}
        </div>
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink/65 sm:text-[11px]">
          {dateRange}
        </div>
        {variant === "now" && dLeft !== null && (
          <div
            className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] sm:text-[11px]"
            style={{ color: ALERT_RED }}
          >
            {dLeft} {dLeft === 1 ? "den" : dLeft < 5 ? "dny" : "dní"} zbývá
          </div>
        )}
        {isVirtualOrPlanNoData && (
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-ink/45 sm:text-[11px]">
            Datum neznámé
          </div>
        )}
      </div>
    </Link>
  );
}


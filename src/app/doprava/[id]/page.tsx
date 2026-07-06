import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { closures, closureById, getExtra, getMhdInfo } from "@/lib/data";
import { ClosureMap } from "@/components/map/ClosureMap";
import { PhaseTimeline } from "@/components/PhaseTimeline";
import { StatusBadge } from "@/components/StatusBadge";
import { WatchButton } from "@/components/WatchButton";
import { ShareButton } from "@/components/ShareButton";
import { MhdBlock } from "@/components/MhdBlock";
import { FeedbackInlineCta } from "@/components/FeedbackInlineCta";
import {
  DetourSteps,
  KeyNumbers,
  MhdLineCards,
  ScopeIconsRow,
} from "@/components/InfoGraphics";
import { humanizeJsdi } from "@/lib/jsdiHumanize";

export function generateStaticParams() {
  return closures.map((c) => ({ id: c.id }));
}

// ISR — když někdo otevře detail a poslední build je starší než 60s,
// Next.js re-renderuje na pozadí (next request dostane fresh). Tím
// se Supabase edity (closure_extras) propagují bez deploye.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = closureById(id);
  if (!c) return { title: "Uzavírka" };
  return {
    title: `${c.name} (uzavírka, ${c.oblast})`,
    description: `${c.akce}. Termín: ${c.termin || "viz detail"}. MHD, objízdné trasy a zdroje.`,
  };
}

function midpoint(c: NonNullable<ReturnType<typeof closureById>>) {
  const pts = c.ways.flat();
  if (!pts.length) return null;
  return pts[Math.floor(pts.length / 2)];
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = closureById(id);
  if (!c) notFound();

  const [extra, mhd] = await Promise.all([
    getExtra(c.id),
    getMhdInfo(c.id),
  ]);
  const mid = midpoint(c);
  const navUrl = mid
    ? `https://www.google.com/maps/search/?api=1&query=${mid[0]},${mid[1]}`
    : null;

  // MhdLineCards je infografický redesign MhdBlock — preferujeme ho, pokud
  // mhd.reroutes obsahuje konkrétní lines. Jinak fallback na MhdBlock (legacy).
  const mhdHasLines = !!mhd?.reroutes?.some(
    (r) => r.lines && r.lines.length > 0,
  );

  return (
    <div className="space-y-6">
      <Link
        href="/seznam"
        className="text-sm font-medium text-blue hover:underline"
      >
        ← Zpět na seznam
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="ods-chip not-italic">{c.oblast}</span>
            <StatusBadge status={c.status} label={c.state} />
          </div>
          <h1 className="head mt-2 text-3xl font-bold text-ink sm:text-4xl">
            {c.name}
          </h1>
          <p className="mt-1 text-muted">{extra?.title ?? c.akce}</p>
          {extra?.sub && <p className="mt-1 text-sm text-ink/80">{extra.sub}</p>}
          {c.approx && (
            <p className="mt-1 text-xs text-amber">
              ≈ Poloha na mapě je přibližná (bodová stavba bez přesných
              souřadnic v datech).
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <WatchButton id={c.id} />
          <ShareButton
            title={`${c.name} — uzavírka (${c.oblast})`}
            text={c.akce}
          />
        </div>
      </header>

      {extra?.keyNumbers && <KeyNumbers items={extra.keyNumbers} />}

      <ClosureMap closures={[c]} height={360} />

      <FeedbackInlineCta context={c.name} />

      {extra?.scope && <ScopeIconsRow items={extra.scope} />}

      {extra?.detourSteps && <DetourSteps steps={extra.detourSteps} />}

      <div className="grid gap-6 md:grid-cols-2">
        {extra?.means && (
          <section className="rounded-xl border border-line bg-card p-5">
            <h2 className="head mb-3 text-lg font-semibold text-blue">
              Co to znamená
            </h2>
            <ul className="space-y-2 text-sm text-ink">
              {extra.means.map((m, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-sky">•</span>
                  <span dangerouslySetInnerHTML={{ __html: m }} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {extra?.objizdka && !extra?.detourSteps && (
          <section className="rounded-xl border border-line bg-card p-5">
            <h2 className="head mb-3 text-lg font-semibold text-blue">
              🔀 Objízdné trasy
            </h2>
            <ul className="space-y-2 text-sm text-ink">
              {extra.objizdka.map((m, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-sky">•</span>
                  <span dangerouslySetInnerHTML={{ __html: m }} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {mhdHasLines && mhd ? (
          <section className="rounded-xl border border-line bg-card p-5 md:col-span-2">
            <MhdLineCards info={mhd} />
          </section>
        ) : mhd ? (
          <MhdBlock info={mhd} />
        ) : extra?.mhd ? (
          <section className="rounded-xl border border-line bg-card p-5">
            <h2 className="head mb-3 text-lg font-semibold text-blue">
              🚌 MHD
            </h2>
            <ul className="space-y-2 text-sm text-ink">
              {extra.mhd.map((m, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-sky">•</span>
                  <span dangerouslySetInnerHTML={{ __html: m }} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {extra?.parkovani && (
          <section className="rounded-xl border border-line bg-card p-5">
            <h2 className="head mb-3 text-lg font-semibold text-blue">
              🅿️ Parkování
            </h2>
            <p className="text-sm text-ink">{extra.parkovani}</p>
          </section>
        )}

        {!extra && c.popis && (() => {
          const h = humanizeJsdi(c.popis);
          return (
            <section className="rounded-xl border border-line bg-card p-5 md:col-span-2">
              <h2 className="head mb-4 text-lg font-semibold text-blue">
                Co se tam děje
              </h2>

              {h.tags.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {h.tags.map((t, i) => {
                    const isClosure = /uzavírka/i.test(t);
                    return (
                      <span
                        key={i}
                        className={
                          "head rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] " +
                          (isClosure
                            ? "bg-red text-white"
                            : "bg-blue text-white")
                        }
                      >
                        {t}
                      </span>
                    );
                  })}
                </div>
              )}

              <dl className="grid gap-4 sm:grid-cols-2">
                {h.section && (
                  <div>
                    <dt className="head mb-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted">
                      Úsek
                    </dt>
                    <dd className="text-base font-medium text-ink">
                      {h.section}
                    </dd>
                  </div>
                )}
                {h.reason && (
                  <div>
                    <dt className="head mb-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted">
                      Kvůli čemu
                    </dt>
                    <dd className="text-base font-medium text-ink">
                      {h.reason}
                    </dd>
                  </div>
                )}
                {h.detour && (
                  <div className="sm:col-span-2">
                    <dt className="head mb-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted">
                      Objížďka
                    </dt>
                    <dd className="text-base font-medium text-ink">
                      {h.detour}
                    </dd>
                  </div>
                )}
                {h.issuer && (
                  <div>
                    <dt className="head mb-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted">
                      Vydal
                    </dt>
                    <dd className="text-base font-medium text-ink">
                      {h.issuer}
                    </dd>
                  </div>
                )}
              </dl>

              {h.remainder && (
                <p className="mt-5 border-t border-line pt-3 text-sm leading-relaxed text-ink/75">
                  {h.remainder}
                </p>
              )}

              <details className="mt-5 border-t border-line pt-3">
                <summary className="head cursor-pointer text-[10px] font-semibold uppercase tracking-[0.3em] text-muted hover:text-blue">
                  Surový text z JSDI
                </summary>
                <p className="mt-3 text-xs leading-relaxed text-muted whitespace-pre-line">
                  {c.popis}
                </p>
              </details>

              <p className="mt-4 text-xs text-muted">
                Zdroj: {c.zdroj || "JSDI"}
                {c.subtyp ? ` · ${c.subtyp}` : ""}
              </p>
            </section>
          );
        })()}

        {extra?.phases && (
          <section className="rounded-xl border border-line bg-card p-5 md:col-span-2">
            <h2 className="head mb-3 text-lg font-semibold text-blue">
              Harmonogram
            </h2>
            <PhaseTimeline phases={extra.phases} />
          </section>
        )}

        <section className="rounded-xl border border-line bg-card p-5 md:col-span-2">
          <h2 className="head mb-3 text-lg font-semibold text-blue">
            Základní info
          </h2>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Stav</dt>
              <dd className="font-medium text-ink">{c.state}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Obvod</dt>
              <dd className="font-medium text-ink">{c.oblast}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Termín</dt>
              <dd className="font-medium text-ink">{c.termin || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Popis</dt>
              <dd className="max-w-[60%] text-right font-medium text-ink">
                {c.akce}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            {navUrl && (
              <a
                href={navUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-blue px-3 py-1.5 text-sm font-medium text-white hover:bg-blue/90"
              >
                Navigovat v Mapách
              </a>
            )}
            <a
              href={extra?.source?.url ?? "https://agp.plzen.eu/app/uzavirky/"}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-blue hover:border-sky"
            >
              {extra?.source?.label ?? "Detail na mapě SITmP"}
            </a>
            <a
              href="https://www.pmdp.cz/cz/informace-o-preprave/zmeny-v-doprave/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-blue hover:border-sky"
            >
              MHD a výluky (PMDP)
            </a>
          </div>
          <p className="mt-3 text-xs text-muted">
            {extra?.source
              ? "Informace o uzavírce převzaty z oficiálního zdroje a ručně ověřeny."
              : `Zdroj: ${c.zdroj || "JSDI"} přes SITmP Mapu uzavírek (agp.plzen.eu).`}
          </p>
        </section>
      </div>
    </div>
  );
}

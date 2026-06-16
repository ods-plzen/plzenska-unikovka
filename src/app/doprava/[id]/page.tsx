import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { closures, closureById, extraFor, mhdInfoFor } from "@/lib/data";
import { ClosureMap } from "@/components/map/ClosureMap";
import { PhaseTimeline } from "@/components/PhaseTimeline";
import { StatusBadge } from "@/components/StatusBadge";
import { WatchButton } from "@/components/WatchButton";
import { MhdBlock } from "@/components/MhdBlock";

export function generateStaticParams() {
  return closures.map((c) => ({ id: c.id }));
}

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

  const extra = extraFor(c.id);
  const mhd = mhdInfoFor(c.id);
  const mid = midpoint(c);
  const navUrl = mid
    ? `https://www.google.com/maps/search/?api=1&query=${mid[0]},${mid[1]}`
    : null;

  return (
    <div className="space-y-6">
      <Link href="/doprava" className="text-sm font-medium text-blue hover:underline">
        ← Zpět na uzavírky
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="ods-chip not-italic">{c.oblast}</span>
            <StatusBadge status={c.status} label={c.state} />
          </div>
          <h1 className="head mt-2 text-3xl font-bold text-ink">{c.name}</h1>
          <p className="mt-1 text-muted">{extra?.title ?? c.akce}</p>
          {extra?.sub && <p className="mt-1 text-sm text-ink/80">{extra.sub}</p>}
          {c.approx && (
            <p className="mt-1 text-xs text-amber">
              ≈ Poloha na mapě je přibližná (bodová stavba bez přesných
              souřadnic v datech).
            </p>
          )}
        </div>
        <WatchButton id={c.id} />
      </header>

      <ClosureMap closures={[c]} height={360} />

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

        {extra?.objizdka && (
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

        {mhd ? (
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

        {!extra && c.popis && (
          <section className="rounded-xl border border-line bg-card p-5 md:col-span-2">
            <h2 className="head mb-3 text-lg font-semibold text-blue">
              Co JSDI hlásí
            </h2>
            <p className="text-sm leading-relaxed text-ink whitespace-pre-line">
              {c.popis}
            </p>
            <p className="mt-3 text-xs text-muted">
              Zdroj: {c.zdroj || "JSDI"}
              {c.subtyp ? ` · ${c.subtyp}` : ""}
            </p>
          </section>
        )}

        {extra?.phases && (
          <section className="rounded-xl border border-line bg-card p-5">
            <h2 className="head mb-3 text-lg font-semibold text-blue">
              Harmonogram
            </h2>
            <PhaseTimeline phases={extra.phases} />
          </section>
        )}

        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="head mb-3 text-lg font-semibold text-blue">
            Základní info
          </h2>
          <dl className="space-y-2 text-sm">
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

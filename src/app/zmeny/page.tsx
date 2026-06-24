import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllChanges,
  kindLabel,
  formatPublishedAt,
  type ChangelogEntry,
} from "@/lib/changelog";

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Co jsme změnili",
  description:
    "Historie změn Plzeňské únikovky. Co jsme opravili, přidali, a kdo nám to nahlásil.",
};

export default async function ZmenyPage() {
  const entries = await getAllChanges();

  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-8 border-b-2 border-ink pb-6 sm:mb-10">
        <p
          style={HEAD_FONT}
          className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/55 sm:text-xs"
        >
          Změny &amp; opravy
        </p>
        <h1
          style={HEAD_FONT}
          className="mt-1 text-3xl font-bold uppercase leading-tight sm:text-4xl"
        >
          Co jsme změnili
        </h1>
        <p className="mt-3 max-w-prose text-base text-ink/75 sm:text-lg">
          Většina věcí tu nevznikla v plánu. Vznikla, protože nám někdo napsal.
          Dole je seznam toho, co jsme díky vašim podnětům opravili nebo doplnili.
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="rounded-2xl border-2 border-ink/15 bg-paper p-6 text-base text-ink/65">
          Zatím tu nic není. Pošlete nám podnět, ať můžeme něco zlepšit.
        </p>
      ) : (
        <ol className="space-y-5">
          {entries.map((entry) => (
            <li key={entry.id}>
              <ChangeCard entry={entry} />
            </li>
          ))}
        </ol>
      )}

      <footer className="mt-12 border-t-2 border-ink/15 pt-8 text-center">
        <p className="text-sm text-ink/65">
          Něco nesedí nebo vám chybí?
        </p>
        <p className="mt-1 text-base">
          Klikněte na modré tlačítko vpravo dole nebo napište na{" "}
          <a
            className="text-blue underline decoration-blue/40 underline-offset-2 hover:decoration-blue"
            href="mailto:info@plzenskaunikovka.cz"
          >
            info@plzenskaunikovka.cz
          </a>
          .
        </p>
        <p className="mt-4">
          <Link
            href="/roadmap"
            style={HEAD_FONT}
            className="inline-block rounded-full bg-blue px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-blue-deep"
          >
            Hlasujte o další funkci →
          </Link>
        </p>
      </footer>
    </article>
  );
}

function ChangeCard({ entry }: { entry: ChangelogEntry }) {
  const kindStyle: Record<ChangelogEntry["kind"], string> = {
    fix: "bg-sky/20 text-sky",
    feature: "bg-blue/15 text-blue",
    data: "bg-ink/10 text-ink/70",
    event: "bg-amber-200/60 text-amber-900",
  };
  return (
    <article className="rounded-2xl border-2 border-ink/15 bg-paper p-5 transition-colors hover:border-ink/25 sm:p-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          style={HEAD_FONT}
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] ${kindStyle[entry.kind]}`}
        >
          {kindLabel(entry.kind)}
        </span>
        <time
          style={HEAD_FONT}
          className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45"
          dateTime={entry.published_at}
        >
          {formatPublishedAt(entry.published_at)}
        </time>
      </div>

      <h2
        style={HEAD_FONT}
        className="mt-2 text-lg font-bold uppercase leading-tight sm:text-xl"
      >
        {entry.title}
      </h2>

      {entry.body && (
        <p className="mt-2 text-base leading-relaxed text-ink/75">{entry.body}</p>
      )}

      {entry.attribution && (
        <p className="mt-3 border-l-2 border-sky pl-3 text-sm italic text-ink/65">
          {entry.attribution}
        </p>
      )}

      {entry.link_href && entry.link_label && (
        <p className="mt-4">
          <Link
            href={entry.link_href}
            style={HEAD_FONT}
            className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink/10"
          >
            {entry.link_label} <span aria-hidden>→</span>
          </Link>
        </p>
      )}
    </article>
  );
}

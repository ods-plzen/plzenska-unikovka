import Link from "next/link";
import type { Metadata } from "next";

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;

export const metadata: Metadata = {
  title: "Zdroje, licence a transparentnost",
  description:
    "Odkud bereme data, jak často, pod jakou licencí. Plzeňská únikovka.",
};

interface Source {
  name: string;
  url: string;
  what: string;
  basis: string;
  cadence: string;
}

const SOURCES: Source[] = [
  {
    name: "SITmP · agp.plzen.eu / ags.plzen.eu",
    url: "https://plzen.eu/obcan/doprava/",
    what:
      "Aktuální uzavírky a omezení provozu v Plzni (ArcGIS REST endpointy města Plzně).",
    basis:
      "Informace zveřejněné podle §5 zákona č. 106/1999 Sb. o svobodném přístupu k informacím. Bez personálních údajů.",
    cadence: "1× denně, ráno 7:07 (GitHub Action cron).",
  },
  {
    name: "JSDI · Ředitelství silnic a dálnic ČR",
    url: "https://mapa.dopravniinfo.cz/",
    what:
      "Údaje o uzavírkách a omezeních na pozemních komunikacích z Jednotného systému dopravních informací.",
    basis:
      "Veřejná služba podle §125 zákona č. 361/2000 Sb. o provozu na pozemních komunikacích. ŘSD provozuje JSDI s cílem informovat veřejnost.",
    cadence: "1× denně, společně s ostatními zdroji. Pouze metadata uzavírek, žádné personální údaje.",
  },
  {
    name: "PMDP · Plzeňské městské dopravní podniky",
    url: "https://www.pmdp.cz/cz/informace-o-preprave/zmeny-v-doprave/",
    what:
      "Veřejné stránky o změnách v MHD: odklony, dočasné zastávky, výluky.",
    basis:
      "Veřejná stránka pro občany. Respektujeme robots.txt PMDP — chodíme jen na URL, které nejsou v Disallow.",
    cadence: "1× denně. Plánujeme přechod na oficiální GTFS feed PMDP (Open Data Plzeň).",
  },
  {
    name: "OpenStreetMap · Overpass API",
    url: "https://www.openstreetmap.org/copyright",
    what:
      "Geometrie ulic (čáry segmentů) pro vykreslení na mapě a přiřazení do plzeňského obvodu.",
    basis:
      "Licence ODbL (Open Database License). Mapová dlaždice je atributována přímo na mapě.",
    cadence: "Cca 1× denně, jen pro nové uzavírky. Cachujeme, abychom šetřili Overpass.",
  },
];

export default function ZdrojeALicencePage() {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-8 border-b-2 border-ink pb-6 sm:mb-10">
        <p
          style={HEAD_FONT}
          className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/55 sm:text-xs"
        >
          Transparentnost
        </p>
        <h1
          style={HEAD_FONT}
          className="mt-1 text-3xl font-bold uppercase leading-tight sm:text-4xl"
        >
          Zdroje a licence
        </h1>
        <p className="mt-3 max-w-prose text-base text-ink/75 sm:text-lg">
          Plzeňská únikovka je agregátor informací, které město a stát už veřejně
          publikují. Tahle stránka je tu, abyste přesně viděli odkud, kdy a pod
          jakými pravidly data bereme.
        </p>
      </header>

      <section className="space-y-6 sm:space-y-8">
        {SOURCES.map((s) => (
          <SourceCard key={s.name} source={s} />
        ))}
      </section>

      <section className="mt-12 rounded-2xl border-2 border-ink/15 bg-paper p-6 sm:p-8">
        <h2
          style={HEAD_FONT}
          className="text-2xl font-bold uppercase leading-tight"
        >
          Jak respektujeme zdrojové servery
        </h2>
        <ul className="mt-4 space-y-3 text-base text-ink/80">
          <li>
            <strong className="text-ink">Identifikujeme se.</strong> Každý
            požadavek nese hlavičku{" "}
            <code className="rounded bg-ink/5 px-1.5 py-0.5 text-sm">
              PlzenskaUnikovka/2.0 (+plzenskaunikovka.cz/zdroje-a-licence;
              info@plzenskaunikovka.cz)
            </code>
            . Provozovatel zdroje nás dokáže najít a kontaktovat.
          </li>
          <li>
            <strong className="text-ink">Respektujeme robots.txt.</strong>{" "}
            Chodíme jen na URL, které nejsou v <code>Disallow</code>.
          </li>
          <li>
            <strong className="text-ink">Šetříme.</strong> Stahujeme 1× denně.
            Žádné polling, žádné rychlé opakované dotazy. Build statické stránky
            cachujeme v Next.js a Vercelu.
          </li>
          <li>
            <strong className="text-ink">Připisujeme zdroj.</strong> U každé
            uzavírky vidíte, odkud info pochází, plus odkaz na originál.
          </li>
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border-2 border-blue/30 bg-blue/5 p-6 sm:p-8">
        <h2
          style={HEAD_FONT}
          className="text-2xl font-bold uppercase leading-tight text-blue"
        >
          Co tu nedaří­me
        </h2>
        <ul className="mt-4 space-y-3 text-base text-ink/80">
          <li>
            <strong className="text-ink">Žádné osobní údaje.</strong> Agregujeme
            jen názvy ulic, data, čísla linek a popisy odklonů.
          </li>
          <li>
            <strong className="text-ink">Žádné sledování návštěvníků.</strong>{" "}
            Bez cookies, bez fingerprintingu. Analytika (Vercel Analytics)
            anonymně sčítá zobrazení stránek.
          </li>
          <li>
            <strong className="text-ink">
              Místní úložiště jen pro vaše pohodlí.
            </strong>{" "}
            Prohlížeč si u vás lokálně pamatuje čistě funkční věci: které
            uzavírky hlídáte, vybraný obvod, pro co jste hlasovali na roadmapě
            a že jste zavřeli lištu nebo nabídku e-mailů (ať vám je nenabízíme
            pořád dokola). Nic z toho se neposílá na server a nejde z toho
            nikoho identifikovat. E-mail ukládáme, jen když nám ho sami dáte a
            potvrdíte ho.
          </li>
          <li>
            <strong className="text-ink">Žádné prolamování přístupů.</strong>{" "}
            Vše bereme z veřejných HTTP endpointů, žádné login, žádné API klíče
            třetích stran.
          </li>
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border-2 border-ink/15 bg-paper p-6 sm:p-8">
        <h2
          style={HEAD_FONT}
          className="text-2xl font-bold uppercase leading-tight"
        >
          Kontakt
        </h2>
        <p className="mt-3 text-base text-ink/80">
          Provozuje <strong className="text-ink">ODS Plzeň-město</strong>.
          Technicky postaveno jako otevřená služba pro Plzeňany.
        </p>
        <p className="mt-3 text-base text-ink/80">
          Připadá vám něco špatně, máte žádost o stažení záznamu, nebo jste
          provozovatel zdroje a chcete koordinaci?
        </p>
        <p className="mt-3 text-base">
          <a
            className="text-blue underline decoration-blue/40 underline-offset-2 hover:decoration-blue"
            href="mailto:info@plzenskaunikovka.cz"
          >
            info@plzenskaunikovka.cz
          </a>
        </p>
        <p className="mt-6 text-sm text-ink/55">
          Odpovídáme do 24 hodin v pracovní dny.
        </p>
      </section>

      <footer className="mt-12 border-t-2 border-ink/15 pt-8 text-center">
        <p>
          <Link
            href="/zmeny"
            style={HEAD_FONT}
            className="inline-block rounded-full bg-ink/5 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink/10"
          >
            Co jsme změnili na základě podnětů →
          </Link>
        </p>
      </footer>
    </article>
  );
}

function SourceCard({ source }: { source: Source }) {
  return (
    <article className="rounded-2xl border-2 border-ink/15 bg-paper p-6 sm:p-7">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h2
          style={HEAD_FONT}
          className="text-xl font-bold uppercase leading-tight sm:text-2xl"
        >
          {source.name}
        </h2>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          style={HEAD_FONT}
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue hover:text-blue-deep"
        >
          Otevřít zdroj ↗
        </a>
      </header>

      <dl className="mt-4 space-y-3 text-base">
        <div>
          <dt
            style={HEAD_FONT}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/55"
          >
            Co odsud bereme
          </dt>
          <dd className="mt-1 text-ink/80">{source.what}</dd>
        </div>
        <div>
          <dt
            style={HEAD_FONT}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/55"
          >
            Právní podklad
          </dt>
          <dd className="mt-1 text-ink/80">{source.basis}</dd>
        </div>
        <div>
          <dt
            style={HEAD_FONT}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/55"
          >
            Frekvence
          </dt>
          <dd className="mt-1 text-ink/80">{source.cadence}</dd>
        </div>
      </dl>
    </article>
  );
}

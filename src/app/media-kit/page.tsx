import type { Metadata } from "next";
import Link from "next/link";
import { closures } from "@/lib/data";

export const metadata: Metadata = {
  title: "Press kit — Plzeňská únikovka",
  description:
    "Materiály pro novináře. Klíčová fakta, citace, tisková zpráva, kontakty, brand assety ke stažení.",
};

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;

const ASSETS: { file: string; label: string; description: string }[] = [
  { file: "logo-horizontal.svg", label: "Logo horizontální", description: "Pro hlavičky článků a online media" },
  { file: "logo-stacked.svg", label: "Logo vertikální", description: "Pro printové formáty a square use" },
  { file: "icon-on-blue.svg", label: "Ikona na modrém", description: "Sociální profil, favicon" },
  { file: "icon-full.svg", label: "Ikona glyph", description: "Bílá silnice na transparentu" },
  { file: "icon-reverse.svg", label: "Ikona reverse", description: "Modrá silnice na bílém, pro tisk" },
  { file: "icon-mono-dark.svg", label: "Ikona mono dark", description: "Černobílá pro print B&W" },
];

export default function Page() {
  const activeCount = closures.filter(
    (c) => c.status === "now" && c.od,
  ).length;
  const planCount = closures.filter((c) => c.status === "plan").length;

  return (
    <article className="mx-auto max-w-4xl space-y-12 pb-12 text-ink">
      <header className="space-y-4 border-b-[3px] border-ink pb-6">
        <Link
          href="/"
          style={HEAD_FONT}
          className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue hover:underline"
        >
          ← Zpět na úvod
        </Link>
        <div
          style={HEAD_FONT}
          className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue"
        >
          Press kit
        </div>
        <h1
          style={HEAD_FONT}
          className="text-4xl font-bold uppercase leading-[0.95] sm:text-5xl md:text-6xl"
        >
          Plzeňská únikovka
        </h1>
        <p
          style={HEAD_FONT}
          className="text-base font-semibold uppercase tracking-[0.3em] text-sky sm:text-lg"
        >
          Víte, kudy ven.
        </p>
        <p className="max-w-2xl text-base text-ink/70 sm:text-lg">
          Materiály pro novináře a redakce: tisková zpráva, klíčová fakta,
          oficiální citace, kontakty pro média a brand assety ke stažení.
        </p>
        <p
          style={HEAD_FONT}
          className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink/55"
        >
          Embargo zrušeno · spuštěno 18. 6. 2026
        </p>
      </header>

      {/* ─── STRUČNĚ (BOILERPLATE) ─── */}
      <section className="space-y-4">
        <H2>1. Stručně</H2>
        <Quoteable>
          Plzeňská únikovka (plzenskaunikovka.cz) je veřejně dostupný
          informační web, který poprvé spojuje na jednom místě data o všech
          uzavírkách, opravách a plánovaných stavebních projektech v Plzni.
          Stránka sbírá živá data ze čtyř oficiálních zdrojů (SITmP, JSDI
          ŘSD, PMDP, plzen.eu) a denně je aktualizuje. Aplikaci spustilo
          oblastní sdružení ODS Plzeň-město jako bezplatnou veřejnou službu
          pro plzeňské řidiče, cestující MHD a obyvatele.
        </Quoteable>
        <p className="text-sm text-ink/55">
          Tento odstavec lze použít beze změny v článku jako popis projektu.
        </p>
      </section>

      {/* ─── KLÍČOVÁ FAKTA ─── */}
      <section className="space-y-4">
        <H2>2. Klíčová fakta</H2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Fact label="Datum spuštění" value="18. 6. 2026" />
          <Fact label="Provozovatel" value="ODS Plzeň-město" />
          <Fact label="Web" value="plzenskaunikovka.cz" />
          <Fact label="Cena pro uživatele" value="Zdarma, bez registrace" />
          <Fact
            label="Aktuálně probíhajících uzavírek"
            value={`${activeCount}`}
            note="Živé číslo v okamžiku načtení stránky"
          />
          <Fact
            label="Plánovaných velkých projektů"
            value={`${planCount}`}
            note="Mj. Masarykova, Domažlická, Sady Pětatřicátníků, Náměstí Republiky"
          />
          <Fact label="Datové zdroje" value="4 oficiální" note="SITmP, JSDI ŘSD, PMDP, plzen.eu/doprava" />
          <Fact label="Aktualizace dat" value="Denně 7:00" />
          <Fact label="Mobilní podpora" value="Plně responzivní" />
          <Fact label="Cookies, tracking, registrace" value="Nic" />
        </div>
      </section>

      {/* ─── CITACE ─── */}
      <section className="space-y-4">
        <H2>3. Oficiální citace</H2>
        <Quoteable attribution="Lukáš Hegner, zastupitel města Plzně za ODS, kandidát Plzeň 4 Doubravka">
          Plzeň má dnes 48 probíhajících uzavírek a další 4 velké projekty
          v plánu. Než jsme dali dohromady únikovku, musel si Plzeňan
          informace dohledat na čtyřech různých webech. To už není potřeba.
          Mapa, harmonogram, objízdné trasy i MHD odklony jsou na jednom
          místě.
        </Quoteable>
        <p className="text-sm text-ink/55">
          Pro další citace (na konkrétní téma — Masarykova, Americká, Bílá
          Hora, MHD) kontaktujte tiskové oddělení níže.
        </p>
      </section>

      {/* ─── TISKOVÁ ZPRÁVA ─── */}
      <section className="space-y-4">
        <H2>4. Tisková zpráva</H2>
        <PressRelease />
      </section>

      {/* ─── ASSETY KE STAŽENÍ ─── */}
      <section className="space-y-4">
        <H2>5. Materiály ke stažení</H2>
        <p className="text-sm text-ink/70">
          Všechny logové assety jsou vektorové SVG (lze libovolně zvětšit).
          Pro print vyžadující CMYK nebo PDF kontaktujte tiskové oddělení.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {ASSETS.map((a) => (
            <li
              key={a.file}
              className="flex items-center gap-3 rounded-xl border-2 border-ink/15 bg-paper p-3 sm:p-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/brand/${a.file}`}
                alt=""
                className="h-12 w-12 shrink-0 rounded-md bg-ink/5"
              />
              <div className="min-w-0 flex-1">
                <div
                  style={HEAD_FONT}
                  className="text-sm font-bold uppercase tracking-tight"
                >
                  {a.label}
                </div>
                <div className="text-xs text-ink/55">{a.description}</div>
                <a
                  href={`/brand/${a.file}`}
                  download
                  style={HEAD_FONT}
                  className="mt-1 inline-block text-[11px] font-bold uppercase tracking-[0.25em] text-blue hover:underline"
                >
                  Stáhnout SVG →
                </a>
              </div>
            </li>
          ))}
        </ul>
        <div className="rounded-xl border border-line bg-card p-4 text-sm text-ink/80">
          <strong>Brand paleta:</strong> ODS modrá tmavá #153D8A, ODS modrá
          světlá #009FE3, alert červená #C0392B (pouze úplné uzavírky),
          paper #F7F4EC, ink #0B1320. Typografie:{" "}
          <strong>Oswald Bold</strong> pro titulky.
        </div>
      </section>

      {/* ─── KONTAKT PRO MÉDIA ─── */}
      <section className="space-y-4">
        <H2>6. Kontakt pro média</H2>
        <div className="grid gap-4 md:grid-cols-2">
          <ContactCard
            role="Tisková mluva ODS Plzeň-město"
            name="Oblastní předsednictvo"
            email="press@plzenskaunikovka.cz"
            note="Citace, vyjádření, koordinace rozhovorů"
          />
          <ContactCard
            role="Technické dotazy / data"
            name="Uhumdrum s.r.o. (provozovatel platformy)"
            email="info@plzenskaunikovka.cz"
            note="Datové zdroje, technické aspekty, statistiky"
          />
        </div>
        <p className="text-sm text-ink/55">
          Odpovídáme do 24 hodin v pracovní dny. Pro urgentní záležitosti
          telefonický kontakt poskytneme po obdržení e-mailu.
        </p>
      </section>

      {/* ─── FAQ ─── */}
      <section className="space-y-4">
        <H2>7. Časté otázky</H2>
        <Faq
          q="Kdo Plzeňskou únikovku financuje a provozuje?"
          a="Provozovatelem je oblastní sdružení ODS Plzeň-město. Technickou stránku platformy zajišťuje Uhumdrum s.r.o. jako zpracovatel dle smlouvy o zpracování osobních údajů. Web je pro uživatele zdarma, bez reklamy a bez cookies pro tracking."
        />
        <Faq
          q="Odkud bere data? Jsou ověřená?"
          a="Ze čtyř oficiálních zdrojů: SITmP (městská GIS služba agp.plzen.eu), JSDI ŘSD (federální systém dopravních informací), PMDP (městské dopravní podniky pro MHD odklony) a plzen.eu/doprava (oficiální tabulka plánovaných projektů města). Data se stahují denně v 7:00 ráno. Žádná data se nevymýšlí, vše je převzato a odkazované."
        />
        <Faq
          q="Je to politická stránka?"
          a="Ne, je to servisní informační nástroj. Stránka neobsahuje politické sliby, kampaňové výzvy ani volební obsah. Provozovatel (ODS Plzeň-město) je uveden v patičce a v tomto press kitu. Web sleduje uzavírky bez ohledu na to, kdo z koaličního nebo opozičního spektra je za projekt zodpovědný."
        />
        <Faq
          q="Sleduje uživatele? Cookies, tracking?"
          a="Ne. Aplikace nepoužívá analytické nástroje, reklamní cookies ani fingerprinting. Jediné, co se ukládá lokálně v prohlížeči, je volba sledovaných uzavírek (localStorage), která neopouští zařízení uživatele. Politika ochrany osobních údajů je dostupná na ods.cz/osobni-udaje."
        />
        <Faq
          q="Kolik uzavírek aplikace pokrývá?"
          a={`Aktuálně ${activeCount} probíhajících uzavírek a ${planCount} plánovaných velkých projektů. Live čísla jsou viditelná na úvodní stránce a aktualizují se denně. Pokrytí: veškerá data z JSDI a SITmP pro celé území města Plzeň + plánované velké projekty z plzen.eu.`}
        />
        <Faq
          q="Kdo má autorská práva k mapovým podkladům?"
          a="Mapové dlaždice: © OpenStreetMap přispěvatelé, © CARTO. Data o uzavírkách: oficiální zdroje (SITmP, JSDI ŘSD, PMDP, plzen.eu). Logo a brand Plzeňské únikovky: ODS Plzeň-město."
        />
      </section>

      {/* ─── DOPLŇUJÍCÍ INFO ─── */}
      <section className="space-y-4">
        <H2>8. Doplňující materiály</H2>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>Live mapa všech uzavírek:</strong>{" "}
            <Link href="/mapa" className="text-blue hover:underline">
              plzenskaunikovka.cz/mapa
            </Link>
          </li>
          <li>
            <strong>Plný seznam uzavírek:</strong>{" "}
            <Link href="/seznam" className="text-blue hover:underline">
              plzenskaunikovka.cz/seznam
            </Link>
          </li>
          <li>
            <strong>Detail Masaryčky (hlavní téma launchu):</strong>{" "}
            <Link
              href="/doprava/masarykova"
              className="text-blue hover:underline"
            >
              plzenskaunikovka.cz/doprava/masarykova
            </Link>
          </li>
        </ul>
      </section>
    </article>
  );
}

/* ─── Helpery ─── */

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={HEAD_FONT}
      className="border-b-2 border-blue pb-2 text-2xl font-bold uppercase text-blue sm:text-3xl"
    >
      {children}
    </h2>
  );
}

function Fact({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl border-2 border-ink/15 bg-paper p-4">
      <div
        style={HEAD_FONT}
        className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink/55"
      >
        {label}
      </div>
      <div
        style={HEAD_FONT}
        className="mt-1 text-xl font-bold uppercase leading-tight text-ink sm:text-2xl"
      >
        {value}
      </div>
      {note && <div className="mt-1 text-xs text-ink/55">{note}</div>}
    </div>
  );
}

function Quoteable({
  children,
  attribution,
}: {
  children: React.ReactNode;
  attribution?: string;
}) {
  return (
    <blockquote className="rounded-xl border-l-4 border-blue bg-paper p-5">
      <p className="text-base leading-relaxed text-ink sm:text-lg">
        {children}
      </p>
      {attribution && (
        <footer
          style={HEAD_FONT}
          className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/65"
        >
          — {attribution}
        </footer>
      )}
    </blockquote>
  );
}

function PressRelease() {
  return (
    <div className="rounded-xl border-2 border-ink/15 bg-paper p-5 sm:p-6">
      <div
        style={HEAD_FONT}
        className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-ink/55"
      >
        TISKOVÁ ZPRÁVA · 18. 6. 2026 · Plzeň
      </div>
      <h3
        style={HEAD_FONT}
        className="text-2xl font-bold uppercase leading-tight text-ink sm:text-3xl"
      >
        V Plzni vznikla mapa všech uzavírek. Plzeňská únikovka spojuje
        čtyři oficiální zdroje na jednom místě.
      </h3>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/85 sm:text-base">
        <p>
          <strong>Plzeň, 18. června 2026</strong> — Oblastní sdružení ODS
          Plzeň-město dnes spouští webovou aplikaci plzenskaunikovka.cz,
          která jako první v Plzni spojuje na jednom místě data o všech
          uzavírkách, MHD odklonech a plánovaných stavebních projektech.
          Aplikace je zdarma, nevyžaduje registraci a sbírá data ze čtyř
          oficiálních zdrojů: městské GIS služby SITmP, federálního systému
          JSDI ŘSD, Plzeňských městských dopravních podniků (PMDP) a
          oficiální tabulky plánovaných projektů na plzen.eu.
        </p>
        <p>
          Konkrétním podnětem byla rekonstrukce Masarykovy ulice v
          Doubravce. „Před 14 dny jsem se na zastupitelstvu zeptal náměstka
          Tolara, kam si Doubravčan klikne, aby zjistil, kudy 29. června
          pojede ráno do práce. Odpověď byla &bdquo;plzen.eu lomeno doprava&ldquo;.
          U Masarykovy ulice jsem ale našel jen odkaz na článek z března,
          kde stojí, že občané budou informováni včas. Žádná mapa, žádné
          objízdné trasy, žádný harmonogram," vysvětluje Lukáš Hegner,
          zastupitel města Plzně.
        </p>
        <p>
          Plzeňská únikovka řeší přesně tento problém. V okamžiku spuštění
          obsahuje aktuální mapu všech probíhajících uzavírek v Plzni, čtyři
          plánované velké projekty (Masarykova ulice, Domažlická, Sady
          Pětatřicátníků a Náměstí Republiky) a kompletní detaily MHD
          odklonů linek 29, 30, N3 a N6, které začínají od 29. června v
          souvislosti s rekonstrukcí Masarykovy ulice.
        </p>
        <p>
          Aplikace je provozována jako veřejná služba bez reklamy, bez sběru
          osobních údajů a bez cookies pro tracking.
        </p>
        <p className="text-xs text-ink/55">
          <strong>O Plzeňské únikovce:</strong> Veřejně dostupný informační
          web s mapou všech uzavírek, MHD odklonů a plánovaných stavebních
          projektů v Plzni. Provozuje ODS Plzeň-město. Spuštěno 18. 6. 2026.
          plzenskaunikovka.cz
        </p>
      </div>
    </div>
  );
}

function ContactCard({
  role,
  name,
  email,
  note,
}: {
  role: string;
  name: string;
  email: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl border-2 border-ink/15 bg-paper p-5">
      <div
        style={HEAD_FONT}
        className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue"
      >
        {role}
      </div>
      <div
        style={HEAD_FONT}
        className="mt-2 text-base font-bold uppercase text-ink sm:text-lg"
      >
        {name}
      </div>
      <a
        href={`mailto:${email}`}
        className="mt-2 inline-block text-sm font-semibold text-blue hover:underline"
      >
        {email}
      </a>
      {note && (
        <p className="mt-2 text-xs leading-relaxed text-ink/55">{note}</p>
      )}
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="rounded-xl border-2 border-ink/15 bg-paper p-4 sm:p-5">
      <summary
        style={HEAD_FONT}
        className="cursor-pointer text-sm font-bold uppercase tracking-tight text-ink sm:text-base"
      >
        {q}
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-ink/80">{a}</p>
    </details>
  );
}

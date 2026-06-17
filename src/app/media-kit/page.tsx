import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Media kit — Plzeňská únikovka",
  description:
    "Vše, co potřebují ODS členové a kandidáti k představení Plzeňské únikovky — logo, talking points, hotové copy, brand pravidla.",
};

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;

const ASSETS: { file: string; label: string; description: string }[] = [
  {
    file: "icon-full.svg",
    label: "Ikona glyph",
    description: "Bílá silnice na transparentu, pro headery a fotky",
  },
  {
    file: "icon-on-blue.svg",
    label: "Ikona na ODS modré",
    description: "Favicon, app icon, sociální profil",
  },
  {
    file: "icon-reverse.svg",
    label: "Ikona reverse",
    description: "Modrá silnice na bílém, pro tisk",
  },
  {
    file: "icon-mono-dark.svg",
    label: "Ikona mono dark",
    description: "B&W na světlém pozadí",
  },
  {
    file: "icon-mono-light.svg",
    label: "Ikona mono light",
    description: "B&W na tmavém pozadí",
  },
  {
    file: "logo-horizontal.svg",
    label: "Logo horizontální",
    description: "Ikona, wordmark a tagline na modré",
  },
  {
    file: "logo-stacked.svg",
    label: "Logo vertikální",
    description: "Plakát a square formats",
  },
];

const COLORS: { name: string; hex: string; use: string }[] = [
  { name: "ODS modrá tmavá", hex: "#153D8A", use: "Headlines, brand" },
  { name: "ODS modrá světlá", hex: "#009FE3", use: "Action, accent" },
  { name: "Alert červená", hex: "#C0392B", use: "Pouze úplné uzavírky" },
  { name: "Detour zelená", hex: "#15803D", use: "Pouze objízdné trasy" },
  { name: "Paper", hex: "#F7F4EC", use: "Pozadí" },
  { name: "Ink", hex: "#0B1320", use: "Body text" },
];

export default function Page() {
  return (
    <article className="mx-auto max-w-4xl space-y-12 pb-12 text-ink">
      <header className="space-y-3 border-b-[3px] border-ink pb-6">
        <Link
          href="/"
          style={HEAD_FONT}
          className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue hover:underline"
        >
          ← Zpět na úvod
        </Link>
        <h1
          style={HEAD_FONT}
          className="text-4xl font-bold uppercase leading-[0.95] sm:text-5xl md:text-6xl"
        >
          Media kit
        </h1>
        <p
          style={HEAD_FONT}
          className="text-base font-semibold uppercase tracking-[0.3em] text-sky sm:text-lg"
        >
          Víte, kudy ven.
        </p>
        <p className="max-w-2xl text-base text-ink/70 sm:text-lg">
          Pro ODS Plzeň-město členy a kandidáty. Vše, co potřebujete
          k tomu, abyste mohli stránku představit svým sousedům, voličům
          a kolegům.
        </p>
        <p
          style={HEAD_FONT}
          className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink/55"
        >
          Spuštěno 18. 6. 2026 · provozuje ODS Plzeň-město
        </p>
      </header>

      {/* ─── CO TO JE ─── */}
      <section className="space-y-4">
        <h2
          style={HEAD_FONT}
          className="border-b-2 border-blue pb-2 text-2xl font-bold uppercase text-blue sm:text-3xl"
        >
          1. Co je Plzeňská únikovka
        </h2>
        <p className="text-base leading-relaxed sm:text-lg">
          Jeden informační web. Mapa všech uzavírek, oprav a plánovaných
          projektů v Plzni na jednom místě. Sbírá data z SITmP (městská
          GIS služba), JSDI ŘSD (federální dopravní info), PMDP (MHD
          odklony) a plzen.eu/doprava (velké projekty).
        </p>
        <p className="text-base leading-relaxed">
          Není to oficiální stránka města. Není to politická kampaň. Je to
          servisní nástroj, který provozuje ODS Plzeň-město, aby Plzeňákům
          zjednodušil plánování každodenních cest.
        </p>
      </section>

      {/* ─── LOGO + IKONA ─── */}
      <section className="space-y-4">
        <h2
          style={HEAD_FONT}
          className="border-b-2 border-blue pb-2 text-2xl font-bold uppercase text-blue sm:text-3xl"
        >
          2. Logo + ikona
        </h2>
        <p className="text-base">Stáhnout přímo, vše ve vektorovém SVG.</p>
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
        <div className="rounded-xl border-2 border-blue/25 bg-blue/[0.04] p-4 text-sm">
          <h3
            style={HEAD_FONT}
            className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-blue"
          >
            Pravidla použití
          </h3>
          <ul className="space-y-1 text-sm text-ink/80">
            <li>• Nepřebarvujte logo mimo paletu níže.</li>
            <li>• Nepřetvarjte (žádné stretching, rotace, perspektiva).</li>
            <li>• Minimální velikost ikony: 32 × 32 px.</li>
            <li>
              • Volný prostor kolem loga: minimálně rovný výšce „P" ve
              wordmarku.
            </li>
            <li>
              • Atribuce: pokud je logo na cizí stránce, mělo by se
              objevit i „Provozuje ODS Plzeň-město" nebo URL.
            </li>
          </ul>
        </div>
      </section>

      {/* ─── BARVY ─── */}
      <section className="space-y-4">
        <h2
          style={HEAD_FONT}
          className="border-b-2 border-blue pb-2 text-2xl font-bold uppercase text-blue sm:text-3xl"
        >
          3. Brand barvy
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COLORS.map((c) => (
            <div
              key={c.hex}
              className="flex items-center gap-3 rounded-xl border-2 border-ink/15 bg-paper p-3"
            >
              <div
                className="h-12 w-12 shrink-0 rounded-md border border-ink/15"
                style={{ background: c.hex }}
              />
              <div className="min-w-0">
                <div
                  style={HEAD_FONT}
                  className="text-sm font-bold uppercase tracking-tight"
                >
                  {c.name}
                </div>
                <div
                  style={HEAD_FONT}
                  className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink/55"
                >
                  {c.hex}
                </div>
                <div className="text-xs text-ink/55">{c.use}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-ink/70">
          <strong>Typografie:</strong> Oswald Bold pro headlines (uppercase,
          tracking minus), systémový sans-serif (Inter / Roboto / SF) pro body
          text.
        </p>
      </section>

      {/* ─── TALKING POINTS ─── */}
      <section className="space-y-4">
        <h2
          style={HEAD_FONT}
          className="border-b-2 border-blue pb-2 text-2xl font-bold uppercase text-blue sm:text-3xl"
        >
          4. Co říct
        </h2>
        <p className="text-base text-ink/75">
          Tři odpovědi v různých délkách, podle situace.
        </p>

        <div className="space-y-4">
          <Card label="A · 1-věta verze" sublabel="Twitter, kratší rozhovory">
            Plzeňská únikovka je servisní web s mapou všech uzavírek a MHD
            odklonů v Plzni. Provozuje ho ODS Plzeň-město.
          </Card>

          <Card label="B · Elevator pitch" sublabel="30 sek pro rozhovor">
            Když jsem ráno chtěl vědět, kudy zítra pojedu do práce s tím,
            jak se všude v Plzni opravuje, musel jsem projít čtyři weby —
            plzen.eu, agp.plzen.eu, pmdp.cz a SUPERDIO. To dělá průměrný
            Plzeňák? Nedělá.
            <br />
            <br />
            Tak jsme dali dohromady jedno místo. plzenskaunikovka.cz. Mapa
            všech uzavírek, plánované velké projekty (Masaryčka, Americká,
            Bílá Hora), MHD odklony, objízdné trasy. Aktualizuje se denně
            v 7 ráno.
            <br />
            <br />
            Není to oficiální stránka města — proto je tam ODS atribuce.
            Funguje to ale jako veřejná služba, kterou by stát měl dělat
            sám.
          </Card>
        </div>
      </section>

      {/* ─── COPY TEMPLATES ─── */}
      <section className="space-y-4">
        <h2
          style={HEAD_FONT}
          className="border-b-2 border-blue pb-2 text-2xl font-bold uppercase text-blue sm:text-3xl"
        >
          5. Hotové copy templates
        </h2>
        <p className="text-base text-ink/75">
          4 ready-to-post variants pro různé obvody.
        </p>

        <Card label="Template 1 · Krátký servisní" sublabel="universal">
          Když jsem dnes ráno nevěděl, kudy pojedu kvůli {"{ULICE}"}, mrknul
          jsem na novou stránku ODS Plzeň-město: plzenskaunikovka.cz
          <br />
          <br />
          Mapa všech uzavírek v Plzni na jednom místě. Aktualizuje se denně.
          <br />
          <br />
          #PlzeňDoprava #{"{TVUJ_OBVOD}"}
        </Card>

        <Card label="Template 2 · Doubravka" sublabel="Hegnerova kategorie">
          Za 14 dní zavírá Masaryčka. 115 milionů korun, rok stavebního
          ruchu, linky 29, 30, N3 a N6 odklon.
          <br />
          <br />
          Tady všechno na jednom místě i s objízdnou trasou:
          <br />
          👉 plzenskaunikovka.cz/doprava/masarykova
          <br />
          <br />
          #Doubravka #Masarykova #Plzeň
        </Card>

        <Card label="Template 3 · Slovany" sublabel="Chovancova kategorie">
          Slovany potřebují přehled o tom, co se na obvodě rozkopává —
          od Mikulášky po Klatovku. Není snadné si to udržet v hlavě.
          <br />
          <br />
          Nová mapa: plzenskaunikovka.cz/?o=p3
          <br />
          <br />
          #Slovany #Plzeň
        </Card>

        <Card label="Template 4 · Centrum (Plzeň 1)" sublabel="">
          Americká, 28. října, Sady Pětatřicátníků — Plzeň 1 je tenhle
          rok jeden velký stavební ruch. Mapa všeho najednou:
          <br />
          <br />
          plzenskaunikovka.cz/?o=p1
          <br />
          <br />
          #PlzeňCentrum #Plzeň
        </Card>
      </section>

      {/* ─── DO A DON'T ─── */}
      <section className="space-y-4">
        <h2
          style={HEAD_FONT}
          className="border-b-2 border-blue pb-2 text-2xl font-bold uppercase text-blue sm:text-3xl"
        >
          6. Co dělat / nedělat
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border-2 border-[#15803d]/30 bg-[#15803d]/[0.04] p-5">
            <h3
              style={HEAD_FONT}
              className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#15803d]"
            >
              ✓ Můžete
            </h3>
            <ul className="space-y-2 text-sm text-ink/80">
              <li>Sdílet na svých osobních profilech (FB, IG, X, LinkedIn).</li>
              <li>
                Postit URL do plzeňských FB skupin (Doubravka, Slovany,
                Plzeňáci) — s ohledem na pravidla skupiny.
              </li>
              <li>Posílat přátelům přes WhatsApp / Messenger.</li>
              <li>Mluvit o tom na akcích a setkáních.</li>
              <li>Propagovat na akcích ODS Plzeň-město.</li>
            </ul>
          </div>
          <div className="rounded-xl border-2 border-[#c0392b]/30 bg-[#c0392b]/[0.04] p-5">
            <h3
              style={HEAD_FONT}
              className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#c0392b]"
            >
              ✗ Nedělejte
            </h3>
            <ul className="space-y-2 text-sm text-ink/80">
              <li>
                Neslibujte feature, které nemáme („funguje to s navigací"
                = nefunguje).
              </li>
              <li>
                Nemíchejte to s ODS programem — tahle stránka je service,
                ne kampaň.
              </li>
              <li>
                Nepoužívejte data jako útok na primátora — kritika
                technické stránky OK, osobní ne.
              </li>
              <li>Nesdělujte čísla, která jste neviděli na webu.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── KONTAKT ─── */}
      <section className="space-y-4">
        <h2
          style={HEAD_FONT}
          className="border-b-2 border-blue pb-2 text-2xl font-bold uppercase text-blue sm:text-3xl"
        >
          7. Kontakt
        </h2>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>Technické dotazy / bugy:</strong>{" "}
            <a
              href="mailto:info@plzenskaunikovka.cz"
              className="text-blue hover:underline"
            >
              info@plzenskaunikovka.cz
            </a>{" "}
            (provoz: Uhumdrum s.r.o.)
          </li>
          <li>
            <strong>Tisková mluva:</strong> přes ODS Plzeň-město oblastní
            předsednictvo
          </li>
        </ul>
      </section>
    </article>
  );
}

function Card({
  label,
  sublabel,
  children,
}: {
  label: string;
  sublabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border-2 border-ink/15 bg-paper p-5">
      <div className="mb-3 flex flex-wrap items-baseline gap-2 border-b border-ink/10 pb-2">
        <span
          style={HEAD_FONT}
          className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue"
        >
          {label}
        </span>
        {sublabel && (
          <span
            style={HEAD_FONT}
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/45"
          >
            · {sublabel}
          </span>
        )}
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-ink/85 sm:text-base">
        {children}
      </p>
    </div>
  );
}

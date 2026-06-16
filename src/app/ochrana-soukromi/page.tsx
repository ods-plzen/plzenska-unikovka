import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ochrana soukromí",
  description:
    "Jak Plzeňská únikovka pracuje s osobními údaji: provozovatel, právní základy, vaše práva, kontakt.",
};

const UPDATED = "15. 6. 2026";
const VERSION = "2026.06";
const CONTACT = "info@plzenskaunikovka.cz";

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl space-y-10 text-ink">
      <header className="space-y-3">
        <Link href="/" className="text-sm font-medium text-blue hover:underline">
          ← Zpět na úvod
        </Link>
        <h1 className="head text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Ochrana soukromí
        </h1>
        <p className="text-sm text-muted">
          Účinnost od {UPDATED} · Verze dokumentu {VERSION}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="head text-xl font-bold uppercase tracking-tight text-blue">
          1. Kdo zpracovává vaše data
        </h2>
        <p>
          Provozovatelem webu <strong>plzenskaunikovka.cz</strong> (dále „Web")
          a správcem osobních údajů ve smyslu Nařízení Evropského parlamentu a
          Rady (EU) 2016/679 („GDPR") je:
        </p>
        <div className="rounded-xl border border-line bg-card p-4 text-sm">
          <div className="font-semibold">Občanská demokratická strana</div>
          <div>Truhlářská 1106/9, 110 00 Praha 1</div>
          <div>IČ: 16192656</div>
          <div>
            Politická strana zapsaná v Rejstříku politických stran
            a politických hnutí.
          </div>
        </div>
        <p>
          Web provozuje <strong>oblastní sdružení ODS Plzeň-město</strong>
          v rámci právní subjektivity Občanské demokratické strany. Web je
          stranická komunikační platforma; není to oficiální stránka města
          Plzně ani Plzeňských městských dopravních podniků.
        </p>
        <p>
          Kontaktní osoba ve věcech ochrany osobních údajů:
        </p>
        <div className="rounded-xl border border-line bg-card p-4 text-sm">
          <div>
            E-mail:{" "}
            <a href={`mailto:${CONTACT}`} className="text-blue hover:underline">
              {CONTACT}
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="head text-xl font-bold uppercase tracking-tight text-blue">
          2. Co o vás na Webu zpracováváme
        </h2>
        <p>
          Web jsme postavili tak, aby od návštěvníka potřeboval co nejméně.
          K dnešnímu dni zpracováváme tři kategorie údajů.
        </p>

        <h3 className="head mt-4 text-base font-semibold text-blue">
          2.1 Technické provozní logy
        </h3>
        <p>
          Vercel Inc., poskytovatel našeho hostingu, krátkodobě ukládá při
          každém načtení stránky vaši IP adresu, typ a verzi prohlížeče
          (User-Agent), referer (odkud jste přišli) a čas přístupu. Logy slouží
          k provozu (ochrana před útoky, ladění chyb), uchovává je Vercel po
          dobu max. 30 dní.
        </p>
        <p className="text-sm text-muted">
          Právní základ: oprávněný zájem podle čl. 6 odst. 1 písm. f) GDPR
          (provoz a zabezpečení Webu).
        </p>

        <h3 className="head mt-4 text-base font-semibold text-blue">
          2.2 Místní úložiště ve vašem prohlížeči (localStorage)
        </h3>
        <p>
          Pokud si na Webu nastavíte sledování uzavírky (tlačítko „Sledovat"),
          uložíme do <code>localStorage</code> vašeho prohlížeče seznam ID
          uzavírek, které sledujete, a volbu zobrazeného obvodu. Tato data{" "}
          <strong>neopouštějí váš počítač</strong> — neposíláme je nikam, ani je
          nečteme my, ani třetí strana.
        </p>
        <p>
          V úložišti neukládáme nic jiného: žádné cookies pro reklamu, analytiku,
          fingerprinting ani tracking.
        </p>
        <p className="text-sm text-muted">
          Právní základ: souhlas vyjádřený samotným kliknutím „Sledovat". Smazat
          data můžete kdykoliv vyčištěním úložiště prohlížeče nebo opětovným
          kliknutím na „Přestat sledovat".
        </p>

        <h3 className="head mt-4 text-base font-semibold text-blue">
          2.3 Veřejně dostupné informace o veřejně činných osobách
        </h3>
        <p>Web zveřejňuje:</p>
        <ul className="ml-5 list-disc space-y-1 text-sm">
          <li>záznamy o uzavírkách a stavbách převzaté z plzen.eu;</li>
          <li>
            záznamy o hlasování zastupitelů a citace z přepisů jednání
            Zastupitelstva města Plzně;
          </li>
          <li>
            informace o MHD z Plzeňských městských dopravních podniků (PMDP);
          </li>
          <li>
            veřejně přístupné výroky komunálních politiků v rámci jejich
            politické činnosti.
          </li>
        </ul>
        <p>
          Politici a zastupitelé jsou v rozsahu výkonu mandátu{" "}
          <strong>veřejně činnými osobami</strong>. Zpracování jejich osobních
          údajů (jméno, hlasování, výroky) probíhá na základě:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm">
          <li>
            oprávněného zájmu podle čl. 6 odst. 1 písm. f) GDPR — politická
            soutěž a informování voličů o činnosti komunálních politiků;
          </li>
          <li>
            výjimky pro zpracování pro účely akademického, uměleckého,
            novinářského nebo literárního projevu podle čl. 85 GDPR ve spojení
            s § 17 zákona č. 110/2019 Sb.
          </li>
        </ul>
        <p>
          Web zveřejňuje informace o všech komunálních politicích bez ohledu na
          jejich stranickou příslušnost (koalice i opozice). Zveřejňované údaje
          jsou převzaty z veřejných zdrojů (zápisy ze ZMP, oficiální profily,
          mediální výstupy).
        </p>
        <p className="text-sm text-muted">
          Pokud se domníváte, že byl zveřejněn údaj, který se týká vaší
          soukromé (nikoli veřejné) sféry, ozvěte se na{" "}
          <a href={`mailto:${CONTACT}`} className="text-blue hover:underline">
            {CONTACT}
          </a>
          ; obsah ověříme a v odůvodněných případech odstraníme.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="head text-xl font-bold uppercase tracking-tight text-blue">
          3. Komu vaše data předáváme
        </h2>
        <div className="overflow-hidden rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-card text-left">
              <tr>
                <th className="px-3 py-2 font-semibold">Zpracovatel</th>
                <th className="px-3 py-2 font-semibold">Co dělá</th>
                <th className="px-3 py-2 font-semibold">Místo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr>
                <td className="px-3 py-2">Vercel Inc.</td>
                <td className="px-3 py-2">hosting Webu</td>
                <td className="px-3 py-2">EU edge + USA (SCC)</td>
              </tr>
              <tr>
                <td className="px-3 py-2">GitHub Inc.</td>
                <td className="px-3 py-2">uchování zdrojového kódu</td>
                <td className="px-3 py-2">USA</td>
              </tr>
              <tr>
                <td className="px-3 py-2">Wedos a.s.</td>
                <td className="px-3 py-2">registrace domény + DNS</td>
                <td className="px-3 py-2">ČR</td>
              </tr>
              <tr>
                <td className="px-3 py-2">Uhumdrum s.r.o.</td>
                <td className="px-3 py-2">
                  provoz, vývoj a údržba (dle smlouvy o zpracování os. údajů)
                </td>
                <td className="px-3 py-2">ČR</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          K dnešnímu dni neprovozujeme analytiku, neposíláme newslettery a
          nesbíráme žádná data přes formuláře. Až tyto funkce přibydou,
          zveřejníme aktualizovanou verzi tohoto dokumentu a u nových funkcí si
          vyžádáme váš samostatný souhlas.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="head text-xl font-bold uppercase tracking-tight text-blue">
          4. Jak dlouho data uchováváme
        </h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>provozní logy Vercel: max. 30 dní;</li>
          <li>localStorage: dokud si jej sami nesmažete;</li>
          <li>
            veřejná data o uzavírkách, hlasování, MHD: dlouhodobě (jde o
            veřejnou paměť města; konkrétní data necháváme archivně přístupná
            pro historickou kontrolu).
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="head text-xl font-bold uppercase tracking-tight text-blue">
          5. Vaše práva
        </h2>
        <p>Podle čl. 15 až 22 GDPR máte právo:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>na přístup k údajům, které o vás zpracováváme;</li>
          <li>na opravu nepřesných údajů;</li>
          <li>
            na výmaz („právo být zapomenut"), pokud pro další zpracování nemáme
            zákonný důvod;
          </li>
          <li>na omezení zpracování;</li>
          <li>na přenositelnost údajů;</li>
          <li>
            vznést námitku proti zpracování založenému na oprávněném zájmu nebo
            veřejném zájmu (čl. 21 GDPR);
          </li>
          <li>
            podat stížnost u Úřadu pro ochranu osobních údajů (
            <a
              href="https://www.uoou.cz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue hover:underline"
            >
              www.uoou.cz
            </a>
            ).
          </li>
        </ul>
        <p>
          Žádost zašlete na{" "}
          <a href={`mailto:${CONTACT}`} className="text-blue hover:underline">
            {CONTACT}
          </a>
          . Odpovíme nejpozději do 30 dní. Pokud nemůžeme vyhovět (např. proto,
          že jde o výroky politika v jeho veřejné funkci, kde převažuje veřejný
          zájem), zdůvodníme to.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="head text-xl font-bold uppercase tracking-tight text-blue">
          6. Cookies a podobné technologie
        </h2>
        <p>
          Web nepoužívá cookies pro analytiku, reklamu ani tracking. Používáme
          pouze funkční localStorage podle bodu 2.2, a to <strong>jen tehdy</strong>,
          když si sami aktivujete sledování uzavírky.
        </p>
        <p>
          Až Web rozšíříme o analytiku nebo notifikace, zobrazíme lištu pro
          správu souhlasu s jasným popisem každé kategorie a možností
          jednotlivě odmítnout.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="head text-xl font-bold uppercase tracking-tight text-blue">
          7. Děti
        </h2>
        <p>
          Web obsahem necílí na osoby mladší 16 let. Pokud nám případně vědomě
          sdělíte osobní údaje dítěte, údaj vymažeme.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="head text-xl font-bold uppercase tracking-tight text-blue">
          8. Změny tohoto dokumentu
        </h2>
        <p>
          Tento dokument je verzovaný. Podstatné změny (nový zpracovatel, nová
          kategorie údajů, změna účelů) zveřejníme s předstihem na úvodní
          stránce.
        </p>
      </section>

      <footer className="border-t border-line pt-6 text-sm text-muted">
        <p>
          Pro dotazy ohledně ochrany soukromí pište na{" "}
          <a href={`mailto:${CONTACT}`} className="text-blue hover:underline">
            {CONTACT}
          </a>
          .
        </p>
      </footer>
    </article>
  );
}

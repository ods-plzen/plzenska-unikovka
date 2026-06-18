import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 bg-blue-deep text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" className="h-9 w-9" />
            <div className="head mt-3 text-xl font-bold uppercase tracking-tight">
              Plzeňská únikovka
            </div>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/65">
              Únikovka z plzeňského dopravního chaosu. Mapa uzavírek, MHD
              odklonů a dočasných zastávek pro všech 10 plzeňských obvodů.
            </p>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/45">
              Zdroje dat: SITmP (agp.plzen.eu), JSDI ŘSD, SUPERDIO,
              Plzeňské městské dopravní podniky (PMDP). Aktualizováno denně.
            </p>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/45">
              Data přebíráme z oficiálních zdrojů a mohou se v jednotlivostech
              lišit od reality v terénu. Našli jste chybu?{" "}
              <a
                href="mailto:info@plzenskaunikovka.cz?subject=Chyba%20v%20Plze%C5%88sk%C3%A9%20%C3%BAnikovce"
                className="text-sky hover:underline"
              >
                Napište nám
              </a>
              , děkujeme.
            </p>
          </div>

          <div>
            <div className="kicker">Provozuje</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ods-logo.svg"
              alt="ODS"
              className="mt-3 h-10 w-auto"
            />
            <p className="mt-3 text-sm font-semibold leading-relaxed text-white">
              ODS Plzeň-město
            </p>
            <p className="mt-3 text-xs leading-relaxed text-white/45">
              <a
                href="https://www.ods.cz/osobni-udaje"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky"
              >
                Ochrana osobních údajů ↗
              </a>
            </p>
          </div>
        </div>

        <nav className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-xs text-white/70">
          <Link href="/" className="hover:text-sky">
            Úvod
          </Link>
          <Link href="/mapa" className="hover:text-sky">
            Mapa
          </Link>
          <Link href="/seznam" className="hover:text-sky">
            Seznam všech uzavírek
          </Link>
          <Link href="/media-kit" className="hover:text-sky">
            Press kit
          </Link>
          <a
            href="https://www.ods.cz/osobni-udaje"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sky"
          >
            Ochrana osobních údajů ↗
          </a>
        </nav>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-white/45">
          <span>© {new Date().getFullYear()} Plzeňská únikovka</span>
          <span>Nezávislá služba pro Plzeňany · zdroje u každé položky</span>
        </div>
      </div>
    </footer>
  );
}

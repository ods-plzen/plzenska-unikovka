import Link from "next/link";

const NAV = [
  { href: "/doprava", label: "Doprava" },
  { href: "/zastupitelstvo", label: "Zastupitelstvo" },
  { href: "/stavby", label: "Stavby" },
  { href: "/komunita", label: "Komunita" },
];

export function Footer() {
  return (
    <footer className="mt-16 bg-blue-deep text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" className="h-9 w-9" />
            <div className="head mt-3 text-xl font-bold uppercase tracking-tight">
              Plzeňská únikovka
            </div>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/65">
              Únikovka z plzeňského dopravního chaosu. Uzavírky, hlasy ze
              zastupitelstva, stavby a komunita pro všech 10 obvodů na jednom
              místě. Data jen z veřejných a oficiálních zdrojů.
            </p>
          </div>

          <div>
            <div className="kicker">Sekce</div>
            <ul className="mt-3 space-y-1.5 text-sm text-white/75">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="hover:text-sky">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="kicker">Provozuje</div>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              Uhumdrum s.r.o. ve spolupráci s ODS Plzeň-město.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/45">
              Agregovaný a strojově zpracovaný obsah je vždy takto označen —
              nejde o vlastní zpravodajství.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-white/45">
              <Link href="/ochrana-soukromi" className="hover:text-sky">
                Ochrana soukromí
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-white/45">
          <span>© {new Date().getFullYear()} Plzeňská únikovka</span>
          <span>Nezávislá služba pro Plzeňany · zdroje u každé položky</span>
        </div>
      </div>
    </footer>
  );
}

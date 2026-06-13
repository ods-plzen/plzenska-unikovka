export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-md">
            <div className="head text-base font-bold uppercase text-blue">
              Plzeň přehledně
            </div>
            <p className="mt-1.5 leading-relaxed">
              Uzavírky, rozhodnutí zastupitelstva, stavby a komunitní info pro
              všech 10 plzeňských obvodů na jednom místě. Data z veřejných
              zdrojů — radnice, MHD, OpenStreetMap.
            </p>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-ink">Provozuje</div>
            <p className="mt-1.5 leading-relaxed">
              Lukáš Hegner, zastupitel za ODS Plzeň.
              <br />
              Agregovaný a strojově zpracovaný obsah je takto označen — nejde o
              vlastní zpravodajství.
            </p>
          </div>
        </div>
        <div className="mt-6 border-t border-line pt-4 text-xs text-muted">
          © {new Date().getFullYear()} Plzeň přehledně · Zdroje uvedeny u každé
          položky · Nezávislá služba pro Plzeňany
        </div>
      </div>
    </footer>
  );
}

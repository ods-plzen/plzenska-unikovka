import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Proč tenhle web existuje",
  description:
    "Jednotnou městskou aplikaci slíbili Plzeňanům dvakrát ve volebních programech. Nevznikla. Tak jsme ji postavili sami.",
};

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="head text-3xl font-bold uppercase tracking-tight text-blue">
        Proč tenhle web existuje
      </h1>

      <p className="mt-6 text-lg leading-relaxed text-ink">
        Jednotnou městskou aplikaci slíbili Plzeňanům{" "}
        <b>dvakrát ve volebních programech</b> — a mezitím ještě jednou na
        webu města:
      </p>

      <ol className="mt-4 space-y-3 text-ink">
        <li className="rounded-xl border border-line bg-card p-4">
          <b>2022</b> — volební program STAN: „jedna velká a přehledná
          aplikace… dynamické informace o dopravních omezeních&ldquo;.{" "}
          <a
            className="text-blue underline underline-offset-2"
            href="https://web.archive.org/web/20221004131811/https://www.stanplzen.cz/program/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Zdroj: archiv programu ↗
          </a>
        </li>
        <li className="rounded-xl border border-line bg-card p-4">
          <b>Mezitím, březen 2023</b> — vedení města: jednotná aplikace v konceptu
          „úřad jako e-shop&ldquo;.{" "}
          <a
            className="text-blue underline underline-offset-2"
            href="https://plzen.eu/o-meste/aktuality/aktuality-z-mesta/vedeni-plzne-predstavilo-hlavni-temata-a-projekty-do-roku-2026/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Zdroj: plzen.eu ↗
          </a>
        </li>
        <li className="rounded-xl border border-line bg-card p-4">
          <b>2026</b> — a v letošním volebním programu ji slibují znovu.
          Skoro stejnými slovy.
        </li>
      </ol>

      <p className="mt-6 text-lg leading-relaxed text-ink">
        Nevznikla. Oficiální přehled aplikací města ji k dnešku neobsahuje —
        jsou tam jen oddělené weby.
      </p>

      <p className="mt-4 text-lg leading-relaxed text-ink">
        <b>Tak jsme tu nejpotřebnější část postavili sami.</b> Uzavírky,
        objízdné trasy, náhradní zastávky. Zadarmo, bez přihlašování, bez
        reklam, s otevřeným kódem. Provozuje ODS Plzeň-město jako bezplatnou
        veřejnou službu.
      </p>

      <p className="mt-4 text-lg leading-relaxed text-ink">
        Ne proto, že bychom uměli kouzlit. Proto, že rozdíl mezi slibem a
        výsledkem je obyčejná práce.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-lg bg-blue px-5 py-3 text-sm font-bold text-white hover:opacity-90"
        >
          ← Zpět na mapu uzavírek
        </Link>
        <Link
          href="/media-kit"
          className="rounded-lg border border-line bg-card px-5 py-3 text-sm font-bold text-ink hover:bg-ink/5"
        >
          Pro média
        </Link>
      </div>
    </main>
  );
}

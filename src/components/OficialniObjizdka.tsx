/**
 * Poctivá vrstva objížděk. Zdroj (JSDI/SITmP) oficiální objízdnou trasu
 * publikuje jen u zlomku uzavírek — tenhle blok říká pravdu o tom, co
 * v datech je, a když chybí, posílá občana na formulář podnětu.
 *
 * Stavy:
 *  1) v popisu z JSDI je text objížďky → ukázat doslova (oficiální zdroj)
 *  2) není oficiální, ale máme vlastní zmapovanou trasu → přiznat autorství
 *  3) není nic → říct to nahlas + kotva na formulář „napište městu"
 */

function extractDetourText(popis?: string): string | null {
  if (!popis) return null;
  const m = /obj[íi][zž]/i.exec(popis);
  if (!m) return null;
  // od prvního výskytu „objíz…/objíž…" po ", Vydal:" nebo konec
  let text = popis.slice(m.index);
  const cut = text.search(/,\s*Vydal:/i);
  if (cut > 0) text = text.slice(0, cut);
  text = text.trim().replace(/\s+/g, " ");
  return text.length >= 12 ? text : null;
}

export function OficialniObjizdka({
  popis,
  hasCurated,
  auto,
}: {
  popis?: string;
  hasCurated: boolean;
  auto?: boolean;
}) {
  const official = extractDetourText(popis);

  if (official) {
    return (
      <section className="rounded-xl border border-line bg-card p-5">
        <h2 className="head mb-2 text-lg font-semibold text-blue">
          🔀 Oficiální objízdná trasa
        </h2>
        <p className="text-sm leading-relaxed text-ink">{official}</p>
        <p className="mt-2 text-xs text-ink/50">
          Doslovné znění z oficiálních dopravních dat (JSDI/SITmP).
          {auto &&
            " Trasu jsme z textu orientačně zakreslili do mapy (zelená přerušovaná čára) — na místě platí přechodné dopravní značení."}
        </p>
      </section>
    );
  }

  if (hasCurated) {
    return (
      <p className="rounded-lg border border-line bg-card px-4 py-3 text-xs leading-relaxed text-ink/60">
        Oficiální dopravní data (JSDI/SITmP) k této uzavírce žádnou objízdnou
        trasu neuvádějí. Objízdné trasy na této stránce jsme zmapovali sami z dostupných podkladů.
      </p>
    );
  }

  return (
    <section className="rounded-xl border border-dashed border-[#c0392b]/40 bg-card p-5">
      <h2 className="head mb-2 text-lg font-semibold text-ink">
        🔀 Objízdná trasa: nikde
      </h2>
      <p className="text-sm leading-relaxed text-ink/80">
        V oficiálních dopravních datech (JSDI/SITmP) k této uzavírce{" "}
        <b>žádná objízdná trasa uvedena není</b>. Kudy se má jezdit, si musíte
        domyslet sami.
      </p>
    </section>
  );
}

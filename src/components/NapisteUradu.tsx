"use client";

/**
 * „Napište městu" — mailto na oficiální elektronickou podatelnu města
 * (posta@plzen.eu, ověřeno z plzen.eu), k rukám náměstka pro dopravu.
 * Podatelna musí každý e-mail zaevidovat a předat — na rozdíl od osobní
 * schránky nejde zpráva ztratit. Uživatel posílá sám ze svého klienta,
 * tělo si před odesláním upraví.
 */
export function NapisteUradu({
  closureName,
  termin,
}: {
  closureName: string;
  termin?: string;
}) {
  const subject = `Uzavírka ${closureName} — žádost o informace (k rukám náměstka pro dopravu)`;
  const body = [
    "Vážený pane náměstku,",
    "",
    `obracím se na Vás kvůli uzavírce „${closureName}"${termin ? ` (${termin})` : ""}.`,
    "",
    "[Napište vlastními slovy, co Vám na místě komplikuje život — objížďka, značení, náhradní zastávka, chybějící chodník…]",
    "",
    "Žádám o informaci, jak a kdy bude situace řešena. Odpověď prosím na tento e-mail.",
    "",
    "Děkuji.",
  ].join("\n");

  const href = `mailto:posta@plzen.eu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <section className="rounded-xl border-2 border-[#c0392b]/30 bg-card p-5">
      <h2 className="head mb-2 text-lg font-semibold text-[#c0392b]">
        Štve vás tahle uzavírka? Řekněte to městu.
      </h2>
      <p className="text-sm leading-relaxed text-ink/80">
        Doprava v Plzni patří do gesce náměstka primátora Aleše Tolara (STAN).
        Tlačítko otevře e-mail na oficiální podatelnu města — ta ho musí
        zaevidovat a předat. Napište vlastními slovy, co vám komplikuje život.
        Slušně a konkrétně: takové e-maily nejde smést ze stolu.
      </p>
      <a
        href={href}
        className="mt-4 inline-block rounded-lg bg-[#c0392b] px-5 py-3 text-sm font-bold text-white hover:opacity-90"
      >
        ✉️ Napsat městu — k rukám náměstka pro dopravu
      </a>
      <p className="mt-3 text-xs text-ink/50">
        E-mail odesíláte vy, ze své adresy. Před odesláním si text upravte po
        svém — vlastní slova mají větší váhu než šablona.
      </p>
    </section>
  );
}

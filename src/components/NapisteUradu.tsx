"use client";

import { useState } from "react";

/**
 * Formulář „Pošlete to městu" — odešle podnět přes /api/podnet na oficiální
 * elektronickou podatelnu města (posta@plzen.eu), k rukám náměstka pro
 * dopravu. Reply-To = odesílatel, město odpovídá přímo jemu. Osobní údaje
 * se neukládají (viz api/podnet). Honeypot pole `web` je skryté.
 */
export function NapisteUradu({
  closureId,
  closureName,
  termin,
}: {
  closureId: string;
  closureName: string;
  termin?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    `Vážený pane náměstku,\n\nobracím se na Vás kvůli uzavírce „${closureName}"${termin ? ` (${termin})` : ""}.\n\n… (napište vlastními slovy, co Vám na místě komplikuje život — objížďka, značení, náhradní zastávka, chybějící chodník)\n\nŽádám o informaci, jak a kdy bude situace řešena. Odpověď prosím na tento e-mail.\n\nDěkuji.`,
  );
  const [web, setWeb] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [errText, setErrText] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setErrText("");
    try {
      const res = await fetch("/api/podnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          closureId,
          closureName,
          termin,
          web,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) {
        setState("done");
      } else {
        setState("error");
        setErrText(
          j.error === "message"
            ? "Zpráva je moc krátká — napište aspoň pár vět."
            : j.error === "email"
              ? "Zkontrolujte prosím e-mail."
              : "Odeslání se nepovedlo. Zkuste to za chvíli, nebo pošlete e-mail ručně (odkaz níže).",
        );
      }
    } catch {
      setState("error");
      setErrText("Odeslání se nepovedlo. Zkuste to za chvíli.");
    }
  }

  const mailtoFallback = `mailto:posta@plzen.eu?subject=${encodeURIComponent(
    `Uzavírka ${closureName} — podnět (k rukám náměstka pro dopravu)`,
  )}&body=${encodeURIComponent(message)}`;

  if (state === "done") {
    return (
      <section id="napiste-mestu" className="rounded-xl border-2 border-[#1e8449]/40 bg-card p-5">
        <h2 className="head mb-2 text-lg font-semibold text-[#1e8449]">
          ✅ Odesláno na podatelnu města
        </h2>
        <p className="text-sm leading-relaxed text-ink/80">
          Podatelna má povinnost podání zaevidovat a předat. Kopii jsme vám
          poslali na e-mail — odpověď města přijde přímo vám. Díky, že se
          ozýváte: čím víc konkrétních podnětů, tím hůř se dělá, že se nic
          neděje.
        </p>
      </section>
    );
  }

  return (
    <section id="napiste-mestu" className="rounded-xl border-2 border-[#c0392b]/30 bg-card p-5">
      <h2 className="head mb-2 text-lg font-semibold text-[#c0392b]">
        Štve vás to? Napište Tolarovi. Hned teď, odsud.
      </h2>
      <p className="text-sm leading-relaxed text-ink/80">
        Doprava v Plzni patří do gesce náměstka primátora Aleše Tolara (STAN).
        Formulář odešle váš podnět na oficiální podatelnu města — ta ho{" "}
        <b>musí zaevidovat a předat</b>. Odpověď přijde přímo vám. Pište
        vlastními slovy, slušně a konkrétně: takový podnět nejde smést ze
        stolu.
      </p>

      <form onSubmit={submit} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            required
            minLength={2}
            maxLength={100}
            placeholder="Vaše jméno"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink"
          />
          <input
            type="email"
            required
            maxLength={200}
            placeholder="Váš e-mail (přijde vám odpověď)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink"
          />
        </div>
        {/* honeypot — lidé nevidí, boti vyplní */}
        <input
          type="text"
          name="web"
          tabIndex={-1}
          autoComplete="off"
          value={web}
          onChange={(e) => setWeb(e.target.value)}
          className="hidden"
          aria-hidden="true"
        />
        <textarea
          required
          minLength={20}
          maxLength={3000}
          rows={8}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm leading-relaxed text-ink"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={state === "sending"}
            className="rounded-lg bg-[#c0392b] px-5 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {state === "sending"
              ? "Odesílám…"
              : "✉️ Napsat Tolarovi — přes podatelnu města"}
          </button>
          <a
            href={mailtoFallback}
            className="text-xs text-ink/50 underline underline-offset-2 hover:text-ink"
          >
            Radši to pošlete ze svého e-mailu?
          </a>
        </div>
        {state === "error" && (
          <p className="text-sm font-medium text-[#c0392b]">{errText}</p>
        )}
        <p className="text-xs leading-relaxed text-ink/50">
          Jméno a e-mail použijeme jen k odeslání tohoto podnětu (jste
          odesílatel, město odpovídá vám) — do žádné databáze si je
          neukládáme. Kopie podnětu vám přijde na e-mail.
        </p>
      </form>
    </section>
  );
}

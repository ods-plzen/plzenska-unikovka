"use client";

import { useState } from "react";
import { WHATSAPP_PHONE, waMeUrl } from "@/data/contact";

const TYPES = ["Ztráta", "Nález", "Sousedská akce"] as const;
type ReportType = (typeof TYPES)[number];

function buildMessage(f: {
  typ: ReportType;
  co: string;
  misto: string;
  kdy: string;
  kontakt: string;
}) {
  return [
    "*Plzeň přehledně — nahlášení*",
    `Typ: ${f.typ}`,
    `Co: ${f.co}`,
    f.misto && `Místo: ${f.misto}`,
    f.kdy && `Kdy: ${f.kdy}`,
    f.kontakt && `Kontakt: ${f.kontakt}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function CommunityReport() {
  const [typ, setTyp] = useState<ReportType>("Ztráta");
  const [co, setCo] = useState("");
  const [misto, setMisto] = useState("");
  const [kdy, setKdy] = useState("");
  const [kontakt, setKontakt] = useState("");
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState("");

  const message = buildMessage({ typ, co, misto, kdy, kontakt });
  const valid = co.trim().length > 1;

  const onSend = () => {
    if (!valid) {
      setErr("Vyplň aspoň pole „Co“ (krátký popis).");
      return;
    }
    setErr("");
    window.open(waMeUrl(WHATSAPP_PHONE, message), "_blank", "noopener");
  };

  const onCopy = async () => {
    if (!valid) {
      setErr("Vyplň aspoň pole „Co“ (krátký popis).");
      return;
    }
    setErr("");
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErr("Kopírování se nepovedlo — vyber text ručně.");
    }
  };

  const input =
    "w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-sky";

  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <h2 className="head text-lg font-semibold text-blue">Nahlásit do komunity</h2>
      <p className="text-sm text-muted">
        Ztráta, nález nebo sousedská akce. Po odeslání to ověříme a přidáme.
      </p>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTyp(t)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
                typ === t
                  ? "border-blue bg-blue text-white"
                  : "border-line bg-white text-blue hover:border-sky"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <input
          className={input}
          placeholder="Co? (např. pejsek border kólie Aston)"
          value={co}
          onChange={(e) => setCo(e.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={input}
            placeholder="Místo (např. u Bukovce)"
            value={misto}
            onChange={(e) => setMisto(e.target.value)}
          />
          <input
            className={input}
            placeholder="Kdy (např. pátek odpoledne)"
            value={kdy}
            onChange={(e) => setKdy(e.target.value)}
          />
        </div>
        <input
          className={input}
          placeholder="Kontakt (telefon nebo e-mail)"
          value={kontakt}
          onChange={(e) => setKontakt(e.target.value)}
        />

        {err && <p className="text-sm text-red">{err}</p>}

        <div className="flex flex-wrap gap-2">
          {WHATSAPP_PHONE && (
            <button
              type="button"
              onClick={onSend}
              className="rounded-md bg-green px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Odeslat přes WhatsApp
            </button>
          )}
          <button
            type="button"
            onClick={onCopy}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-blue hover:border-sky"
          >
            {copied ? "Zkopírováno ✓" : "Zkopírovat text"}
          </button>
        </div>
        <p className="text-xs text-muted">
          Příspěvky procházejí kontrolou před zveřejněním. Komunita slouží ke
          ztrátám, nálezům a akcím — ne k řešení bezpečnosti či sporů.
        </p>
      </div>
    </section>
  );
}

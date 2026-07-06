"use client";

import { useState } from "react";
import { watchedList } from "@/lib/watch";

/**
 * E-mailové hlídání uzavírky — alternativa k push notifikacím (funguje všude,
 * bez instalace). Double opt-in: po odeslání přijde potvrzovací e-mail.
 */
export function EmailWatch({ id }: { id: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || state === "sending") return;
    setState("sending");
    try {
      // Hlídáme aktuální uzavírku + vše, co má uživatel lokálně nahvězdičkované.
      const watched = Array.from(new Set([id, ...watchedList()]));
      const res = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), watched }),
      });
      setState(res.ok ? "done" : "error");
      if (res.ok) {
        try {
          localStorage.setItem("pu-email-done", "1"); // popup už nenabízet
        } catch {}
      }
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-line bg-white p-4 text-sm">
        <p className="font-semibold text-ink">📬 Ještě jedno kliknutí</p>
        <p className="mt-1 text-muted">
          Poslali jsme vám potvrzovací e-mail. Hlídání se zapne, až v něm
          kliknete na tlačítko — do té doby nic neposíláme.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-line bg-white p-4"
    >
      <p className="text-sm font-semibold text-ink">
        ✉️ Hlídat e-mailem (bez instalace)
      </p>
      <p className="mt-1 text-xs text-muted">
        Přijde vám e-mail o každé nové uzavírce v Plzni a připomínka den
        předtím, než začne uzavírka na hlídané ulici.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vas@email.cz"
          className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm focus:border-sky focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="shrink-0 rounded-md bg-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {state === "sending" ? "Odesílám…" : "Hlídat"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 text-xs text-amber">
          Nepovedlo se — zkuste to prosím za chvíli znovu.
        </p>
      )}
      <p className="mt-2 text-[11px] leading-snug text-muted">
        E-mail použijeme jen na dopravní upozornění k hlídaným ulicím, nikdy
        na nic jiného. Odhlášení jedním klikem v každé zprávě.
      </p>
    </form>
  );
}

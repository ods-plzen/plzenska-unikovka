"use client";

import { useState } from "react";
import { watchedList } from "@/lib/watch";

/**
 * Sběr e-mailů na celoměstský digest uzavírek — kompaktní formulář pro
 * footer (tmavé pozadí). Přibalí i lokálně nahvězdičkované uzavírky,
 * double opt-in řeší /api/email/subscribe.
 */
export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), watched: watchedList() }),
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
      <p className="text-sm leading-relaxed text-white/80">
        📬 Poslali jsme vám potvrzovací e-mail. Klikněte v něm a hlídáme —
        do té doby neposíláme nic.
      </p>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className="flex max-w-md gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vas@email.cz"
          className="min-w-0 flex-1 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-sky focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="shrink-0 rounded-md bg-sky px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {state === "sending" ? "Odesílám…" : "Hlídat"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 text-xs text-white/70">
          Nepovedlo se — zkuste to prosím za chvíli znovu.
        </p>
      )}
      <p className="mt-2 max-w-md text-xs leading-relaxed text-white/45">
        Každá nová uzavírka v Plzni e-mailem. Žádný spam, žádná politika,
        jen doprava. Odhlášení jedním klikem v každé zprávě.
      </p>
    </form>
  );
}

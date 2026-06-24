"use client";

import { useEffect, useState } from "react";

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;

type State =
  | { kind: "closed" }
  | { kind: "open"; message: string; email: string; notify: boolean; sending: boolean; error: string | null }
  | { kind: "thanks" };

export function FeedbackWidget({ closureId }: { closureId?: string }) {
  const [state, setState] = useState<State>({ kind: "closed" });

  // Ctrl/Cmd + . zkrátka otevře modal — power user friendly
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === ".") {
        e.preventDefault();
        setState((s) =>
          s.kind === "closed"
            ? { kind: "open", message: "", email: "", notify: false, sending: false, error: null }
            : s,
        );
      }
      if (e.key === "Escape" && state.kind !== "closed") {
        setState({ kind: "closed" });
      }
    }
    function onOpen() {
      setState((s) =>
        s.kind === "closed"
          ? { kind: "open", message: "", email: "", notify: false, sending: false, error: null }
          : s,
      );
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("plzu:open-feedback", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("plzu:open-feedback", onOpen);
    };
  }, [state.kind]);

  async function submit() {
    if (state.kind !== "open") return;
    if (state.message.trim().length < 4) {
      setState({ ...state, error: "Napište prosím alespoň 4 znaky." });
      return;
    }
    setState({ ...state, sending: true, error: null });
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: state.message.trim(),
          email: state.email.trim() || undefined,
          notify: state.notify,
          closureId,
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "send_failed");
      }
      setState({ kind: "thanks" });
      setTimeout(() => setState({ kind: "closed" }), 3500);
    } catch (e) {
      setState({
        ...state,
        sending: false,
        error: e instanceof Error ? humanize(e.message) : "Něco se pokazilo. Zkuste to znovu.",
      });
    }
  }

  return (
    <>
      {/* Floating tlačítko */}
      <button
        type="button"
        onClick={() =>
          setState({
            kind: "open",
            message: "",
            email: "",
            notify: false,
            sending: false,
            error: null,
          })
        }
        aria-label="Nahlásit chybu nebo napsat zpětnou vazbu"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue text-paper shadow-[0_8px_24px_rgba(21,61,138,0.35)] transition-transform hover:scale-105 hover:bg-blue-deep sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 sm:h-7 sm:w-7"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>

      {/* Modal */}
      {state.kind !== "closed" && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 p-3 sm:items-center sm:p-6"
          onClick={() => state.kind === "open" && !state.sending && setState({ kind: "closed" })}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-2xl"
          >
            {state.kind === "thanks" ? (
              <ThanksPanel />
            ) : (
              <FormPanel
                state={state}
                onChange={(next) => setState(next)}
                onClose={() => !state.sending && setState({ kind: "closed" })}
                onSubmit={submit}
                closureId={closureId}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ThanksPanel() {
  return (
    <div className="p-6 text-center sm:p-8">
      <div
        style={HEAD_FONT}
        className="mb-3 text-3xl font-bold uppercase tracking-tight text-blue sm:text-4xl"
      >
        Díky!
      </div>
      <p className="text-base text-ink/75">
        Zpráva nám dorazila. Pokud jste nechali e-mail, ozveme se.
      </p>
    </div>
  );
}

function FormPanel({
  state,
  onChange,
  onClose,
  onSubmit,
  closureId,
}: {
  state: Extract<State, { kind: "open" }>;
  onChange: (s: Extract<State, { kind: "open" }>) => void;
  onClose: () => void;
  onSubmit: () => void;
  closureId?: string;
}) {
  return (
    <div className="flex flex-col">
      <header className="flex items-baseline justify-between gap-3 border-b-2 border-ink/15 px-5 py-4">
        <div>
          <div
            style={HEAD_FONT}
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/55"
          >
            {closureId ? `Uzavírka · ${closureId}` : "Plzeňská únikovka"}
          </div>
          <h2
            style={HEAD_FONT}
            className="mt-1 text-xl font-bold uppercase leading-tight sm:text-2xl"
          >
            Něco není správně?
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít"
          className="-mr-2 -mt-2 shrink-0 rounded-full p-2 text-ink/65 hover:bg-ink/5 hover:text-ink"
        >
          ✕
        </button>
      </header>

      <div className="space-y-4 px-5 py-5">
        <label className="block">
          <span
            style={HEAD_FONT}
            className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-ink/65"
          >
            Co jste viděli
          </span>
          <textarea
            value={state.message}
            onChange={(e) => onChange({ ...state, message: e.target.value })}
            disabled={state.sending}
            rows={4}
            maxLength={4000}
            placeholder="Např.: Rokycanská 16. 3.–1. 9. není úplně uzavřená, jezdí se kyvadlově."
            className="w-full resize-y rounded-xl border-2 border-ink/20 bg-white px-3 py-2 text-base text-ink outline-none placeholder:text-ink/40 focus:border-blue"
          />
        </label>

        <details className="rounded-xl border border-ink/10 bg-white/60 p-3 text-sm">
          <summary
            style={HEAD_FONT}
            className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.2em] text-ink/65"
          >
            Nepovinné · chcete odpověď?
          </summary>
          <div className="mt-3 space-y-3">
            <label className="block">
              <span
                style={HEAD_FONT}
                className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-ink/55"
              >
                E-mail
              </span>
              <input
                type="email"
                value={state.email}
                onChange={(e) => onChange({ ...state, email: e.target.value })}
                disabled={state.sending}
                placeholder="vy@example.cz"
                className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-blue"
              />
            </label>
            <label className="flex items-start gap-2 text-sm text-ink/80">
              <input
                type="checkbox"
                checked={state.notify}
                onChange={(e) => onChange({ ...state, notify: e.target.checked })}
                disabled={state.sending || !state.email}
                className="mt-0.5 h-4 w-4 accent-blue"
              />
              <span>Dejte mi vědět, až to opravíme.</span>
            </label>
          </div>
        </details>

        {state.error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <p className="text-xs leading-relaxed text-ink/55">
          Žádné cookies. E-mail uchováme jen pro vyřízení vašeho podnětu.
        </p>
      </div>

      <footer className="flex items-center justify-end gap-3 border-t-2 border-ink/15 bg-ink/5 px-5 py-3">
        <button
          type="button"
          onClick={onClose}
          disabled={state.sending}
          style={HEAD_FONT}
          className="rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/65 hover:text-ink disabled:opacity-50"
        >
          Zrušit
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={state.sending}
          style={HEAD_FONT}
          className="rounded-full bg-blue px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-blue-deep disabled:opacity-50"
        >
          {state.sending ? "Posílám…" : "Odeslat"}
        </button>
      </footer>
    </div>
  );
}

function humanize(code: string): string {
  switch (code) {
    case "message_length":
      return "Zpráva musí mít 4 až 4000 znaků.";
    case "email_format":
      return "E-mail nevypadá jako e-mail.";
    case "service_unavailable":
      return "Server zrovna nefunguje. Zkuste to za chvíli.";
    case "db_error":
      return "Něco se pokazilo na naší straně. Mrkneme na to.";
    default:
      return "Odeslání selhalo. Zkuste to znovu.";
  }
}

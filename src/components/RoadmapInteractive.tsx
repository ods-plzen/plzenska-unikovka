"use client";

import { useEffect, useMemo, useState } from "react";

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;
const LS_KEY = "pu.voted_features";

export interface FeatureRow {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  status: "considering" | "planned" | "building" | "done" | "rejected";
  vote_count: number;
}

const STATUS_LABEL: Record<FeatureRow["status"], string> = {
  considering: "Zvažujeme",
  planned: "Plánujeme",
  building: "Stavíme",
  done: "Hotovo",
  rejected: "Nejde",
};

const STATUS_TONE: Record<FeatureRow["status"], string> = {
  considering: "bg-ink/10 text-ink/70",
  planned: "bg-blue/15 text-blue",
  building: "bg-[#009fe3]/15 text-sky",
  done: "bg-[#15803d]/15 text-[#15803d]",
  rejected: "bg-ink/15 text-ink/55",
};

export function FeatureGrid({ features }: { features: FeatureRow[] }) {
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [optimistic, setOptimistic] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (raw) setVoted(new Set(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
  }, []);

  const sorted = useMemo(
    () =>
      [...features].sort(
        (a, b) =>
          (b.vote_count + (optimistic[b.id] ?? 0)) -
          (a.vote_count + (optimistic[a.id] ?? 0)),
      ),
    [features, optimistic],
  );

  async function vote(featureId: string) {
    if (voted.has(featureId)) return;
    setOptimistic((o) => ({ ...o, [featureId]: (o[featureId] ?? 0) + 1 }));
    const next = new Set(voted);
    next.add(featureId);
    setVoted(next);
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(Array.from(next)));
    } catch {
      /* ignore */
    }
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureId }),
      });
      if (!res.ok) {
        // rollback při serverové chybě
        setOptimistic((o) => ({ ...o, [featureId]: (o[featureId] ?? 1) - 1 }));
        next.delete(featureId);
        setVoted(new Set(next));
      }
    } catch {
      setOptimistic((o) => ({ ...o, [featureId]: (o[featureId] ?? 1) - 1 }));
      next.delete(featureId);
      setVoted(new Set(next));
    }
  }

  return (
    <ul className="grid gap-3 sm:gap-4 sm:grid-cols-2">
      {sorted.map((f) => {
        const count = f.vote_count + (optimistic[f.id] ?? 0);
        const hasVoted = voted.has(f.id);
        return (
          <li
            key={f.id}
            className="flex flex-col gap-3 rounded-2xl border-2 border-ink/15 bg-paper p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl leading-none">{f.icon ?? "•"}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3
                    style={HEAD_FONT}
                    className="text-lg font-bold uppercase leading-tight text-ink sm:text-xl"
                  >
                    {f.title}
                  </h3>
                  <span
                    style={HEAD_FONT}
                    className={
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] " +
                      STATUS_TONE[f.status]
                    }
                  >
                    {STATUS_LABEL[f.status]}
                  </span>
                </div>
                {f.description && (
                  <p className="mt-1.5 text-sm leading-snug text-ink/70 sm:text-[15px]">
                    {f.description}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span
                style={HEAD_FONT}
                className="text-xs font-bold uppercase tracking-[0.15em] text-ink/55"
              >
                {count} {count === 1 ? "hlas" : count < 5 ? "hlasy" : "hlasů"}
              </span>
              <button
                type="button"
                onClick={() => vote(f.id)}
                disabled={hasVoted || f.status === "done" || f.status === "rejected"}
                style={HEAD_FONT}
                className={
                  "min-h-[40px] rounded-full px-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors disabled:opacity-50 " +
                  (hasVoted
                    ? "bg-[#15803d]/15 text-[#15803d]"
                    : "bg-blue text-paper hover:bg-blue-deep")
                }
              >
                {hasVoted ? "Hlasovali jste ✓" : "Chci to taky"}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function SuggestionForm() {
  type S =
    | { kind: "idle"; title: string; description: string; email: string; error: string | null }
    | { kind: "sending" }
    | { kind: "thanks" };

  const [s, setS] = useState<S>({
    kind: "idle",
    title: "",
    description: "",
    email: "",
    error: null,
  });

  async function submit() {
    if (s.kind !== "idle") return;
    if (s.title.trim().length < 4) {
      setS({ ...s, error: "Napište prosím alespoň 4 znaky." });
      return;
    }
    const payload = { ...s };
    setS({ kind: "sending" });
    try {
      const res = await fetch("/api/suggest-feature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title.trim(),
          description: payload.description.trim() || undefined,
          email: payload.email.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("send");
      setS({ kind: "thanks" });
      setTimeout(
        () => setS({ kind: "idle", title: "", description: "", email: "", error: null }),
        3500,
      );
    } catch {
      setS({ ...payload, kind: "idle", error: "Nepovedlo se. Zkuste to znovu." });
    }
  }

  if (s.kind === "thanks") {
    return (
      <div className="rounded-2xl border-2 border-[#15803d]/30 bg-[#15803d]/[0.04] p-6 text-center">
        <div
          style={HEAD_FONT}
          className="text-2xl font-bold uppercase text-[#15803d]"
        >
          Díky!
        </div>
        <p className="mt-1 text-sm text-ink/75">
          Návrh nám dorazil. Pokud bude dávat smysl, přidáme ho do roadmapy.
        </p>
      </div>
    );
  }

  const sending = s.kind === "sending";
  const title = s.kind === "idle" ? s.title : "";
  const description = s.kind === "idle" ? s.description : "";
  const email = s.kind === "idle" ? s.email : "";
  const error = s.kind === "idle" ? s.error : null;

  return (
    <div className="rounded-2xl border-2 border-ink/15 bg-paper p-4 sm:p-6">
      <h3
        style={HEAD_FONT}
        className="text-xl font-bold uppercase leading-tight text-blue sm:text-2xl"
      >
        Něco vám chybí?
      </h3>
      <p className="mt-1 text-sm leading-snug text-ink/70">
        Napište nám, co byste v Plzeňské únikovce uvítali. Když přijde víc
        návrhů stejného typu, dáme to nahoru na hlasování.
      </p>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span
            style={HEAD_FONT}
            className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-ink/65"
          >
            Stručně co
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) =>
              s.kind === "idle" && setS({ ...s, title: e.target.value })
            }
            disabled={sending}
            maxLength={200}
            placeholder="Např.: SMS upozornění na ráno"
            className="w-full rounded-xl border-2 border-ink/20 bg-white px-3 py-2 text-base text-ink outline-none focus:border-blue"
          />
        </label>

        <label className="block">
          <span
            style={HEAD_FONT}
            className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-ink/65"
          >
            Detail (nepovinné)
          </span>
          <textarea
            value={description}
            onChange={(e) =>
              s.kind === "idle" && setS({ ...s, description: e.target.value })
            }
            disabled={sending}
            rows={3}
            maxLength={2000}
            placeholder="Krátce v čem to pomůže, koho potěší."
            className="w-full resize-y rounded-xl border-2 border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-blue"
          />
        </label>

        <label className="block">
          <span
            style={HEAD_FONT}
            className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-ink/65"
          >
            E-mail (nepovinné, jen pokud chcete vědět)
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) =>
              s.kind === "idle" && setS({ ...s, email: e.target.value })
            }
            disabled={sending}
            placeholder="vy@example.cz"
            className="w-full rounded-xl border-2 border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blue"
          />
        </label>

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={sending}
          style={HEAD_FONT}
          className="w-full rounded-full bg-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-blue-deep disabled:opacity-50 sm:w-auto"
        >
          {sending ? "Posílám…" : "Odeslat návrh"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;

/** Inline řádek na detail page, který otevře globální FeedbackWidget
 *  přes custom event plzu:open-feedback. */
export function FeedbackInlineCta({ context }: { context?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("plzu:open-feedback"))}
      className="group inline-flex items-center gap-2 text-left text-sm text-ink/65 transition-colors hover:text-blue"
    >
      <span
        aria-hidden
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue/10 text-[10px] text-blue group-hover:bg-blue group-hover:text-paper"
      >
        ⚑
      </span>
      <span>
        {context ? `Něco u „${context}" není správně? ` : "Něco není správně? "}
        <span
          style={HEAD_FONT}
          className="font-bold uppercase tracking-[0.15em] text-blue group-hover:underline"
        >
          Napište nám
        </span>
      </span>
    </button>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Stránka neexistuje",
  description:
    "Hledaná stránka v Plzeňské únikovce neexistuje. Vraťte se na úvod nebo otevřete mapu.",
};

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-12 text-center">
      <div className="mx-auto flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/icon-on-blue.svg"
          alt=""
          className="h-full w-full"
        />
      </div>

      <div className="space-y-3">
        <div
          style={HEAD_FONT}
          className="text-[11px] font-bold uppercase tracking-[0.4em] text-blue"
        >
          Chyba 404
        </div>
        <h1
          style={HEAD_FONT}
          className="text-4xl font-bold uppercase leading-[0.95] text-ink sm:text-5xl md:text-6xl"
        >
          Tahle ulice je slepá.
        </h1>
        <p className="mx-auto max-w-md text-base text-ink/65 sm:text-lg">
          Stránka, kterou hledáte, neexistuje nebo byla přesunuta. Otočte
          se a zkuste to znovu.
        </p>
      </div>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/"
          style={HEAD_FONT}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-blue px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-paper transition-colors hover:bg-blue-deep sm:text-base"
        >
          ← Úvod
        </Link>
        <Link
          href="/mapa"
          style={HEAD_FONT}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border-2 border-ink/20 bg-paper px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-ink transition-colors hover:border-ink sm:text-base"
        >
          Mapa
        </Link>
        <Link
          href="/seznam"
          style={HEAD_FONT}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border-2 border-ink/20 bg-paper px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-ink transition-colors hover:border-ink sm:text-base"
        >
          Seznam
        </Link>
      </div>
    </div>
  );
}

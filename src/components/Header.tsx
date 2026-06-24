import Link from "next/link";

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-blue-deep text-paper">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-2 sm:gap-3"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ods-logo.svg"
            alt="ODS"
            className="h-4 w-auto shrink-0 sm:h-5"
          />
          <span
            style={HEAD_FONT}
            className="truncate text-base font-bold uppercase tracking-tight sm:text-[1.1rem]"
          >
            Plzeňská únikovka
          </span>
        </Link>
        <nav
          style={HEAD_FONT}
          className="ml-auto flex shrink-0 items-center text-[10px] font-bold uppercase tracking-[0.3em] sm:text-[11px]"
        >
          <Link
            href="/"
            className="px-2 py-1.5 text-paper/70 transition-colors hover:text-paper sm:px-3"
          >
            Live
          </Link>
          <Link
            href="/mapa"
            className="px-2 py-1.5 text-paper/70 transition-colors hover:text-paper sm:px-3"
          >
            Mapa
          </Link>
          <Link
            href="/seznam"
            className="px-2 py-1.5 text-paper/70 transition-colors hover:text-paper sm:px-3"
          >
            Seznam
          </Link>
          <Link
            href="/roadmap"
            className="ml-1 inline-flex items-center gap-1 rounded-full bg-sky/15 px-2.5 py-1 text-sky transition-colors hover:bg-sky/25 sm:ml-2 sm:px-3"
          >
            <span aria-hidden>✦</span>
            <span className="hidden xs:inline sm:inline">Hlasování</span>
            <span className="xs:hidden sm:hidden">Roadmap</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

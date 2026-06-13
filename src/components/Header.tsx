"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AreaSelect } from "./AreaSelect";

const NAV = [
  { href: "/", label: "Přehled" },
  { href: "/doprava", label: "Doprava" },
  { href: "/zastupitelstvo", label: "Zastupitelstvo" },
  { href: "/stavby", label: "Stavby" },
  { href: "/komunita", label: "Komunita" },
];

export function Header() {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-blue text-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ods-logo.svg" alt="ODS" className="h-7 w-auto" />
          <span className="leading-none">
            <span className="head block text-lg font-bold uppercase tracking-wide">
              Plzeň přehledně
            </span>
            <span className="block text-[11px] font-medium text-sky">
              od ODS
            </span>
          </span>
        </Link>

        <div className="ml-auto">
          <AreaSelect />
        </div>
      </div>

      <nav className="border-t border-white/10 bg-blue/95">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(n.href)
                  ? "border-sky text-white"
                  : "border-transparent text-white/70 hover:text-white"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

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
    <header className="sticky top-0 z-50 bg-blue-deep text-white">
      {/* masthead */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ods-logo.svg" alt="ODS" className="h-7 w-auto" />
            <span className="leading-none">
              <span className="head block text-[1.35rem] font-bold uppercase leading-none tracking-tight">
                Plzeň přehledně
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.25em] text-sky">
                Občanský přehled · od ODS
              </span>
            </span>
          </Link>

          <div className="ml-auto">
            <AreaSelect />
          </div>
        </div>
      </div>

      {/* navigace */}
      <nav className="bg-blue">
        <div className="mx-auto flex max-w-6xl gap-0.5 overflow-x-auto px-2 sm:px-5">
          {NAV.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`head relative whitespace-nowrap px-3.5 py-3 text-sm font-medium uppercase tracking-wide transition-colors ${
                  active ? "text-white" : "text-white/55 hover:text-white"
                }`}
              >
                {n.label}
                {active && (
                  <span className="absolute inset-x-2 -bottom-px h-[3px] bg-sky" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

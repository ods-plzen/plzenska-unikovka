"use client";

import Link from "next/link";
import { AreaSelect } from "./AreaSelect";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-blue-deep text-white">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" className="h-9 w-9" />
            <span className="leading-none">
              <span className="head block text-[1.35rem] font-bold uppercase leading-none tracking-tight">
                Plzeňská únikovka
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.25em] text-sky">
                Mapa uzavírek a MHD odklonů
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="hidden text-[9px] font-semibold uppercase tracking-[0.3em] text-white/55 sm:inline">
                Provozuje
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ods-logo.svg"
                alt="ODS"
                className="h-5 w-auto sm:h-6"
              />
            </div>
            <AreaSelect />
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { AreaSelect } from "./AreaSelect";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-blue-deep text-white">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
          <Link href="/" className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" className="h-7 w-7 shrink-0 sm:h-9 sm:w-9" />
            <span className="min-w-0 leading-none">
              <span className="head block truncate text-base font-bold uppercase leading-none tracking-tight sm:text-[1.35rem]">
                Plzeňská únikovka
              </span>
              <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.25em] text-sky sm:block">
                Mapa uzavírek a MHD odklonů
              </span>
            </span>
          </Link>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="hidden text-[9px] font-semibold uppercase tracking-[0.3em] text-white/55 sm:inline">
                Provozuje
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ods-logo.svg"
                alt="ODS"
                className="h-4 w-auto sm:h-6"
              />
            </div>
            <div className="hidden sm:block">
              <AreaSelect />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

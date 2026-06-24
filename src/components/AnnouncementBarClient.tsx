"use client";

import { useEffect, useState } from "react";

const LS_KEY = "pu.dismissed_changelog";

function readDismissed(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((n) => typeof n === "number") : []);
  } catch {
    return new Set();
  }
}

function writeDismissed(set: Set<number>): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...set]));
  } catch {
    // ignorujeme — Safari private mode atd.
  }
}

export function AnnouncementBarClient({
  entryId,
  children,
}: {
  entryId: number;
  children: React.ReactNode;
}) {
  // SSR vždy vykreslí — zabráníme blikání, pokud uživatel novinku ještě nezavřel.
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const dismissed = readDismissed();
    if (dismissed.has(entryId)) setHidden(true);
  }, [entryId]);

  if (hidden) return null;

  function dismiss() {
    const next = readDismissed();
    next.add(entryId);
    writeDismissed(next);
    setHidden(true);
  }

  return (
    <div className="relative">
      {children}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Skrýt toto oznámení"
        className="absolute right-1 top-1 z-10 rounded-full p-1 text-ink/45 transition-colors hover:bg-ink/10 hover:text-ink sm:right-2 sm:top-1.5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="h-3 w-3 sm:h-3.5 sm:w-3.5"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

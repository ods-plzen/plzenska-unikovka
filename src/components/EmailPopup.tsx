"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { EmailSignup } from "@/components/EmailSignup";

/**
 * Nenápadný popup pro sběr e-mailů — kartička zespodu po 15 s na stránce.
 * Neukazuje se: přihlášeným (pu-email-done), po zavření 30 dní
 * (pu-email-popup-dismissed) a na /email/* landing stránkách.
 * Vlevo dole, aby se nepral s FeedbackWidgetem (vpravo dole).
 */
const DONE_KEY = "pu-email-done";
const DISMISS_KEY = "pu-email-popup-dismissed";
const DISMISS_DAYS = 30;
const DELAY_MS = 15_000;

export function EmailPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/email")) return;
    try {
      if (localStorage.getItem(DONE_KEY)) return;
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 86_400_000) return;
    } catch {
      return; // bez localStorage (private mode) popup radši vůbec
    }
    const t = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!open) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignorujeme — popup se jen zavře pro tuhle návštěvu
    }
    setOpen(false);
  }

  return (
    <div
      role="dialog"
      aria-label="E-mailová upozornění na uzavírky"
      style={{ animation: "pu-slide-up 0.35s ease-out" }}
      className="fixed bottom-24 left-3 right-3 z-40 rounded-xl border border-white/10 bg-blue-deep p-5 text-white shadow-[0_16px_48px_rgba(14,42,99,0.45)] sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm"
    >
      <button
        onClick={dismiss}
        aria-label="Zavřít"
        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
      >
        ✕
      </button>
      <div className="head pr-8 text-base font-bold uppercase tracking-tight">
        Nová uzavírka? Dáme vědět e-mailem
      </div>
      <div className="mt-3">
        <EmailSignup />
      </div>
    </div>
  );
}

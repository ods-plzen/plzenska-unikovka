"use client";

import { useState } from "react";

/**
 * Sdílení detailu uzavírky — Web Share API na mobilu (nativní sheet,
 * ideální pro FB skupiny / Messenger), clipboard fallback na desktopu.
 */
export function ShareButton({
  title,
  text,
  className = "",
}: {
  title: string;
  text?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: text ?? title, url });
        return;
      } catch {
        // uživatel zavřel share sheet → nic
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard nedostupný (http, permissions) — necháme být
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
        copied
          ? "border-sky bg-sky text-white"
          : "border-line bg-white text-blue hover:border-sky"
      } ${className}`}
    >
      <span aria-hidden>{copied ? "✓" : "↗"}</span>
      {copied ? "Odkaz zkopírován" : "Sdílet"}
    </button>
  );
}

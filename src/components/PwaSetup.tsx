"use client";

import { useEffect } from "react";
import { pushSupported, syncPush } from "@/lib/push";

/**
 * Tichá inicializace PWA: registrace service workeru + re-sync push odběru
 * (jen pokud už uživatel notifikace povolil — žádný prompt při načtení).
 */
export function PwaSetup() {
  useEffect(() => {
    if (!pushSupported()) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (Notification.permission === "granted") {
      // fire-and-forget — drží serverový seznam watched aktuální
      void syncPush(false).catch(() => {});
    }
  }, []);
  return null;
}

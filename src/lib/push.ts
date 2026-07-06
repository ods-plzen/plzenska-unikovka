// Klientská strana web push — registrace SW, odběr, sync hlídaných uzavírek.
// Volá se z WatchButton (po kliknutí = user gesture → smí požádat o permission)
// a z PwaSetup (tichý re-sync při načtení, jen když je permission už granted).

import { watchedList } from "@/lib/watch";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (ch) => ch.charCodeAt(0));
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;
  return navigator.serviceWorker.register("/sw.js");
}

/**
 * Zajistí push odběr a pošle na server aktuální seznam hlídaných uzavírek.
 * @param interactive true = smí vyvolat permission prompt (jen z user gesture)
 */
export async function syncPush(
  interactive = false,
): Promise<"ok" | "denied" | "unsupported" | "skipped"> {
  if (!pushSupported()) return "unsupported";

  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) return "unsupported";

  if (Notification.permission === "denied") return "denied";
  if (Notification.permission === "default") {
    if (!interactive) return "skipped";
    const result = await Notification.requestPermission();
    if (result !== "granted") return "denied";
  }

  const reg = await getRegistration();
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
    });
  }

  const json = sub.toJSON();
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscription: { endpoint: json.endpoint, keys: json.keys },
      watched: watchedList(),
    }),
  });
  return "ok";
}

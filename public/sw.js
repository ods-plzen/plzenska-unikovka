/* Service worker Plzeňské únikovky.
 * Záměrně BEZ fetch/cache handleru — data se mění denně a stale cache by
 * byla horší než žádná. SW tu je pro web push notifikace.
 * Kanál je výhradně dopravní (viz docs/UX-BENCHMARK-A-PLAYBOOK-2026-07-06.md). */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch {
    /* neparsovatelný payload → default */
  }
  const title = data.title || "Plzeňská únikovka";
  e.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/";
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((tabs) => {
      for (const tab of tabs) {
        if (tab.url.includes(self.location.origin) && "focus" in tab) {
          tab.navigate(url);
          return tab.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});

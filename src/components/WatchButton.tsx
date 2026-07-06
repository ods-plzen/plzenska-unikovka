"use client";

import { useSyncExternalStore } from "react";
import { subscribeWatch, isWatched, toggleWatch } from "@/lib/watch";
import { syncPush } from "@/lib/push";

export function WatchButton({
  id,
  className = "",
}: {
  id: string;
  className?: string;
}) {
  const watched = useSyncExternalStore(
    subscribeWatch,
    () => isWatched(id),
    () => false // na serveru vždy false → bez hydration mismatche
  );

  return (
    <button
      type="button"
      onClick={() => {
        const turningOn = !isWatched(id);
        toggleWatch(id);
        // Zapnutí hlídání = user gesture → smíme požádat o notifikace.
        // Vypnutí jen tiše synchronizuje seznam na server.
        void syncPush(turningOn).catch(() => {});
      }}
      aria-pressed={watched}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
        watched
          ? "border-sky bg-sky text-white"
          : "border-line bg-white text-blue hover:border-sky"
      } ${className}`}
    >
      <span aria-hidden>{watched ? "★" : "☆"}</span>
      {watched ? "Hlídáte tuto ulici" : "Hlídat tuto ulici"}
    </button>
  );
}

"use client";

import { useSyncExternalStore } from "react";
import { subscribeWatch, isWatched, toggleWatch } from "@/lib/watch";

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
      onClick={() => toggleWatch(id)}
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

"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import type { Closure, RestrictedRoad } from "@/lib/types";

// Leaflet sahá na window → jen na klientu, bez SSR.
const Inner = dynamic(() => import("./ClosureMapInner"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center rounded-xl bg-line/40 text-sm text-muted"
      style={{ height: 420 }}
    >
      Načítám mapu…
    </div>
  ),
});

export function ClosureMap({
  closures,
  restrictedRoads,
  height,
  selectedId,
  onSelect,
}: {
  closures: Closure[];
  restrictedRoads?: RestrictedRoad[];
  height?: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  return (
    <Inner
      closures={closures}
      restrictedRoads={restrictedRoads}
      height={height}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  );
}

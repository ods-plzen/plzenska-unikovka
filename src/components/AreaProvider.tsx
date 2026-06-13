"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_AREA } from "@/data/areas";
import { getArea, setArea, subscribeArea } from "@/lib/areaStore";

// Provider zůstává jako jednoduchý passthrough (store žije mimo React strom),
// aby layout nemusel řešit context — komponenty čtou přes useArea().
export function AreaProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useArea() {
  const area = useSyncExternalStore(
    subscribeArea,
    getArea,
    () => DEFAULT_AREA // server snapshot
  );
  return { area, setArea };
}

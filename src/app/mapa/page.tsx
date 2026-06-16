import { Suspense } from "react";
import type { Metadata } from "next";
import { MapView } from "@/components/views/MapView";

export const metadata: Metadata = {
  title: "Velká mapa všech uzavírek",
  description:
    "Všechny aktivní uzavírky v Plzni na velké mapě se severity hierarchií, časovým filtrem a side panelem. Pro dispečery a řidiče.",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted">Načítám mapu…</div>
      }
    >
      <MapView />
    </Suspense>
  );
}

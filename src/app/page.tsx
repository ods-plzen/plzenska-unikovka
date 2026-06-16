import { Suspense } from "react";
import { MapView } from "@/components/views/MapView";

export default function Page() {
  // MapView používá useSearchParams → musí být v Suspense.
  return (
    <Suspense fallback={<div className="text-sm text-muted">Načítám…</div>}>
      <MapView />
    </Suspense>
  );
}

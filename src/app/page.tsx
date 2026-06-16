import { Suspense } from "react";
import { HomeView } from "@/components/views/HomeView";

export default function Page() {
  // HomeView používá useSearchParams → musí být v Suspense.
  return (
    <Suspense fallback={<div className="text-sm text-muted">Načítám…</div>}>
      <HomeView />
    </Suspense>
  );
}

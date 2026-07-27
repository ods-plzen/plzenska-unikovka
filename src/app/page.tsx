import { Suspense } from "react";
import { HomeView } from "@/components/views/HomeView";
import { HomeRoadmapTeaser } from "@/components/HomeRoadmapTeaser";
import { SkoreMesta } from "@/components/SkoreMesta";

// ISR — Supabase data (hlasování) se obnoví do 60s.
export const revalidate = 60;

export default function Page() {
  // HomeView používá useSearchParams → musí být v Suspense.
  return (
    <>
      <SkoreMesta />
      <Suspense fallback={<div className="text-sm text-muted">Načítám…</div>}>
        <HomeView roadmapSlot={<HomeRoadmapTeaser />} />
      </Suspense>
    </>
  );
}

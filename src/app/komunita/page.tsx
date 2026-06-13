import type { Metadata } from "next";
import { KomunitaView } from "@/components/views/KomunitaView";

export const metadata: Metadata = { title: "Komunita — Plzeň přehledně" };

export default function Page() {
  return <KomunitaView />;
}

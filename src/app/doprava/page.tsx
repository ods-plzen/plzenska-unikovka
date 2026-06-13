import type { Metadata } from "next";
import { DopravaView } from "@/components/views/DopravaView";

export const metadata: Metadata = { title: "Doprava a uzavírky — Plzeň přehledně" };

export default function Page() {
  return <DopravaView />;
}

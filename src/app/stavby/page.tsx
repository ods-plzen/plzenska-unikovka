import type { Metadata } from "next";
import { StavbyView } from "@/components/views/StavbyView";

export const metadata: Metadata = { title: "Stavby a sliby — Plzeň přehledně" };

export default function Page() {
  return <StavbyView />;
}

import type { Metadata } from "next";
import { ZastupitelstvoView } from "@/components/views/ZastupitelstvoView";

export const metadata: Metadata = {
  title: "Ze zastupitelstva — Plzeň přehledně",
};

export default function Page() {
  return <ZastupitelstvoView />;
}

import type { Metadata } from "next";
import { StavbyView } from "@/components/views/StavbyView";

export const metadata: Metadata = {
  title: "Stavby a sliby",
  description:
    "Tracker plzeňských staveb a slibů: harmonogram, slibovaný termín, skutečný stav.",
};

export default function Page() {
  return <StavbyView />;
}

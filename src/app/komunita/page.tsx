import type { Metadata } from "next";
import { KomunitaView } from "@/components/views/KomunitaView";

export const metadata: Metadata = {
  title: "Komunita",
  description:
    "Plzeňské komunitní zprávy: nálezy, ztráty, akce a sousedské tipy z jednotlivých obvodů.",
};

export default function Page() {
  return <KomunitaView />;
}

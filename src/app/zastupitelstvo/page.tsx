import type { Metadata } from "next";
import { ZastupitelstvoView } from "@/components/views/ZastupitelstvoView";

export const metadata: Metadata = {
  title: "Ze zastupitelstva",
  description:
    "Hlasování, výroky a rozhodnutí Zastupitelstva města Plzně. Plně dohledatelné zdroje u každé položky.",
};

export default function Page() {
  return <ZastupitelstvoView />;
}

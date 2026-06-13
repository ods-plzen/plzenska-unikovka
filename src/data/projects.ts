import type { Phase } from "@/lib/types";

export interface Project {
  id: string;
  title: string;
  oblast: string;
  promise: string; // co bylo slíbeno / o čem se rozhodlo
  status: string; // stav jednou větou
  statusKind: "now" | "plan" | "done";
  phases: Phase[];
  src: string;
  srcUrl?: string; // odkaz na oficiální zdroj
}

// Accountability timeline — slíbeno → stav → termín. Jen ověřená fakta.
export const projects: Project[] = [
  {
    id: "chlum",
    title: "Rozhledna a vrch Chlum",
    oblast: "Plzeň 4",
    promise:
      "Zachovat Chlum ve veřejných rukou — město kupuje rozhlednu i okolní pozemky.",
    status: "Koupě rozhledny schválena zastupitelstvem v poměru 28 : 0.",
    statusKind: "done",
    phases: [
      ["Výkup lesa (33 ha)", "2024 · 20,4 mil. Kč", "done"],
      ["Schválení koupě rozhledny", "11. 6. 2026 · 4,52 mil. Kč", "done"],
      ["Převod a zpřístupnění", "2026", "now"],
      ["Studie Chlum — záměr území", "v přípravě", ""],
    ],
    src: "Magistrát města Plzně — využití předkupního práva (usnesení ZMP)",
    srcUrl:
      "https://plzen.eu/o-meste/aktuality/aktuality-z-mesta/plzen-vyuzije-predkupni-pravo-na-odkup-objektu-rozhledny-chlum/",
  },
  {
    id: "masarykova",
    title: "Rekonstrukce Masarykovy třídy",
    oblast: "Plzeň 4",
    promise: "Opravit povrch a zastávky v úseku Rokycanská – Na Dlouhých.",
    status: "1. etapa, objízdné trasy platí od 29. 6.",
    statusKind: "now",
    phases: [
      ["Příprava", "do 6/2026", "done"],
      ["1. etapa", "léto 2026", "now"],
      ["2. etapa", "podzim 2026", ""],
      ["Dokončení", "2027", ""],
    ],
    src: "plzen.eu/doprava",
  },
  {
    id: "americka",
    title: "Americká třída — sdílená zóna",
    oblast: "Plzeň 3",
    promise: "Změna režimu na sdílenou zónu 20 km/h v úseku Prokopova – Klatovská.",
    status: "Bod o změně režimu stažen, vrátí se na zastupitelstvo v září.",
    statusKind: "plan",
    phases: [
      ["Stavební úpravy", "dokončení 11. 8. 2026", "now"],
      ["Rozhodnutí o režimu", "září 2026", ""],
    ],
    src: "NÁM T/1 · plzen.eu/doprava",
  },
];

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
    id: "kostel-sv-jiri",
    title: "Revitalizace okolí kostela sv. Jiří",
    oblast: "Plzeň 4",
    promise:
      "Proměnit okolí kostela sv. Jiří v Doubravce podle potřeb lidí — zapojení obyvatel přes pocitovou mapu.",
    status:
      "Hotová analýza pocitové mapy: 129 respondentů, téměř 1 600 bodů, 67 % z obvodu Plzeň 4.",
    statusKind: "now",
    phases: [
      ["Pocitová mapa — sběr od obyvatel", "2026", "done"],
      ["Analýza území (silná a slabá místa)", "2026", "now"],
      ["Návrh revitalizace", "v přípravě", ""],
    ],
    src: "ÚMO Plzeň 4 / Magistrát města Plzně — aktuality",
    srcUrl:
      "https://plzen.eu/o-meste/aktuality/aktuality-z-mesta/ctyrka-planuje-promenu-okoli-kostela-sv-jiri-obyvatele-pomohli-pres-pocitovou-mapu/",
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
    src: "Magistrát města Plzně — aktuality (rekonstrukce Americké)",
    srcUrl:
      "https://plzen.eu/o-meste/aktuality/aktuality-z-mesta/rekonstrukce-americke-vstoupi-od-22-cervna-do-2-etapy-rozsiri-se-dopravni-opatreni/",
  },
];

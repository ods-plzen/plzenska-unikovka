// Doménové typy pro Plzeň přehledně.

export type ClosureStatus = "now" | "plan" | "done";

export interface Closure {
  id: string;
  name: string;
  akce: string;
  state: string;
  status: ClosureStatus;
  color: string;
  oblast: string;
  termin: string;
  ways: [number, number][][];
  point?: boolean; // bodový prvek (náměstí, lávka) → marker místo čáry
  approx?: boolean; // přibližná poloha
  // JSDI / SUPERDIO metadata (z agp.plzen.eu ArcGIS REST API)
  popis?: string; // úplný Nazev z JSDI s vším info (ulice, obvod, důvod, datum, vydal…)
  typ?: string;
  subtyp?: string;
  zdroj?: string; // "JSDI" | "SUPERDIO" | "RIA"
  jsdiId?: string | null;
  superdioId?: number | null;
  // Phase 1 mapy: severity klasifikace + ISO data, pre-computed v jsdi.py
  severity?: import("./severity").Severity;
  od?: string; // ISO date YYYY-MM-DD — kdy uzavírka začíná
  do?: string; // ISO date — kdy uzavírka končí
}

export type Phase = [label: string, when: string, state: "done" | "now" | ""];

export interface ClosureExtra {
  title: string;
  sub: string;
  phases?: Phase[];
  means?: string[];
  objizdka?: string[]; // objízdné trasy
  mhd?: string[]; // legacy MHD bullety (fallback, když chybí mhdInfo)
  mhdInfo?: MhdInfo; // strukturovaná MHD data — preferováno
  parkovani?: string;
  source?: { label: string; url: string };
}

export type MhdMode = "tram" | "bus" | "trolley" | "night";

export interface MhdReroute {
  lines?: string[]; // ["22", "32"] — pouze ověřená čísla z PMDP, jinak vynechat
  mode?: MhdMode; // typ provozu, ovlivní barvu badge
  via: string; // popis odklonu, např. "přes Anglické nábřeží → Kopeckého → Smetanovy sady"
  note?: string;
}

export interface MhdTempStop {
  name: string; // název původní/dotčené zastávky
  where: string; // kam je dočasně přesunuta
  note?: string;
}

export interface MhdInfo {
  summary?: string; // krátké shrnutí, např. "Bus zachován, točna přesunuta"
  reroutes?: MhdReroute[];
  tempStops?: MhdTempStop[];
  notes?: string[]; // doplňující informace bez vlastní sekce
  sourceUrl?: string;
  sourceLabel?: string;
}

export interface Area {
  id: string;
  label: string;
  short: string;
}

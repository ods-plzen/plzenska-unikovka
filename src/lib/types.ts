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
}

export type Phase = [label: string, when: string, state: "done" | "now" | ""];

export interface ClosureExtra {
  title: string;
  sub: string;
  phases?: Phase[];
  means?: string[];
  objizdka?: string[]; // objízdné trasy
  mhd?: string[]; // MHD — odklony linek, zastávky
  parkovani?: string;
  source?: { label: string; url: string };
}

export interface Vote {
  who: string;
  role: string;
  av: string;
  stmt: string;
  tags: string[];
  pro?: number;
  proti?: number;
  zdr?: number;
  src: string;
  rec?: string;
  note?: string;
}

export interface LostItem {
  icon: string;
  state: string;
  b: string;
  meta: string;
  lat: number;
  lon: number;
}

export interface EventItem {
  d: string;
  h: string;
  s: string;
  lat: number;
  lon: number;
}

export interface Community {
  lost: LostItem[];
  events: EventItem[];
}

export interface Area {
  id: string;
  label: string;
  short: string;
}

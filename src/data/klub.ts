// ODS klub v Zastupitelstvu města Plzně (volební období 2022–2026).
// Zdroj: oficiální Složení Zastupitelstva města Plzně (plzen.eu).
// Pozn.: role doplnit/ověřit — jména dle oficiálního složení.

export interface KlubMember {
  name: string;
  titul?: string;
  role?: string;
  highlight?: boolean; // zvýraznění (kandidát na primátora)
}

export const klubSource = {
  label: "Oficiální složení Zastupitelstva města Plzně",
  url: "https://plzen.eu/urad/organy-mesta/zastupitelstvo-mesta-plzne/slozeni-zastupitelstva-mesta-plzne/",
};

export const klub: KlubMember[] = [
  { name: "Martin Baxa", titul: "Mgr." },
  { name: "Lumír Aschenbrenner", titul: "Ing." },
  { name: "Pavel Šindelář", titul: "Mgr.", role: "předseda ODS Plzeň-město" },
  { name: "David Šlouf", titul: "Bc., MBA" },
  {
    name: "Lukáš Hegner",
    titul: "Mgr.",
    role: "kandidát na primátora",
    highlight: true,
  },
  { name: "Veronika Nová Jilichová", titul: "MUDr., Ing." },
  { name: "Helena Řežábová", titul: "Ing." },
  { name: "Jan Kalián", titul: "Bc." },
  { name: "Kristýna Nachtmann Švédová", titul: "PhDr." },
];

// Iniciály pro avatar.
export function initials(name: string): string {
  const p = name.split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

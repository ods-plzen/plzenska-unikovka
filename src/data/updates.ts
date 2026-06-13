// Digest „Co je nového" — chronologický přehled změn napříč sekcemi.
// Ručně udržované, každá položka odkazuje do appky. Datum = ISO pro řazení.

export type UpdateKind = "doprava" | "zastupitelstvo" | "stavby" | "komunita";

export interface Update {
  date: string; // ISO (řazení)
  display: string; // české datum
  kind: UpdateKind;
  title: string;
  href: string;
  upcoming?: boolean; // nadcházející milník
}

export const KIND_META: Record<UpdateKind, { label: string; color: string }> = {
  doprava: { label: "Doprava", color: "var(--ods-red)" },
  zastupitelstvo: { label: "Zastupitelstvo", color: "var(--ods-blue)" },
  stavby: { label: "Stavby", color: "var(--ods-amber)" },
  komunita: { label: "Komunita", color: "var(--ods-green)" },
};

export const updates: Update[] = [
  {
    date: "2026-06-22",
    display: "22. 6. 2026",
    kind: "doprava",
    title: "Americká: od 22. 6. začíná 2. etapa, uzavře se zbytek ulice",
    href: "/doprava/americka",
    upcoming: true,
  },
  {
    date: "2026-06-12",
    display: "12. 6. 2026",
    kind: "zastupitelstvo",
    title:
      "KD Peklo: zastupitelé posílili rozpočet, vypsána soutěž na 1. etapu",
    href: "/zastupitelstvo",
  },
  {
    date: "2026-06-11",
    display: "11. 6. 2026",
    kind: "zastupitelstvo",
    title: "Zastupitelstvo schválilo koupi rozhledny Chlum (28 : 0)",
    href: "/zastupitelstvo",
  },
  {
    date: "2026-06-11",
    display: "11. 6. 2026",
    kind: "doprava",
    title: "Americká: bod o změně dopravního režimu stažen, vrátí se na podzim",
    href: "/doprava/americka",
  },
  {
    date: "2026-06-10",
    display: "10. 6. 2026",
    kind: "stavby",
    title: "Kostel sv. Jiří: hotová analýza pocitové mapy (129 respondentů)",
    href: "/stavby",
  },
  {
    date: "2026-05-04",
    display: "4. 5. 2026",
    kind: "doprava",
    title: "28. října (Bílá Hora): zahájena úplná uzavírka, platí objízdné trasy",
    href: "/doprava/28-rijna",
  },
];

// Nejnovější první.
export function sortedUpdates(): Update[] {
  return [...updates].sort((a, b) => (a.date < b.date ? 1 : -1));
}

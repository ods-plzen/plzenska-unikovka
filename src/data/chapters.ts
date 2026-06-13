// Kapitoly nad záznamem jednání ZMP — scannable přehled bodů.
// Shrnutí jsou AI-asistovaná z přepisu (whisper) a ručně ověřená.
// Pozn.: oficiální záznam se přehrává dynamicky, proto odkazujeme na stránku
// záznamů, ne na přesný čas (permalink na čas doplníme, až bude k dispozici).

export interface Chapter {
  topic: string;
  title: string;
  summary: string;
  tags: string[];
  result?: string;
}

export interface Session {
  label: string;
  date: string;
  zaznamUrl: string;
  chapters: Chapter[];
}

export const session: Session = {
  label: "33. zasedání Zastupitelstva města Plzně",
  date: "11. 6. 2026",
  zaznamUrl:
    "https://plzen.eu/o-meste/samosprava/zastupitelstvo-mesta/zaznamy-z-jednani/",
  chapters: [
    {
      topic: "Bod 44 · Majetek",
      title: "Koupě rozhledny Chlum",
      summary:
        "Rozprava k ceně a podmínkám koupě objektu rozhledny — město objekt z dražby pořizuje za 7,7násobek znaleckého odhadu, využívá předkupní právo k pozemku pod rozhlednou. Poté následovalo hlasování.",
      tags: ["majetek", "Doubravka"],
      result: "28 pro · 0 proti · 0 zdržel se · 9 nehlasovalo → schváleno",
    },
    {
      topic: "Doprava",
      title: "Rekonstrukce Americké třídy",
      summary:
        "Debata o informovanosti vlastníků a harmonogramu rekonstrukce — další etapa začíná 22. 6., kdy se uzavře zbývající část Americké. Bod o změně dopravního režimu byl stažen a vrátí se na podzim.",
      tags: ["doprava", "centrum"],
    },
    {
      topic: "Úvod jednání",
      title: "Zpráva o činnosti Rady města a primátora",
      summary:
        "Zahájení podle schváleného programu a zpráva o činnosti Rady města Plzně a primátora za období 14. 5. – 10. 6. 2026, následovaná dotazy zastupitelů.",
      tags: ["samospráva"],
    },
  ],
};

// Whitelist oficiálních zdrojů — transparentnost, odkud data pocházejí.
export interface DataSource {
  label: string;
  what: string;
  url: string;
}

export const dataSources: DataSource[] = [
  {
    label: "plzen.eu/doprava",
    what: "Uzavírky a dopravní omezení",
    url: "https://plzen.eu/doprava/",
  },
  {
    label: "PMDP — Změny v dopravě",
    what: "Výluky a odklony MHD",
    url: "https://www.pmdp.cz/cz/informace-o-preprave/zmeny-v-doprave/",
  },
  {
    label: "Rozpočet města Plzně",
    what: "Rozpočet a investice",
    url: "https://rozpocetmesta.plzen.eu/",
  },
  {
    label: "Intenzita dopravy",
    what: "Živá dopravní situace",
    url: "https://intenzitadopravy.plzen.eu/",
  },
  {
    label: "Záznamy zastupitelstva",
    what: "Videozáznamy jednání ZMP",
    url: "https://plzen.eu/o-meste/samosprava/zastupitelstvo-mesta/zaznamy-z-jednani/",
  },
  {
    label: "Otevřená data Plzně",
    what: "Datové sady města",
    url: "https://opendata.plzen.eu/",
  },
  {
    label: "OpenStreetMap",
    what: "Geometrie ulic a obvodů",
    url: "https://www.openstreetmap.org/copyright",
  },
];

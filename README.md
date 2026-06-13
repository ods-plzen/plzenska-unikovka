# Plzeň přehledně — od ODS

Uzavírky, rozhodnutí zastupitelstva, stavby a komunitní informace pro všech 10
plzeňských obvodů na jednom místě. Data z veřejných zdrojů (radnice, MHD,
OpenStreetMap), aktualizovaná automaticky každý den.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind v4**
- **Leaflet / react-leaflet** + CARTO light dlaždice (bez API klíče)
- ODS design systém (Oswald, modrá `#153D8A` / světlá `#009FE3`)
- Statická data v `src/data/*.json`, plněná Python scraperem

## Vývoj

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # produkční build + typecheck
npm run lint
```

## Struktura

```
src/
  app/                  Routy: / · /doprava · /doprava/[id] · /zastupitelstvo · /stavby · /komunita
  components/           Header, Footer, karty, mapa, timeline, views
  components/map/       Leaflet (jen klient, dynamic import bez SSR)
  data/                 closures.json (scraper) · votes/community/extras.json · areas.ts · projects.ts
  lib/                  types.ts · data.ts (načítání a třídění)
scripts/scraper.py      plzen.eu/doprava + Overpass geometrie + přiřazení obvodu
.github/workflows/      denní cron, commit src/data/closures.json
```

## Data pipeline

`scripts/scraper.py` stáhne tabulku uzavírek z plzen.eu/doprava, ke každé ulici
dotáhne reálnou geometrii z OpenStreetMap (Overpass), ořízne ji na uvedený úsek,
přiřadí městský obvod (point-in-polygon) a zapíše `src/data/closures.json`.
Editorial overlay (fáze, „co to znamená") je v `src/data/extras.json` a scraper
se ho nedotýká.

```bash
python scripts/scraper.py   # přepíše src/data/closures.json
```

## Ruční editace obsahu

Data, která se nescrapují, se editují přímo v `src/data/`:

- **Komunita** — `src/data/community.json`: pole `lost` (ztráty/nálezy) a `events`
  (akce). Každá položka má `lat`/`lon` (pro mapu) a `updated` na úrovni souboru
  posuň při každé změně. Nový příspěvek = přidej objekt do pole, commit, deploy
  se spustí sám.
- **Objízdky a MHD u uzavírek** — `src/data/extras.json`, klíč = `id` uzavírky
  (např. `28-rijna`). Pole `objizdka`, `mhd`, `parkovani`, `phases`, `source`.
  Návrh textu vygeneruje `python3 scripts/enrich.py "<ulice>"` z článku města —
  vždy ručně zkrať a ověř před vložením.
- **Zastupitelstvo** — `src/data/votes.json` (hlasování) a `src/data/chapters.ts`
  (kapitoly záznamu jednání).
- **Stavby** — `src/data/projects.ts` (accountability timeline).

Pravidlo: u převzatého obsahu vždy vyplň `source`/`srcUrl` a krať na fakta.

## Nasazení

Vercel: import repozitáře → framework Next.js se detekuje sám. Žádné env
proměnné nejsou potřeba.

---

Provozuje Lukáš Hegner (ODS Plzeň). Agregovaný a strojově zpracovaný obsah je
takto označen — nejde o vlastní zpravodajství. Zdroje jsou uvedeny u každé
položky.

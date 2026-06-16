# Jednoduchá mapa — Plzeňská únikovka

**Datum:** 2026-06-16
**Status:** Design schválen (4/4 sekce y)
**Cíl:** Z mapy s 48 stejnými puntíky udělat vizuálně okamžitě čitelný nástroj, kde lidé hned vidí *co je zavřené* a *kudy*. Žádný route-planner.

---

## Kontext

Po migraci z plzen.eu (8 uzavírek) na SITmP/JSDI (48) má mapa moc obsahu a vypadá jako kopie jakékoliv generické dopravní mapy. Uživatel: „strašně moc, není to přehledné… kopie těch map, které jsou všude po netu". Plus: „mapa by měla být jasný znázornitel, kde se co uzavřelo, kde jsou objížďky".

Brief: **mapa zůstává hrdina**, řešíme *prezentaci dat*.

---

## 1. Layout

Mapa zabírá ~70 % viewportu hned pod headerem. Pod ní horizontální karty s 5 nejzávažnějšími uzavírkami.

```
┌──────────────────────────────────────────────┐
│ HEADER (Plzeňská únikovka · AreaSelect)      │
├──────────────────────────────────────────────┤
│ [ Teď · Tento týden · Tento měsíc ]          │  ← filter chips
├──────────────────────────────────────────────┤
│                                              │
│              MAPA (h: 70vh min 400px)        │
│                                              │
├──────────────────────────────────────────────┤
│  Co ti zblokuje cestu                        │
│  [Americká] [28. října] [Rokycanská] [I/27]  │  ← top-5 cards
└──────────────────────────────────────────────┘
```

Žádný hero copy, žádné stat dlaždice, žádné „Aktualizováno denně" chip. Header a hned mapa.

## 2. Hierarchie markerů (severity)

Tři úrovně, vizuálně okamžitě rozlišitelné:

| Úroveň | Vzhled | Když |
|---|---|---|
| **Major** | Velký coral puntík (Ø 28 px) s outline ring, popisek viditelný od zoomu 13+ | Úplná uzavírka **AND** silnice I/, II/, nebo městský klíčový tah |
| **Medium** | Střední puntík ODS modrá (Ø 16 px), popisek jen na hover | Částečná uzavírka, kyvadlová doprava, jednosměrný režim |
| **Minor** | Malá tečka šedá (Ø 8 px), bez popisku | Vše ostatní — zúžení, oprava povrchu na obytné ulici |

**Klasifikátor** (v `src/lib/severity.ts`):

```ts
function classify(c: Closure): 'major' | 'medium' | 'minor' {
  const t = c.akce.toLowerCase() + ' ' + (c.popis || '').toLowerCase();
  const major =
    /uzavřen[áa]?\s+silnice/.test(t) &&
    (/\b(I|II|III)\/\d+/.test(t) || HLAVNI_TAHY.has(c.name));
  if (major) return 'major';
  const medium = /(jednosměr|kyvadlov|protisměr|omezení)/.test(t);
  if (medium) return 'medium';
  return 'minor';
}
const HLAVNI_TAHY = new Set([
  'Americká', 'Klatovská', 'Rokycanská', 'Domažlická', 'Karlovarská',
  '28. října', 'Lochotínská', 'Masarykova', 'Folmavská', 'Borská',
]);
```

**Top 5** = `major` seřazené podle (a) je-li v aktuálním filtru (Teď / Týden / Měsíc), (b) délka uzavírky (datum Do − Od). Fallback `medium` doplní pokud `major` < 5.

## 3. Klik = side panel + objížďka na mapě

Kliknutí na marker nebo top-5 kartu otevře pravý postranní panel (ne modal). Mapa zůstává viditelná v levé části. Panel:

```
┌─────────────────────────┐
│ AMERICKÁ                │
│ Plzeň 3 · Úplná uzav.   │
│                         │
│ od 11. 5. 2026          │
│ do 21. 6. 2026          │
│ ─────                    │
│ CO SE TAM DĚJE          │
│ Oprava povrchu vozovky  │
│ Vydal: ÚMO Plzeň 03     │
│                         │
│ KUDY JIT / JET          │
│ Anglické nábř. →        │
│ Smetanovy sady          │
│ + linka 22, 32, N3      │
│                         │
│ Zdroj: JSDI / PMDP   ↗  │
└─────────────────────────┘
```

**Objížďka na mapě**: v moment otevření panelu se vykreslí coral polyline (datová vrstva `GIS_Doprava_Uzavirky/MapServer/2` = SUPERDIO polyline). Pokud chybí, fallback: extracted text z `popis` zobrazen jen v panelu (žádná čára).

**Implementace**: `jsdi.py` rozšířen o druhý query do layer 2, joinuje přes (a) prostorovou blízkost (b) shodu street name. Výsledek uložen jako `way` v `closures.json` (existující schema). Když existuje, kreslíme polyline; když ne, marker (point).

## 4. Filtry

Tři chip-tlačítka nahoře (single-select, default = **Teď**):

- **Teď** = `Od ≤ today AND Do ≥ today` (currently active)
- **Tento týden** = `Od ≤ today + 7 AND Do ≥ today`
- **Tento měsíc** = `Od ≤ today + 30 AND Do ≥ today`

Žádný „typ" select, žádný „severity" filter. Obvod filter zůstává v existujícím `AreaSelect` v headeru.

URL state: `?f=ted|tyden|mesic` aby šel filter sdílet odkazem.

## 5. Data sources

- **uzavírky + dates + popis**: `agp.plzen.eu/arcgis/rest/services/GIS_Doprava/GIS_Doprava_Uzavirky/MapServer/0/query` (= JSDI / SITmP) — už máme přes `scripts/jsdi.py`
- **polyline geometrie objížďky**: stejná služba, **layer 2** (= SUPERDIO) — přidat do `jsdi.py`
- **MHD odklony per closure**: PMDP přes `scripts/pmdp.py` — už máme

Atribuce: footer + per-closure panel již obsahuje „SITmP / JSDI ŘSD".

---

## Out of scope (pro tuhle iteraci)

- FCD intensity overlay (= barevný heatmap aktuální intenzity dopravy z `GIS_Doprava_FCD/MapServer`). Pěkné, ale komplikuje vizuál.
- Polygon uzavírky (layer 8) — málokterá uzavírka je plošná.
- Notifikace (Push API) — Fáze B.
- Personalizace „Tvoje místa" / „Tvoje commute" — odložené, brief řekl „ne interaktivní".
- Stránka Sliby — separátní projekt.

## Architektura na vysoké úrovni

Nové soubory:

- `src/lib/severity.ts` — klasifikátor major/medium/minor + HLAVNI_TAHY
- `src/lib/timeFilter.ts` — utility `byFilter(closures, 'now'|'week'|'month')`
- `src/components/TimeFilterChips.tsx` — UI nahoře
- `src/components/ClosurePanel.tsx` — pravý side panel
- `src/components/views/MapView.tsx` — nová root view (`/` ji použije místo DopravaView)

Modifikované:

- `src/app/page.tsx` — render `MapView`
- `src/components/map/ClosureMapInner.tsx` — severity-based markery, hover popisky od zoomu 13
- `src/components/map/ClosureMap.tsx` — props pro selection + onSelect callback
- `scripts/jsdi.py` — druhý query do layer 2, polyline geometrie do `closures.json[].ways`
- `src/lib/types.ts` — `severity?: 'major' | 'medium' | 'minor'` na `Closure` (pre-classify v jsdi.py + cache)

Smazané / archived:

- `src/components/views/DopravaView.tsx` — nahrazeno `MapView` (delete po migraci)
- Pouvažovat o vyhození `src/components/views/HomeView.tsx`, `StavbyView.tsx`, atd. — už jsou nepoužívané po předchozím ořezu.

## Otevřené otázky

1. Polyline join layer 2 ↔ layer 0 — jakou heuristikou (record_id? spatial buffer 50 m? název ulice?). Otestovat během implementace, fallback na point marker je vždy možný.
2. Top 5 cards — interactive scroll na mobilu (3 viditelné, swipe)? Nebo grid 2×2+1 v sm:?

---

## Self-review

- **Placeholder scan**: žádné TBD/TODO/„vyplníme později" v load-bearing sekcích. Klasifikátor má konkrétní regex, HLAVNI_TAHY má 10 ulic.
- **Internal consistency**: layout (sekce 1) uvádí filter chips nad mapou — sekce 4 to potvrzuje. Severity tier sloučen napříč sekcí 2 (vzhled) a sekcí 1 (top 5 výběr).
- **Scope check**: jedna iterace, ~5-7 souborů. Vejde se do jednoho implementačního plánu.
- **Ambiguity check**:
  - „Major" = úplná uzavírka **AND** hl. tah — explicitně definováno.
  - „Teď / Týden / Měsíc" — definice přes Od/Do data, ne fuzzy.
  - Otevřená otázka 1 (polyline join) je flagged, řešíme až v implementaci.

Žádné placeholdery, vnitřně konzistentní, scope jeden plán.

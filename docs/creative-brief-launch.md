# Creative brief — Plzeňská únikovka

> **Projekt:** plzenskaunikovka.cz
> **Klient:** ODS Plzeň-město
> **Provozovatel webu (zpracovatel):** Uhumdrum s.r.o.
> **Deadline:** social assety do 18. 6. 2026 (launch); core brand kit do
> 30. 6. 2026.
> **Cílová skupina:** plzeňští řidiči, residenti Doubravky / Slovan /
> centra, rodiče s dětmi co plánují trasu, lidé jezdící MHD.

---

## 1. O projektu — co to je

Civilní informační web. Sbírá data z **SITmP** (agp.plzen.eu), **JSDI
ŘSD**, **PMDP** (MHD odklony) a **plzen.eu/doprava**. Ukazuje na jedné
mapě **všechny uzavírky a stavby v Plzni** + plánované velké projekty
(Masaryčka, Americká, Domažlická, 28. října, Chlum, Náměstí Republiky).

Konkrétní use case: *„Jedu zítra do práce na Slovany, nevím, jestli pojedu
přes Americkou nebo radši přes Klatovku. Mrknu na únikovku."*

**Tone of voice:** informační, věcný, lehce „úřední vox-populi". Žádné
politické sliby, žádné agresivní fonty, žádné velké foty politiků na
hlavní stránce. To je **service**, ne kampaň.

---

## 2. Brand foundation — nepřekročitelné

### Barevná paleta (povinná)

| Role | Hex | RGB | Použití |
|---|---|---|---|
| ODS modrá tmavá | `#153D8A` | 21·61·138 | Headlines, headers, dominant brand |
| ODS modrá světlá | `#009FE3` | 0·159·227 | Action, hover, accent, link |
| Alert červená | `#C0392B` | 192·57·43 | **Pouze pro úplné uzavírky** (dopravní stop konvence) |
| Detour zelená | `#15803D` | 21·128·61 | **Pouze pro objízdné trasy** |
| Paper | `#F7F4EC` | 247·244·236 | Pozadí, mírně teplé bílé |
| Ink | `#0B1320` | 11·19·32 | Body text, hluboká černá |
| Muted | `#5B6273` | 91·98·115 | Metadata, podporné texty |

### Typografie

- **Headlines:** `Oswald Bold` (Google Fonts) — uppercase, tracking
  -2% pro velké H1, +25-35% letter-spacing pro malá kicker labels
- **Body:** systémový sans-serif (Inter / Roboto / SF) — body 16-18px
- **Czech typografie:** Czech curly quotes ("...") jsou OK; em-dash NE
  (používáme period nebo carriage return)

### Logo / wordmark

- Hlavní: `PLZEŇSKÁ ÚNIKOVKA` — Oswald Bold, velikost: H1 (96pt+)
- Alternativně **U-turn šipka** (návrat z dopravního chaosu) — ⟲
  symbol existuje v current `src/app/icon.svg` + OG image
- ODS logo umístění: **vždy explicitně atribuováno** „Provozuje ODS
  Plzeň-město" pod hlavním logem nebo v patičce

---

## 3. Logo brief — designér

### Co potřebujeme

**A. Logomark + wordmark (kombinace)**

- Vektor (SVG, AI source)
- 4 verze:
  1. **Full color** (ODS modrá na paper)
  2. **Reverse** (paper na ODS modré)
  3. **Mono dark** (ink na paper)
  4. **Mono light** (paper na ink/black)
- Velikosti: 16px favicon, 32px web header, 64px small print, 128px+
  hi-res, 1024px×1024px app icon
- **Logomark sám:** square format pro avatar/favicon, square 1024×1024px

**B. Pravidla použití**

- Minimální clear space: padding rovný výšce „P" v wordmarku
- Minimální výška logomarku: 24px (pod tím nečitelné)
- **Co nedělat:** rotace, stretching, color shift mimo paletu, gradients,
  drop shadow, neon, „cute" emoji, vlastní úpravy fontu

### Konceptuální směr (na výběr)

| Koncept | Co | Tone |
|---|---|---|
| **A. „U-turn"** | ⟲ šipka zatočená, dosud používaná v OG image | Servisní, „dostaň se ven" |
| **B. Mapová značka** | Pin + cesta v ODS modré | Geografický, lokační |
| **C. „PU" monogram** | Stylizovaná „P" a „Ú" jako interaktivní spojené písmena | Editorialní, klasický |
| **D. Stop značka přeškrtnutá** | Klasický stop sign s linkou přes | Dopravní semantika |

Doporučení: **A nebo C**. „U-turn" je už zaužívaný (OG image), „PU
monogram" by vypadal po novu polished.

### Hotové výstupy (deliverable)

- `logo-full.svg` + `.ai` (full color verze)
- `logo-reverse.svg`
- `logo-mono-dark.svg`
- `logo-mono-light.svg`
- `logomark.svg` (samotný symbol, square)
- `favicon.ico` (multi-res: 16, 32, 48px)
- `app-icon-1024.png` (rounded corner, App Store style)
- `logo-style-guide.pdf` (1-2 stránky: clear space, minimum size, dos
  and don'ts)

---

## 4. Photography brief — fotograf

### Story, kterou má foto vyprávět

> Plzeňan jede ráno do práce. Cestou narazí na rozkopané křižovatky,
> objízdné značky, autobus PMDP odkloněný přes jinou ulici. Někdy je v
> autě, někdy na kole, někdy s kočárkem na chodníku. Web mu dává odpověď
> v pravý čas.

### Shot list — povinné záběry

| # | Subject | Lokace | Co zachytit | Mood |
|---|---|---|---|---|
| 1 | Široký pohled na rozkopanou ulici | Masaryčka (Doubravka) | Stavba probíhá, šedivý beton, oranžové signalizace, lidé jdou přes provizorní lávku | Dokumentární, real |
| 2 | Detail dopravní značky „uzavírka" | Americká | Cedulka „Objížďka 200 m" na sloupu, ostré ostření | Symbol |
| 3 | Autobus PMDP na odklonění | Linka 29 nebo 30 | Bus jede objízdnou trasou, vidět číslo linky | Logistic |
| 4 | Pohled z auta na rozkopanou křižovatku | Bílá Hora | Sedící řidič, ruka na volantu, výhled na signalizační lampičky | First-person |
| 5 | Maminka s kočárkem překračující stavbu | Doubravka centrum | Provizorní přechod, oranžové páskování | Lidské |
| 6 | Cyklista hledající alternativní trasu | Klatovská třída | Žlutá značka „Cyklotrasa", v pozadí stavba | Mladší demografie |
| 7 | Detail signalizační kuželu | Cokoliv | Stavební kužel, deště, gradient | Texture asset |
| 8 | Pohled shora na Plzeň (drone) | Doubravka nebo centrum | Sieť cest, kde jsou uzavírky vidět | Hero shot |

### Bonus — portréty pro detail uzavírek (volitelné)

- Lukáš Hegner v Doubravce (u Masaryčky, neformální, ne portrét — civilní
  záběr během procházky)
- Občanské nálady — anonymní lidé čekající na MHD u zastávky („Bílá Hora",
  „Doubravka")
- Cíl: fotky, které sednou jako *content support*, ne *kampaňový mass shot*

### Mood + styl

- **Format:** 16:9 (web hero), 4:5 (IG portrait), 9:16 (IG story / Reels)
- **Color grading:** přirozený, mírně desaturovaný; modrá nálada (chladný
  daylight), nikoli teplý zlatý hour
- **People:** civilní, ne kostýmovaní; anonymizováno (žádné rozpoznatelné
  tváře pro launch — viz GDPR)
- **No-go:** stock-photo vibes („happy family with car"), umělé úsměvy,
  Photoshopovaný HDR, nadměrné bokeh

### Práva + delivery

- Plný copyright transfer na ODS Plzeň-město + sub-license pro Uhumdrum
- Formáty: RAW + plnotučné 8K JPG + web-ready 1920px JPG
- Naming convention: `plzen-doprava-{lokace}-{kategorie}-{poradi}.jpg`
- Cca **20-30 finálních záběrů**, z nich 8-12 hero záběrů

---

## 5. Graphics brief — designér

### Set A: Social media templates (launch + dlouhodobý běh)

#### A.1 IG Square (1080×1080)

**Master template:**
```
┌──────────────────────────────────┐
│ [ODS logo]    plzenskaunikovka.cz│  ← modrá strip
├──────────────────────────────────┤
│                                  │
│       [VARIANT CONTENT]          │
│                                  │
├──────────────────────────────────┤
│ PLZEŇSKÁ ÚNIKOVKA                │
│ [tagline]      Provozuje ODS PM  │
└──────────────────────────────────┘
```

**Varianty contentu** (= 5 template variant):

1. **Live counter** — „36 / 4" (probíhá / plánuje se), velký Oswald
2. **Foto + headline** — fotka hero záběru s tmavým overlay + 1 řádek text
3. **Big stat** — jedna obří hodnota („115 mil. Kč na Masaryčce")
4. **Question prompt** — „Víš, kudy pojedeš za 14 dní?" + URL
5. **Mapa snippet** — výřez Plzně se zvýrazněnou cestou + 1 řádek info

#### A.2 IG Story (1080×1920)

Vertikální format, 4 template variant:
1. **Foto hero + wordmark + swipe up CTA**
2. **Live counter** + URL + ODS atribuce
3. **Mapa zoom-in na 1 uzavírku** + info
4. **Quote / fakta** (např. „115 milionů. 1 rok. 4 linky.")

#### A.3 FB Post (1200×630 — landscape)

Auto-generováno z Next.js OG image (už existuje v `src/app/opengraph-image.tsx`).
Designér jen optionally redesign + handover statického PNG variantu pro
manuální use.

### Set B: Print + outdoor

#### B.1 A4 informační leták (210×297mm)

Pro distribuci na úřadech, info centrech, infocentru ODS Plzeň-město:
- Co je únikovka, proč existuje
- Jak ji použít (3 kroky se screenshoty)
- URL + QR code v rohu
- ODS atribuce
- Tisk: dvoustranný, papír matný 170g

#### B.2 Plakát A3 (297×420mm)

Pro vývěsky v sousedství (kavárny, samoobsluhy, čekárny):
- Hero foto + 1 hlavní message
- URL + QR code velký
- 1 sloupec textu (max 50 slov)

#### B.3 Polepy / nálepky (Ø 80mm)

Pro distribuci na akcích / ke kandidátské literatuře:
- Logomark + URL
- Variace barev (paper, modrá tmavá)

### Set C: Web grafika (doplnění)

#### C.1 Hero ilustrace pro landing page

Abstraktní mapa Plzně s liniemi a body — vektor, ne fotka. Slouží jako
hero illustration na homepage (pokud uživatel scrolluje výš než „36 / 4"
counter). Možný nahradit current nic-tam-není layoutem.

#### C.2 Icon set pro Scope (rekonstrukce)

Sjednotit aktuální emoji (💧🚿🛣️👞🚲🚦) na custom vektor icon set:
- 12 ikon: vodovod, kanalizace, vozovka, chodník, cyklostezka,
  signalizace, plynovod, elektrika, telekomunikace, zelená výsadba,
  parkování, MHD zastávky
- 24×24px + 48×48px exporty
- Style: outlined, 2px stroke, rounded corners, ODS modrá

### Brand kit deliverable

Jeden **`.zip`** balíček obsahující:
- `/logo/` — všechny verze loga (SVG + PNG + AI)
- `/colors/` — `.ase` swatch pro Adobe + `colors.json` pro web
- `/fonts/` — Oswald + náhrada Inter
- `/templates/` — Figma + Adobe XD source pro všechny social templates
- `/icons/` — Scope icon set
- `/photos/` — fotbank z fotografického balíčku
- `/print/` — A4 leták + A3 plakát + nálepky (PDF + EPS)
- `STYLE-GUIDE.pdf` — 8-stránkový brand book

---

## 6. Tone of voice (vizuální)

| Co | Ano | Ne |
|---|---|---|
| Headlines | Oswald, jednoduchý, jasný | Decorative, script, sans-italic |
| Layout | Editorial broadsheet, hodně bílého | Cluttered, decorated, „organic" |
| Foto | Dokumentární, civilní | Stock, oboznané pózy, HDR |
| Color | ODS modrá + paper + alert/detour kde nutno | Pastel, gradient, neon |
| CTA | Direct („Otevřít mapu"), žádný hype | Pojďte, klikněte hned, exkluzivní |
| Emoji | Decentně (3-5 max v jednom postu) | Spam, ksicht 😅, šipky-everywhere |

---

## 7. Specifické do-not-cross

- **Žádný kandidát na hlavní vizuální koncept loga**. Je to service, ne
  osobní kampaň.
- **Žádné citace politiků na promo materiálu pro launch** (až po launchi
  organicky).
- **Žádný „Volte ODS" overlay** přes mapu nebo logo. ODS je v patičce, ne
  v claim.
- **Český jazyk vše**, žádné anglické headliny („Stay informed!", „Get
  notified!" atp.).
- **Žádná falešná čísla**. Pokud designér potřebuje placeholder, použít
  `XX` nebo nech ho prázdný — neřešit fake-data ve final mockupech.

---

## 8. Timeline + delivery

| Datum | Co | Pro |
|---|---|---|
| **18. 6.** (launch) | IG square v1 + Story v1 z existujícího OG | Hegnerův + ODS post |
| **22. 6.** | Logo direction proposal (3 varianty) | Review s klientem |
| **25. 6.** | Logo finalní + style guide draft | Approval |
| **30. 6.** | Brand kit kompletní | Handover |
| **5. 7.** | Foto session výsledky | Editing |
| **10. 7.** | Foto delivery + print materiály | Distribuce |

---

## 9. Kontakty + sources

- **Site:** https://plzenskaunikovka.cz
- **Github repo:** github.com/fuckupic/plzen-prehledne
- **Brand owner:** ODS Plzeň-město (pravomoc: oblastní předsednictvo)
- **Project lead:** Uhumdrum s.r.o. — Tadeáš Kapic (`tady@uhumdrum.com`)
- **ODS brand mandate:** modrá tmavá #153D8A, modrá světlá #009FE3,
  Oswald, paper + ink

---

*Rozpočtové meze + paywalls, NDAs a kontraktační detaily nejsou součástí
tohoto creative briefu — řeší se zvlášť přes Uhumdrum + ODS.*

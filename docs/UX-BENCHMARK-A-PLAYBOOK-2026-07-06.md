# Plzeňská únikovka — UX benchmark & politický playbook
**Deep research 6. 7. 2026 · 14 tvrzení ověřeno adversariálně (3/3 hlasy) · každé se zdrojem**
*Vstup: audit živé appky (mobil, 6. 7.) + rešerše One.Network/Waze/dopravniinfo/Boston 311/US kampaně + právní rámec ČR 2026.*

---

## TL;DR

1. **Co stavět dál řekli sami uživatelé** (roadmap: 218 hlasů) a benchmark to potvrzuje: **„hlídat moji ulici" notifikace** je feature č. 1 (44 hlasů) a má přesný zahraniční vzor (One.Network per-closure alerts).
2. **Největší konkurenční mezera:** státní dopravniinfo.gov.cz je SPA bez deep-linků a mrtvým sitemap — **každá uzavírka u nás jako sdílitelná stránka s vlastní URL** = vyhráváme SEO i sdílení do FB skupin.
3. **Právně je to nové hřiště:** zákon 234/2025 Sb. (účinný 1. 1. 2026) poprvé reguluje komunální kampaně. Aplikace kandidáta se v době vyhlášené kampaně **pravděpodobně stane prostředkem kampaně** → footer zadavatel/zpracovatel, ocenění práce tržní cenou do účetnictví, transparentní účet. A **notifikační seznam se NIKDY nesmí použít pro kampaňová sdělení.**

---

## A · Co už děláme dobře (potvrzeno benchmarkem)

| Naše řešení | Zahraniční vzor |
|---|---|
| Horizont filtry TEĎ / TÝDEN / MĚSÍC / VŠE | One.Network (UK councils): Today / 2 weeks / 3 months / 12 months — stejný pattern [Buckinghamshire blog 9/2025] |
| Roadmap hlasování „CHCI TO TAKY" | Drž jako produktovou participaci — gamifikované politické appky (Dean 2004: 100k odehrání, Clinton 2016: odznaky) generovaly engagement, ne hlasy. Užitečnost > hra. [New America, TechCrunch] |
| Denní aktualizace + zdroje viditelně (SITMP/JSDI/plzen.eu) | Kredibilita = receipts. Nikdo z benchmarku to nedělá líp. |
| Počítadla + countdown „13 dní zbývá" | Vlastní silný prvek, nechat. |

## B · UX doporučení (prioritně, každé se vzorem)

### 1. 🔔 „Hlídat ulici / tuto uzavírku" — PWA push + e-mail
**Proč:** #1 v hlasování uživatelů (44). Vzor: One.Network — klik na uzavírku → odběr aktualizací per konkrétní akce; area-based alerty doloženy napříč UK councils.
**Jak:** PWA (manifest + service worker + web push; iOS ≥16.4 z plochy). E-mail fallback pro starší.
**⚠️ Právní mantinel:** viz sekce D — kanál striktně dopravní.

### 2. 🔗 Deep-link stránka pro každou uzavírku (+ OG image)
**Proč:** dopravniinfo.gov.cz deep-linky nemá (ověřeno curl: prázdný root div, sitemap 3 URL z r. 2021). My máme Next.js → SSR stránka `/uzavirka/americka-2026` s mapkou, termíny, zdrojem a OG obrázkem.
**Efekt:** (a) SEO — dotazy „uzavírka Americká Plzeň" vyhráváme; (b) **sdílecí jednotka do FB skupin** (Doubravka, Plzeňáci) — přesně tam, kde žije lokální konverzace (18 % vší konverzace Plzeňáků = lokality).

### 3. 🎨 Filtr podle dopadu na dopravu (zeleno-červená škála)
**Vzor:** One.Network „Traffic impact — likely (red) / unlikely (green) to cause delays". U nás: úplná uzavírka / částečná / chodník — barevně na mapě i v seznamu.

### 4. 🗺️ Legenda mapy + hledání adresy
Z auditu: červené vs modré tečky dnes nikdo nevysvětlí. Legenda + input „Kde bydlíš?" (geokódování → zoom na okolí + rovnou nabídka „hlídat tuhle oblast" = onboarding do notifikací).

### 5. 📡 Veřejný datový feed (WZDx/CIFS formát)
**Vzor:** standardizované closure feedy se do Waze/Google propisují za 1–4 min. Waze for Cities je jen pro správce komunikací (kandidát tam data nepushne) — ale **publikovat vlastní open feed** je laciné a je to argument: „data dáváme všem, i městu, zadarmo". Sedí na open-source narativ.

### 6. ❌ Co NEdělat: gamifikace
Žádné body, odznaky, žebříčky. Dokumentovaně to nefunguje volebně (Dean, Clinton) a shodilo by to utilitární kredibilitu.

## C · Politický playbook (jak z toho preference)

1. **Framing „oči a uši":** Boston Citizens Connect oficiálně framoval občany jako „the City's eyes and ears". Naše verze: **„Plzeňáci hlídají svoje ulice."** Uživatel není stěžovatel, je spolusprávce. Sedí na DOTÁHNEME TO.
2. **Utilita mluví sama, kandidát vypráví příběh okolo:** appka zůstává 100% užitková; politiku dělají videa O appce (Zarzyckého „únikovka" citát, STAN slíbená aplikace — máme v trackeru). Nikdy nemíchat do appky samotné.
3. **Content smyčka:** nová velká uzavírka → deep-link stránka → Hegner ji sdílí s 1 větou do FB skupiny obvodu → lidi řeší reálný problém, ne politiku → brand „ten, co to dotáhl".
4. **Milníkové posty:** 1 000 uživatelů ✅ (už proběhlo) → 5 000 → 10 000; hlasování roadmapy jako důkaz „posloucháme" — vždy s reálnými čísly (nulová fabrikace).
5. **Připravený protiargument (equity):** peer-reviewed výzkum (Boston/Kansas City 311) ukazuje, že civic appky používají víc bohatší čtvrti. Až to někdo vytáhne: „Proto data dáváme otevřeně všem a web funguje i na starém telefonu bez instalace — a kdo appku nemá, informace dostane z vývěsky obvodu, kterou z našich dat může tisknout kdokoli."

## D · Právní mantinely (NOVÉ — zákon 234/2025 Sb. + TTPA)

**Tohle je poprvé, co jsou komunální kampaně pod dohledem ÚDHPSH.** Co z toho plyne pro appku:

| Pravidlo | Co uděláme |
|---|---|
| Aplikace ODS-branded kandidáta v době vyhlášené kampaně **pravděpodobně = prostředek volební kampaně** (test: úplatnost — i práce „za kterou se úplata obvykle poskytuje" — + doba kampaně) | Počítat s tím. Od vyhlášení voleb **viditelná patička „Zadavatel: … / Zpracovatel: …"** |
| Bezplatná IT práce se do kampaně počítá **obvyklou tržní cenou** | Ocenit vývoj/provoz, vykázat jako nepeněžní plnění v kampaňovém účetnictví + transparentní účet oznámený ÚDHPSH |
| **TTPA se NEvztahuje** na vlastní web šířený organicky (bez placené propagace) | Organika = volnost. **Jakýkoli placený boost appky = politická reklama dle TTPA** (označení, transparency notice) — radši vůbec |
| **Notifikační opt-in „hlídat ulici" NELZE přeúčelovat na kampaň** (TTPA čl. 18: cílení jen s odděleným výslovným souhlasem pro politickou reklamu) | Push/e-mail kanál = POUZE dopravní obsah. Nikdy „přijďte volit", nikdy segmentace odběratelů pro kampaň. Bez výjimek. |

*Zdroje: pruvodce.udhpsh.cz (definice kampaně, označování, financování, vstup do kampaně) · zakonyprolidi.cz/cs/2025-234 · mv.gov.cz TTPA · EUR-Lex 2024/900 · udh.gov.cz informační materiál.*

**Doporučený krok navíc:** krátká konzultace s volebním zmocněncem ODS Plzeň, ať se ocenění appky a patička nastaví jednotně se zbytkem kampaně. (Hegner je advokát — tohle téma může dokonce komunikačně obrátit v plus: „naše appka je první v Plzni, která je transparentně vykázaná podle nových pravidel".)

## E · Pořadí realizace

1. **Teď:** deep-link stránky uzavírek + OG obrázky (2) · legenda + hledání adresy (4) — čistě produktové, žádné právní implikace
2. **Do 2 týdnů:** PWA + „hlídat ulici" (1) s čistě dopravním obsahem · impact filtr (3)
3. **Průběžně:** WZDx feed (5) + milníkové posty (C4)
4. **Od vyhlášení voleb:** patička zadavatel/zpracovatel + účetní vykázání (D)

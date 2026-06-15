# Ochrana soukromí — DRAFT

> **Před publikací doplň:** identitu správce (níže `{{SPRAVCE_*}}`), kontaktní e-mail
> (`{{KONTAKT_EMAIL}}`) a datum účinnosti. Až zapojíme analytics nebo newsletter, doplnit
> sekci „Co se mění od verze X.Y" (verzování zachovává auditní stopu).
>
> **Verze tohoto dokumentu:** 2026.06 · DRAFT (nezveřejněno)
> **Účinnost po publikaci:** {{DATUM_UCINNOSTI}}

---

## 1. Kdo zpracovává vaše data

Provozovatelem webu **plzenskaunikovka.cz** (dále „Web") a správcem osobních údajů
ve smyslu Nařízení Evropského parlamentu a Rady (EU) 2016/679 („GDPR") je:

> **UHUMDRUM {{PRAVNI_FORMA}}**
> {{UHUMDRUM_ADRESA}}
> IČ: {{UHUMDRUM_IC}}
> E-mail: tady@uhumdrum.com

Web je nezávislá informační služba pro občany Plzně, kterou UHUMDRUM provozuje
ve spolupráci s **oblastním sdružením ODS Plzeň-město**. ODS Plzeň-město
dodává redakční obsah (zápisy ze ZMP, citace zastupitelů, politické kontexty)
a je v tomto rozsahu samostatným správcem osobních údajů; UHUMDRUM zajišťuje
provoz Webu (hosting, scrapery, vývoj, údržba).

Web není oficiální stránka města Plzně ani Plzeňských městských dopravních podniků.

## 2. Co o vás na Webu zpracováváme

Web jsme postavili tak, aby od návštěvníka potřeboval co nejméně. K dnešnímu dni
zpracováváme tyto kategorie údajů:

### 2.1 Technické provozní logy

Vercel Inc., poskytovatel našeho hostingu, krátkodobě ukládá při každém načtení stránky:

- IP adresu,
- typ a verzi prohlížeče (User-Agent),
- referer (odkud jste přišli),
- čas a URL přístupu.

Tyto logy slouží k provozu (ochrana před útoky, ladění chyb). Vercel je ukládá
po dobu max. 30 dní, my k nim přistupujeme jen při řešení provozního incidentu.

**Právní základ:** oprávněný zájem podle čl. 6 odst. 1 písm. f) GDPR (provoz a
zabezpečení Webu).

### 2.2 Místní úložiště ve vašem prohlížeči (localStorage)

Pokud si na Webu nastavíte sledování uzavírky (tlačítko **„Sledovat"**), uložíme
do `localStorage` vašeho prohlížeče seznam ID uzavírek, které sledujete, a volbu
zobrazeného obvodu. Tato data **neopouštějí váš počítač** — neposíláme je nikam,
ani je nečteme my, ani třetí strana.

Stejně tak v `localStorage` neukládáme nic jiného: žádné cookies pro reklamu,
analytiku, fingerprinting ani tracking.

**Právní základ:** souhlas vyjádřený samotným kliknutím („Sledovat"). Smazat
data můžete kdykoliv vyčištěním úložiště prohlížeče nebo opětovným kliknutím
na **„Přestat sledovat"**.

### 2.3 Veřejně dostupné informace o veřejně činných osobách

Web zveřejňuje:

- záznamy o uzavírkách a stavbách převzaté z plzen.eu,
- záznamy o hlasování zastupitelů a citace z přepisů jednání ZMP,
- informace o MHD z PMDP (linky, odklony, dočasné zastávky),
- veřejně přístupné výroky komunálních politiků v rámci jejich politické činnosti.

Politici a zastupitelé jsou v rozsahu výkonu mandátu **veřejně činnými osobami**.
Zpracování jejich osobních údajů (jméno, hlasování, výroky) probíhá na základě:

- **oprávněného zájmu** podle čl. 6 odst. 1 písm. f) GDPR — politická soutěž
  a informování voličů o činnosti komunálních politiků,
- výjimky pro zpracování pro účely **akademického, uměleckého, novinářského
  nebo literárního projevu** podle čl. 85 GDPR ve spojení s § 17 zákona č. 110/2019 Sb.

Web zveřejňuje informace o všech komunálních politicích bez ohledu na jejich
stranickou příslušnost (koalice i opozice). Zveřejňované údaje jsou převzaty
z veřejných zdrojů (zápisy ze zasedání ZMP, oficiální profily, mediální výstupy).

Pokud se kdokoliv domnívá, že byl zveřejněn údaj, který se týká jeho soukromé
(nikoli veřejné) sféry, ozvěte se na `{{KONTAKT_EMAIL}}`; obsah ověříme a
v odůvodněných případech odstraníme.

## 3. Komu vaše data předáváme

| Zpracovatel | Co dělá | Místo | Smlouva |
|---|---|---|---|
| Vercel Inc. | hosting Webu | EU edge + USA (SCC) | DPA + Standardní smluvní doložky |
| GitHub Inc. | uchování zdrojového kódu | USA | DPA |

K dnešnímu dni neprovozujeme analytics, neposíláme newslettery a nesbíráme žádná
data přes formuláře. Až tyto funkce přibydou, zveřejníme aktualizovanou verzi
tohoto dokumentu a u nových funkcí si vyžádáme váš samostatný souhlas.

## 4. Jak dlouho data uchováváme

- **provozní logy Vercel:** max. 30 dní,
- **localStorage:** dokud si jej sami nesmažete,
- **veřejná data o uzavírkách, hlasování, MHD:** dlouhodobě (jde o veřejnou paměť
  města; konkrétní data necháváme archivně přístupná pro historickou kontrolu).

## 5. Vaše práva

Podle čl. 15 až 22 GDPR máte právo:

- **na přístup** k údajům, které o vás zpracováváme,
- **na opravu** nepřesných údajů,
- **na výmaz** („právo být zapomenut"), pokud pro další zpracování nemáme zákonný důvod,
- **na omezení zpracování**,
- **na přenositelnost údajů**,
- **vznést námitku** proti zpracování založenému na oprávněném zájmu nebo
  veřejném zájmu (čl. 21 GDPR),
- **podat stížnost** u Úřadu pro ochranu osobních údajů (www.uoou.cz).

Žádost zašlete na `{{KONTAKT_EMAIL}}`. Odpovíme nejpozději do 30 dní. Pokud
nemůžeme vyhovět (např. proto, že jde o výroky politika v jeho veřejné funkci,
kde převažuje veřejný zájem), zdůvodníme to.

## 6. Cookies a podobné technologie

Web nepoužívá cookies pro analytiku, reklamu ani tracking. Používáme pouze
**funkční localStorage** podle bodu 2.2, a to **jen tehdy**, když si sami
aktivujete sledování uzavírky.

Až Web rozšíříme o analytics nebo notifikace, zobrazíme **lištu pro správu
souhlasu** s jasným popisem každé kategorie a možností jednotlivě odmítnout.

## 7. Děti

Web obsahem necílí na osoby mladší 16 let. Pokud nám případně vědomě sdělíte
osobní údaje dítěte, údaj vymažeme.

## 8. Změny tohoto dokumentu

Tento dokument je verzovaný. Aktuální i předchozí verze jsou dohledatelné
v repozitáři Webu na GitHubu. Podstatné změny (nový zpracovatel, nová kategorie
údajů, změna účelů) zveřejníme s předstihem na úvodní stránce.

---

## Pro správce: co doplnit a synchronizovat, než se text publikuje

### Text

1. **Kontaktní e-mail.** Vyhrazený, např. `plzen-prehledne@ods.cz` nebo
   `gdpr@odsplzen.cz`. Ne osobní mail kohokoliv — auditní stopa, nástupnictví,
   čitelná odpovědnost ODS jako právnické osoby.
2. **Datum účinnosti.** Den publikace.

### Soulad s prostředky, které Web reálně používá

ODS musí být skutečným provozovatelem, ne jen formálně v textu. Před publikací
zkontrolovat:

3. **Vercel projekt** přesunout pod ODS organizaci (Vercel Team). Vlastnictví
   účtu = právní stopa, kdo je zpracovatel z pohledu Vercelu.
4. **GitHub repo** přesunout pod ODS organizaci. Audit komitů zůstává, vlastnictví
   se mění.
5. **Doménu** (pokud bude vlastní, ne `*.vercel.app`) registrovat na ODS, nebo
   převést na ODS.
6. **DPA s Vercelem** musí být uzavřena ODS jako právní osobou.
   Vercel Standard Contractual Clauses se aktivují automaticky při akceptaci ToS;
   zkontrolovat, že na účtu ODS jsou.
7. **Footer komponenta** (`src/components/Footer.tsx`) — momentálně uvádí
   „Lukáš Hegner, zastupitel za ODS Plzeň". Upravit na ODS jako provozovatele;
   Hegnera lze ponechat jako kontaktní osobu / zastupitele, ale ne jako
   „provozovatele".
8. **Vizuální značení** — zvážit drobné stranické označení v hlavičce nebo
   patičce („Projekt ODS Plzeň"), aby uživatel chápal kontext. Bez něj hrozí
   námitka, že Web vystupuje jako neutrální informační služba a přitom je
   stranický.

### Volební a politické riziko (pro úvahu, ne pro text PP)

Provozováním Webu pod ODS přesouváme náklady i obsah pod stranické účetnictví
ÚFAR a TTPA. To je v zásadě čistší než hybridní model „osobní projekt zastupitele",
ale znamená:

- náklady na Web (Vercel, doména, případně Apify, Plausible) jsou stranické výdaje
  a je nutné je vykázat v účetnictví ODS jako náklady na politickou propagaci;
- veškerý obsah Webu je „politická propagace" ve smyslu volební legislativy
  a v období 16 dní před volbami musí být označen;
- před komunálními volbami 2026 stojí za to mít k tomu samostatnou interní
  notu (kdo schvaluje obsah, kdo má přístup do repa, jak rychle se mažou
  věci v případě stížnosti).

### Před zapojením dalších funkcí

9. Až přibyde newsletter, formuláře, analytics nebo push notifikace, doplnit
   odpovídající sekce a posunout verzi (např. `2026.07`).

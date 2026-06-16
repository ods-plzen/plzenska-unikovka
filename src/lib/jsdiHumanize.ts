// Parser pro JSDI Nazev field. JSDI vrací jeden dlouhý odstavec úředního
// textu, který pro běžného člověka nečitelný. Parseme ho na fragmenty,
// které pak vrendrujeme jako vizuálně oddělené sekce.
//
// Příklad JSDI popisu:
//   "silnice III/18043 (ulice Dobřanská), Plzeň 3, Plzeň, stavební práce,
//    zúžená vozovka na jeden jízdní pruh, Od 21.07.2025 00:01 Do
//    20.12.2026 23:59, částečná uzavírka v úseku od kruhového objezdu
//    až za křižovatku s ulicí U Čertovy díry z důvodu akce „Dešťová
//    kanalizace a komunikace", Vydal: Magistrát města Plzně"

export interface JsdiHumanized {
  /** Big chip claims (úplná uzavírka, kyvadlová doprava, jeden pruh, …). */
  tags: string[];
  /** Úsek v lidštější podobě, nebo null. */
  section: string | null;
  /** Důvod / akce (typicky text v uvozovkách za „z důvodu akce"). */
  reason: string | null;
  /** Vydal / správní orgán. */
  issuer: string | null;
  /** Objížďka (popis), pokud JSDI obsahuje. */
  detour: string | null;
  /** Volný zbytek po odstranění výše uvedeného — typicky 1-2 věty. */
  remainder: string | null;
}

// `\b` v JS regexu je ASCII-only → nematchne "č/š/ž". Používáme zde
// non-boundary patterns spoléhající na unikátnost frází.
const TAG_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /úplná\s+uzavírka/i, label: "Úplná uzavírka" },
  { re: /částečná\s+uzavírka/i, label: "Částečná uzavírka" },
  { re: /kyvadlová\s+doprava/i, label: "Kyvadlová doprava" },
  { re: /jednosměrn[áé]?\s+(?:uzavírka|provoz)/i, label: "Jednosměrně" },
  { re: /provoz\s+(?:převeden|sveden)\s+do\s+protisměru/i, label: "Protisměr" },
  { re: /zúžená\s+vozovka(?:\s+na\s+jeden\s+jízdní\s+pruh)?/i, label: "Jeden jízdní pruh" },
  { re: /zúžené\s+pruhy/i, label: "Zúžené pruhy" },
  { re: /pravý\s+jízdní\s+pruh\s+uzavřen/i, label: "Pravý pruh zavřen" },
  { re: /levý\s+jízdní\s+pruh\s+uzavřen/i, label: "Levý pruh zavřen" },
  { re: /překážka\s+na\s+vozovce/i, label: "Překážka" },
  { re: /sjezd\s+a\s+nájezd\s+uzavřen/i, label: "Sjezd zavřen" },
  { re: /stavební\s+práce/i, label: "Stavba" },
  { re: /oprava\s+povrchu/i, label: "Oprava povrchu" },
];

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function extractTags(text: string): string[] {
  const found: string[] = [];
  for (const { re, label } of TAG_PATTERNS) {
    if (re.test(text)) found.push(label);
  }
  return uniq(found);
}

function extractSection(text: string): string | null {
  // "v úseku od X až za křižovatku s Y"
  // "v úseku X, Y"
  const m = text.match(
    /v\s+úseku\s+([^,]+?(?:\s+(?:až|po|do|s)\s+[^,]+?)?)(?=\s+z\s+důvodu|\s+pro\s+|\s+,|\s+Vydal|$)/i,
  );
  if (!m) return null;
  let section = m[1].trim();
  // Trošku lidštěji: "od kruhového objezdu až za křižovatku s ulicí U Čertovy díry"
  // → "Od kruhového objezdu po křížení s U Čertovy díry"
  section = section
    .replace(/^od\s+/i, "Od ")
    .replace(/\baž\s+za\s+křižovatk[uy]\s+s\s+(?:ulicí?\s+)?/i, "po křížení s ")
    .replace(/\baž\s+ke?\s+křižovatce\s+s\s+(?:ulicí?\s+)?/i, "po křížení s ")
    .replace(/\baž\s+po\s+/i, "po ")
    .replace(/\baž\s+/i, "po ");
  return section.charAt(0).toUpperCase() + section.slice(1);
}

function extractReason(text: string): string | null {
  // "z důvodu akce „X""
  // "v rámci akce „X""
  const m = text.match(/(?:z\s+důvodu(?:\s+akce)?|v\s+rámci\s+akce|akce)\s+[„"']([^„""']+)[""']/);
  if (m) return m[1].trim();
  // "z důvodu prací na X"
  const m2 = text.match(/z\s+důvodu\s+([^,]+?)(?=\s+(?:,|Vydal|Objížď|$))/i);
  if (m2) return m2[1].trim();
  return null;
}

function extractIssuer(text: string): string | null {
  // "Vydal: X" — vezme jen jméno orgánu (do tečky / čárky / konce)
  const m = text.match(/Vydal:\s*([^.,]+?)(?:\s*[.,]|$)/);
  if (!m) return null;
  let issuer = m[1].trim();
  // Truncated example "Vydal: Krajský úřa" → ponech jak je
  // Zkratky: "Magistrát města Plzně" → ponech celé
  // ÚMO Plzeň 03 → ÚMO 3
  issuer = issuer.replace(/\bÚMO\s+Plzeň\s+0?(\d+)\b/, "ÚMO $1");
  return issuer;
}

function extractDetour(text: string): string | null {
  // "Objížďka - bez rozlišení: X" — zastav před "Vydal:" nebo "."
  const m = text.match(/Objížďka(?:\s+-\s+bez\s+rozlišení)?:\s*(.+?)(?=,?\s*Vydal:|\.\s|$)/i);
  if (!m) return null;
  let detour = m[1].trim();
  // Zkratit "silnice X (ulice Y), Plzeň N, Plzeň, ulice Z" → "ulicí Y, Z"
  detour = detour
    .replace(/silnice\s+[IVX\d/]+\s*\(ulice\s+([^)]+)\)/gi, "$1")
    .replace(/,\s*Plzeň\s+\d+,?\s*Plzeň,?/gi, ",")
    .replace(/,\s*Vydal:.*/i, "")
    .replace(/,\s*,/g, ",")
    .replace(/^,\s*|\s*,$/g, "")
    .trim();
  return detour || null;
}

export function humanizeJsdi(popis: string): JsdiHumanized {
  const tags = extractTags(popis);
  const section = extractSection(popis);
  const reason = extractReason(popis);
  const issuer = extractIssuer(popis);
  const detour = extractDetour(popis);

  // Zbytek = text bez datumů, čárek u obvodu, "silnice X (ulice Y)", apod.
  let rest = popis;
  rest = rest.replace(/Od\s+\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}/g, "");
  rest = rest.replace(/Do\s+\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}/g, "");
  rest = rest.replace(/silnice\s+[IVX\d/]+\s*\(ulice\s+[^)]+\),?/gi, "");
  rest = rest.replace(/silnice\s+[IVX\d/]+,?/gi, "");
  rest = rest.replace(/ulice\s+[^,]+,?/gi, "");
  rest = rest.replace(/,?\s*Plzeň\s+\d+,?\s*Plzeň,?/gi, "");
  rest = rest.replace(/,?\s*v\s+katastru\s+obce\s+[^,]+,?/gi, "");
  // Strip out the things we already extracted
  if (section)
    rest = rest.replace(/v\s+úseku\s+[^,]+(?:,\s*[^,]+)*?(?=\s+z\s+důvodu|\s+,|\s+Vydal|$)/i, "");
  if (reason)
    rest = rest.replace(/(?:z\s+důvodu(?:\s+akce)?|v\s+rámci\s+akce)\s+[„"'][^„""']+[""']/g, "");
  if (issuer) rest = rest.replace(/Vydal:\s*[^.,]+(?:\.|,|$)/g, "");
  if (detour) rest = rest.replace(/Objížďka(?:\s+-\s+bez\s+rozlišení)?:\s*[^,]+(?:,\s*[^,]+)*?(?=\s+Vydal|$)/i, "");
  // Strip tag phrases — they're now chips
  for (const { re } of TAG_PATTERNS) {
    rest = rest.replace(re, "");
  }
  // Cleanup
  rest = rest
    .replace(/\buzavřeno\b/gi, "")
    .replace(/vozovky/gi, "")
    .replace(/\s+/g, " ")
    .replace(/,\s*,/g, ",")
    .replace(/^[,\s.–-]+|[,\s.–-]+$/g, "")
    .trim();

  return {
    tags,
    section,
    reason,
    issuer,
    detour,
    remainder: rest.length > 15 ? rest : null,
  };
}

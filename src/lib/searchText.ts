// Vyhledávání ulic tolerantní k tomu, jak lidi reálně píšou:
// bez diakritiky ("belohorska"), v jiném pádu ("Belohorskou"), z mobilu.
// Případ z 17. 8.: uzavírka Bělohorské v datech byla, ale dotaz
// "Belohorskou" ji přes prosté includes() nenašel.

export function foldText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Skloňování řešíme postupným ukusováním konce dotazu (max 3 znaky,
// kmen nikdy nezkracujeme pod 4 znaky): "belohorskou" → "belohorsk",
// což už sedí na "belohorska".
export function matchesQuery(haystack: string, query: string): boolean {
  const h = foldText(haystack);
  const q = foldText(query.trim());
  if (q.length < 2) return false;
  const minStem = Math.min(4, q.length);
  for (let len = q.length; len >= minStem; len--) {
    if (h.includes(q.slice(0, len))) return true;
    if (q.length - len >= 3) break;
  }
  return false;
}

# Jednoduchá mapa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Z generické 48-puntíkové mapy udělat čitelný nástroj s vizuální hierarchií (severity), pravým side panelem s detailem + objížďkou, a 3-úrovňovým časovým filtrem.

**Architecture:** Severity klasifikace probíhá při scrape (`jsdi.py` zapíše field do `closures.json`), filtr a selection state žijí v URL search params, side panel = pravý sloupec (ne modal). Mapa zůstává Leaflet, markery se mění podle `severity` field. Polyline objížďka (layer 2 SUPERDIO) = follow-up plán (Phase 2).

**Tech Stack:** Next.js 16, React 19, TypeScript, Leaflet (`react-leaflet`), Tailwind CSS, Python 3 stdlib pro scraper.

**Scope:** Phase 1 — markery + filtr + side panel s point geometry. Phase 2 (polyline objížďka z layer 2) = samostatný plán až ověříme heuristiku joinu.

---

### Task 1: Severity klasifikátor

**Files:**
- Create: `src/lib/severity.ts`

- [ ] **Step 1: Implementace klasifikátoru**

```ts
import type { Closure } from "@/lib/types";

export type Severity = "major" | "medium" | "minor";

// Hlavní průtahy městem — definuj per ulici, ne automaticky.
// Tyto ulice jsou major i bez explicitního "uzavřená silnice" v textu.
const HLAVNI_TAHY = new Set([
  "Americká", "Klatovská", "Klatovská třída", "Rokycanská", "Domažlická",
  "Karlovarská", "28. října", "Lochotínská", "Masarykova", "Folmavská",
  "Borská", "Tylova", "Jateční", "Mikulášská", "Na Roudné",
]);

export function classifySeverity(c: Closure): Severity {
  const text = `${c.akce} ${c.popis ?? ""}`.toLowerCase();
  const isStateRoute = /\b(i|ii|iii)\s*\/\s*\d+/i.test(text);
  const fullClosure = /uzavřen[áa]?\s+silnice|úplná\s+uzavírka/.test(text);
  if (fullClosure && (isStateRoute || HLAVNI_TAHY.has(c.name))) return "major";
  if (/jednosměr|kyvadlov|protisměr|omezení|sveden/.test(text)) return "medium";
  return "minor";
}

export const SEVERITY_RANK: Record<Severity, number> = { major: 0, medium: 1, minor: 2 };
```

- [ ] **Step 2: Smoke test v Node REPL**

Run: `npx tsx --eval "import('./src/lib/severity.js').then(m => console.log(m.classifySeverity({name:'Americká',akce:'oprava povrchu vozovky',popis:''} as any)))"`

(Pokud `tsx` není nainstalován, tento krok přeskoč — Task 2 a 3 použijí klasifikátor naživo.)

---

### Task 2: Rozšířit Closure type o severity + ISO dates

**Files:**
- Modify: `src/lib/types.ts:5-26`

- [ ] **Step 1: Přidat 3 nová optional pole**

V interface `Closure` přidat za `superdioId?: number | null;`:

```ts
  // Phase 1 mapy: pre-computed při scrape
  severity?: import("./severity").Severity;
  od?: string; // ISO date (YYYY-MM-DD) — kdy uzavírka začíná
  do?: string; // ISO date — kdy uzavírka končí
```

- [ ] **Step 2: TS check**

Run: `npx tsc --noEmit`
Expected: exit 0 (žádné nové errory)

---

### Task 3: Upgrade `jsdi.py` — emit `od`/`do` ISO + `severity`

**Files:**
- Modify: `scripts/jsdi.py`

- [ ] **Step 1: Přidat ISO date formátor**

Pod `def ts_to_cz(ms)`:

```python
def ts_to_iso(ms: int | None) -> str | None:
    if ms is None:
        return None
    try:
        return dt.datetime.fromtimestamp(ms / 1000, tz=dt.timezone.utc).date().isoformat()
    except (OSError, ValueError):
        return None
```

- [ ] **Step 2: Přidat severity klasifikátor**

Pod `ts_to_iso`:

```python
HLAVNI_TAHY = {
    "Americká", "Klatovská", "Klatovská třída", "Rokycanská", "Domažlická",
    "Karlovarská", "28. října", "Lochotínská", "Masarykova", "Folmavská",
    "Borská", "Tylova", "Jateční", "Mikulášská", "Na Roudné",
}

def classify_severity(name: str, akce: str, popis: str) -> str:
    text = (akce + " " + popis).lower()
    is_state = bool(re.search(r"\b(i|ii|iii)\s*/\s*\d+", text, re.I))
    full_closure = bool(re.search(r"uzavřen[áa]?\s+silnice|úplná\s+uzavírka", text))
    if full_closure and (is_state or name in HLAVNI_TAHY):
        return "major"
    if re.search(r"jednosměr|kyvadlov|protisměr|omezení|sveden", text):
        return "medium"
    return "minor"
```

- [ ] **Step 3: Zapojit do main loopu**

V `main()` v dictu `rec` přidat tři pole hned za `"subtyp": ...,`:

```python
            "od": ts_to_iso(a.get("Od")),
            "do": ts_to_iso(a.get("Do")),
            "severity": classify_severity(street, akce, nazev),
```

- [ ] **Step 4: Spustit scraper a ověřit output**

Run: `python3 scripts/jsdi.py`
Expected: `→ 48 uzavírek v Plzni`

Run: `python3 -c "import json; cl=json.load(open('src/data/closures.json')); print('severities:', {c['severity'] for c in cl}); print('major count:', sum(1 for c in cl if c['severity']=='major')); print('sample:', {k:v for k,v in cl[0].items() if k in ('name','severity','od','do')})"`
Expected: `severities: {'major', 'medium', 'minor'}`; `major count` non-zero (kolem 3-5); sample má `od` a `do` ISO.

---

### Task 4: Time filter utility

**Files:**
- Create: `src/lib/timeFilter.ts`

- [ ] **Step 1: Implementace**

```ts
import type { Closure } from "@/lib/types";

export type TimeFilter = "now" | "week" | "month";

const HORIZON: Record<TimeFilter, number> = { now: 0, week: 7, month: 30 };

export const TIME_FILTERS: { id: TimeFilter; label: string }[] = [
  { id: "now", label: "Teď" },
  { id: "week", label: "Tento týden" },
  { id: "month", label: "Tento měsíc" },
];

export function isInFilter(c: Closure, filter: TimeFilter, today: Date = new Date()): boolean {
  if (!c.od) return filter === "now"; // bez dat → fallback do "now"
  const start = new Date(c.od);
  const end = c.do ? new Date(c.do) : null;
  const todayD = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const cutoff = new Date(todayD);
  cutoff.setDate(cutoff.getDate() + HORIZON[filter]);
  // closure začne do horizontu AND nekončí v minulosti
  const startsByCutoff = start <= cutoff;
  const stillActive = !end || end >= todayD;
  return startsByCutoff && stillActive;
}

export function parseFilter(v: string | null | undefined): TimeFilter {
  return v === "week" || v === "month" ? v : "now";
}
```

- [ ] **Step 2: TS check**

Run: `npx tsc --noEmit`
Expected: exit 0.

---

### Task 5: TimeFilterChips komponenta

**Files:**
- Create: `src/components/TimeFilterChips.tsx`

- [ ] **Step 1: Implementace**

```tsx
"use client";

import { TIME_FILTERS, type TimeFilter } from "@/lib/timeFilter";

export function TimeFilterChips({
  value,
  onChange,
}: {
  value: TimeFilter;
  onChange: (v: TimeFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TIME_FILTERS.map((f) => {
        const active = f.id === value;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            aria-pressed={active}
            className={
              "rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-wide transition-colors " +
              (active
                ? "bg-blue text-white"
                : "border border-line bg-card text-blue hover:border-blue")
            }
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
```

---

### Task 6: ClosurePanel side panel

**Files:**
- Create: `src/components/ClosurePanel.tsx`

- [ ] **Step 1: Implementace**

```tsx
"use client";

import Link from "next/link";
import type { Closure } from "@/lib/types";
import { mhdInfoFor } from "@/lib/data";

export function ClosurePanel({
  c,
  onClose,
}: {
  c: Closure;
  onClose: () => void;
}) {
  const mhd = mhdInfoFor(c.id);
  return (
    <aside className="flex h-full flex-col gap-4 overflow-y-auto rounded-xl border border-line bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            {c.oblast}
            {c.severity === "major" && " · úplná uzavírka"}
            {c.severity === "medium" && " · omezení"}
          </div>
          <h2 className="head mt-1 text-2xl font-bold text-ink">{c.name}</h2>
          {c.termin && <p className="mt-1 text-sm text-muted">{c.termin}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít detail"
          className="rounded-full p-1 text-muted hover:bg-line hover:text-ink"
        >
          ✕
        </button>
      </div>

      <section>
        <h3 className="head mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
          Co se tam děje
        </h3>
        <p className="text-sm leading-relaxed text-ink whitespace-pre-line">
          {c.popis || c.akce}
        </p>
      </section>

      {mhd && (mhd.reroutes?.length || mhd.tempStops?.length) ? (
        <section>
          <h3 className="head mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Kudy jet / jít
          </h3>
          <ul className="space-y-1 text-sm text-ink">
            {mhd.reroutes?.map((r, i) => (
              <li key={i}>
                {r.lines?.length ? (
                  <span className="font-semibold">{r.lines.join(", ")} </span>
                ) : null}
                {r.via}
              </li>
            ))}
            {mhd.tempStops?.map((s, i) => (
              <li key={i} className="text-muted">
                Zastávka {s.name} → {s.where}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-3">
        <Link
          href={`/doprava/${c.id}`}
          className="rounded-md bg-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-blue/90"
        >
          Otevřít detail →
        </Link>
        <a
          href="https://agp.plzen.eu/app/uzavirky/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-blue hover:border-blue"
        >
          Mapa SITmP ↗
        </a>
      </div>
      <p className="text-[11px] text-muted">
        Zdroj: {c.zdroj || "JSDI"} přes SITmP (agp.plzen.eu)
      </p>
    </aside>
  );
}
```

---

### Task 7: Severity-based markery v `ClosureMapInner`

**Files:**
- Modify: `src/components/map/ClosureMapInner.tsx`

- [ ] **Step 1: Přečíst soubor**

Run: `cat src/components/map/ClosureMapInner.tsx | head -120`

(Tato úloha vyžaduje úpravu existující komponenty. Implementer musí proběhnout dle stávající struktury — replace existing single-style marker s severity-aware variantou.)

- [ ] **Step 2: Implementace markeru per-severity**

V `ClosureMapInner` přidat helper:

```ts
const STYLE = {
  major: { radius: 14, color: "#fff", fillColor: "var(--ods-red)", weight: 3, fillOpacity: 1 },
  medium: { radius: 8, color: "#fff", fillColor: "var(--ods-blue)", weight: 2, fillOpacity: 0.95 },
  minor: { radius: 4, color: "#fff", fillColor: "#6b7280", weight: 1, fillOpacity: 0.75 },
} as const;
```

Místo stávajícího `Marker` použít `CircleMarker` z `react-leaflet` s `pathOptions={STYLE[c.severity ?? "minor"]}`. Major markery dostanou label přes `Tooltip` s `permanent={true} direction="top"` od zoomu 13+ (kontrola přes `useMapEvents`).

- [ ] **Step 3: Selection prop**

Komponenta dostane `selectedId?: string` a `onSelect?: (id: string) => void`. Vybraný marker dostane glow / outline. Klik na marker → `onSelect(c.id)`.

- [ ] **Step 4: TS + dev test**

Run: `npx tsc --noEmit`
Run: `npm run dev` a otevřít `http://localhost:3000` (nebo 3002 podle obsazení portu).
Expected: na mapě jsou tečky 3 různých velikostí podle severity.

---

### Task 8: Aktualizace `ClosureMap` wrapperu

**Files:**
- Modify: `src/components/map/ClosureMap.tsx`

- [ ] **Step 1: Propagovat nové prop**

`ClosureMap` musí přijmout `selectedId` a `onSelect` props a předat do `ClosureMapInner`. Stávající API zůstává backward-compat (props volitelné).

- [ ] **Step 2: TS check**

Run: `npx tsc --noEmit`
Expected: exit 0.

---

### Task 9: MapView root view

**Files:**
- Create: `src/components/views/MapView.tsx`

- [ ] **Step 1: Implementace**

```tsx
"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { closures, closureById } from "@/lib/data";
import { inArea } from "@/data/areas";
import { useArea } from "@/components/AreaProvider";
import { ClosureMap } from "@/components/map/ClosureMap";
import { ClosurePanel } from "@/components/ClosurePanel";
import { ClosureCard } from "@/components/ClosureCard";
import { TimeFilterChips } from "@/components/TimeFilterChips";
import { isInFilter, parseFilter, type TimeFilter } from "@/lib/timeFilter";
import { SEVERITY_RANK } from "@/lib/severity";

export function MapView() {
  const { area } = useArea();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filter: TimeFilter = parseFilter(params.get("f"));
  const selectedId = params.get("sel") ?? null;
  const selected = selectedId ? closureById(selectedId) : null;

  function pushParams(next: { f?: TimeFilter; sel?: string | null }) {
    const sp = new URLSearchParams(params.toString());
    if (next.f) {
      if (next.f === "now") sp.delete("f");
      else sp.set("f", next.f);
    }
    if (next.sel !== undefined) {
      if (next.sel) sp.set("sel", next.sel);
      else sp.delete("sel");
    }
    const q = sp.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  const visible = useMemo(() => {
    return closures.filter(
      (c) => inArea(c.oblast, area) && isInFilter(c, filter)
    );
  }, [area, filter]);

  const top5 = useMemo(() => {
    return [...visible]
      .sort((a, b) => (SEVERITY_RANK[a.severity ?? "minor"] - SEVERITY_RANK[b.severity ?? "minor"]))
      .slice(0, 5);
  }, [visible]);

  return (
    <div className="space-y-4">
      <TimeFilterChips value={filter} onChange={(f) => pushParams({ f })} />

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="rounded-xl overflow-hidden border border-line">
          <ClosureMap
            closures={visible}
            height={520}
            selectedId={selectedId}
            onSelect={(id) => pushParams({ sel: id })}
          />
        </div>
        {selected ? (
          <ClosurePanel c={selected} onClose={() => pushParams({ sel: null })} />
        ) : (
          <aside className="rounded-xl border border-line bg-card p-5 text-sm text-muted">
            Klikni na marker nebo na kartu uzavírky níž — detail se objeví tady.
          </aside>
        )}
      </div>

      <section>
        <h2 className="head mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Co ti zblokuje cestu
        </h2>
        {top5.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line bg-white p-6 text-center text-muted">
            V tomto filtru momentálně nic. 🎉
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {top5.map((c) => (
              <ClosureCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: TS check**

Run: `npx tsc --noEmit`
Expected: exit 0.

---

### Task 10: Zapojit MapView do homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace import**

```tsx
import { MapView } from "@/components/views/MapView";

export default function Page() {
  return <MapView />;
}
```

- [ ] **Step 2: Smoke test**

Run: `npm run dev`
Otevřít `http://localhost:3002` (nebo aktuální dev port).
Expected:
- 3 chip-tlačítka (Teď / Tento týden / Tento měsíc) nahoře.
- Mapa s ~10 markery v různých velikostech (Teď filter).
- Klik na marker → side panel zobrazuje detail.
- Klik na chip „Tento měsíc" → víc markerů na mapě, URL `?f=month`.
- Pod mapou max 5 karet „Co ti zblokuje cestu".

---

### Task 11: Cleanup obsoletních views

**Files:**
- Delete: `src/components/views/DopravaView.tsx`
- Delete: `src/components/views/HomeView.tsx`
- Delete: `src/components/views/ZastupitelstvoView.tsx`
- Delete: `src/components/views/StavbyView.tsx`
- Delete: `src/components/views/KomunitaView.tsx`
- Delete: `src/components/UpdatesFeed.tsx` (importuje HomeView)
- Delete: `src/components/DataSources.tsx` (importuje HomeView)
- Delete: `src/data/projects.ts` (jen StavbyView)
- Delete: `src/data/votes.json` (jen ZastupitelstvoView)
- Delete: `src/data/community.json` (jen KomunitaView)
- Delete: `src/data/klub.ts` (jen OdsKlub)

- [ ] **Step 1: Zkontrolovat reference**

Run: `grep -rn "DopravaView\|HomeView\|ZastupitelstvoView\|StavbyView\|KomunitaView\|UpdatesFeed\|DataSources" src/ --include="*.tsx" --include="*.ts" | grep -v "views/.*View.tsx:" | grep -v "DataSources.tsx:\|UpdatesFeed.tsx:"`
Expected: žádný hit mimo `src/app/{doprava,zastupitelstvo,stavby,komunita}/page.tsx` (= ty redirektované routes).

- [ ] **Step 2: Smazat route page.tsx pro redirektované routes**

Trim `next.config.ts` redirects (zůstávají) + smaž:
- `src/app/doprava/page.tsx` (nadále jen redirect, page.tsx není potřeba)
- `src/app/zastupitelstvo/page.tsx`
- `src/app/stavby/page.tsx`
- `src/app/komunita/page.tsx`

POZOR: `/doprava/[id]/page.tsx` zůstává — closure detail pages.

- [ ] **Step 3: Smazat unused komponenty**

Run:
```bash
rm src/components/views/DopravaView.tsx \
   src/components/views/HomeView.tsx \
   src/components/views/ZastupitelstvoView.tsx \
   src/components/views/StavbyView.tsx \
   src/components/views/KomunitaView.tsx \
   src/components/UpdatesFeed.tsx \
   src/components/DataSources.tsx \
   src/components/OdsKlub.tsx \
   src/components/VoteCard.tsx \
   src/components/SessionChapters.tsx \
   src/components/CommunityReport.tsx \
   src/data/projects.ts \
   src/data/votes.json \
   src/data/community.json \
   src/data/klub.ts \
   src/data/contact.ts \
   src/data/chapters.ts \
   src/data/updates.ts \
   src/app/doprava/page.tsx \
   src/app/zastupitelstvo/page.tsx \
   src/app/stavby/page.tsx \
   src/app/komunita/page.tsx
```

- [ ] **Step 4: TS check + dev smoke**

Run: `npx tsc --noEmit`
Expected: exit 0 (žádný unused import error).

Run: `npm run dev` + curl `/`, `/doprava/americka`, `/ochrana-soukromi`, `/sitemap.xml`.
Expected: vše 200.

---

### Task 12: Commit + push

- [ ] **Step 1: Stage**

```bash
git add scripts/jsdi.py \
        src/lib/severity.ts src/lib/timeFilter.ts src/lib/types.ts \
        src/components/TimeFilterChips.tsx src/components/ClosurePanel.tsx \
        src/components/views/MapView.tsx \
        src/components/map/ClosureMap.tsx src/components/map/ClosureMapInner.tsx \
        src/app/page.tsx \
        src/data/closures.json \
        docs/superpowers/specs/2026-06-16-jednoducha-mapa.md \
        docs/superpowers/plans/2026-06-16-jednoducha-mapa.md
git rm src/components/views/DopravaView.tsx \
       src/components/views/HomeView.tsx \
       src/components/views/ZastupitelstvoView.tsx \
       src/components/views/StavbyView.tsx \
       src/components/views/KomunitaView.tsx \
       src/components/UpdatesFeed.tsx \
       src/components/DataSources.tsx \
       src/components/OdsKlub.tsx \
       src/components/VoteCard.tsx \
       src/components/SessionChapters.tsx \
       src/components/CommunityReport.tsx \
       src/data/projects.ts \
       src/data/votes.json \
       src/data/community.json \
       src/data/klub.ts \
       src/data/contact.ts \
       src/data/chapters.ts \
       src/data/updates.ts \
       src/app/doprava/page.tsx \
       src/app/zastupitelstvo/page.tsx \
       src/app/stavby/page.tsx \
       src/app/komunita/page.tsx
git status --short | head -40
```

- [ ] **Step 2: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat: jednoduchá mapa — severity hierarchie + side panel + časový filtr

- 3 úrovně markerů (major / medium / minor) podle JSDI textu + HLAVNÍ_TAHY
- klik na marker / kartu → pravý side panel + URL ?sel=
- chip filtr Teď / Tento týden / Tento měsíc, URL ?f=
- Top 5 karet "Co ti zblokuje cestu" pod mapou
- jsdi.py emituje severity, od, do ISO data
- cleanup: smazány nepoužívané views (Doprava/Home/ZMP/Stavby/Komunita)
  a jejich data files; mapa = jediný obsah homepage

Spec: docs/superpowers/specs/2026-06-16-jednoducha-mapa.md
EOF
)"
```

- [ ] **Step 3: Push + watch deploy**

```bash
git push origin main
```

Run: `until curl -s https://plzenskaunikovka.cz/ | grep -q "Co ti zblokuje"; do sleep 5; done; echo DEPLOYED`

- [ ] **Step 4: Production smoke test**

```bash
curl -s -o /dev/null -w "/ %{http_code}\n" https://plzenskaunikovka.cz/
curl -s -o /dev/null -w "/?f=month %{http_code}\n" "https://plzenskaunikovka.cz/?f=month"
curl -s -o /dev/null -w "/?sel=americka %{http_code}\n" "https://plzenskaunikovka.cz/?sel=americka"
curl -s -o /dev/null -w "/doprava/americka %{http_code}\n" https://plzenskaunikovka.cz/doprava/americka
curl -s -o /dev/null -w "/sitemap.xml %{http_code}\n" https://plzenskaunikovka.cz/sitemap.xml
```
Expected: vše 200.

---

## Self-review

1. **Spec coverage** — všechny 4 sekce schváleného specu (layout, severity hierarchy, side panel + objížďka, filtry) mají task. Polyline objížďka odložena na Phase 2 per spec self-review.
2. **Placeholder scan** — všechny code bloky obsahují celý kód. „Task 7 Step 1" požaduje `cat` souboru protože stávající `ClosureMapInner.tsx` jsem v plánu nezkopíroval — implementer si ho přečte před úpravou.
3. **Type consistency** — `Severity` z `severity.ts` se ref-uje v `types.ts` přes `import("./severity").Severity` (deferred type import) — zabrání circular import. `TimeFilter` z `timeFilter.ts` se používá v `TimeFilterChips` a `MapView`. `closureById` z `data.ts` se používá v `MapView` — existuje.
4. **Refs check** — `SEVERITY_RANK` z `severity.ts` se používá v `MapView` (Task 9), exportováno (Task 1). ✅
5. **Cleanup safety** — Task 11 Step 1 grep-uje pro reference před smazáním — pokud něco najde, implementer ho přesměruje nebo dohledá.

## Open questions for implementer

- **Task 7 (ClosureMapInner)** — současný kód jsem nepřečetl celý do plánu. Implementer ho musí cat-nout a aplikovat úpravy v rámci existujících struktur (s nej-pravděpodobnější změnou: `Marker` → `CircleMarker` s `pathOptions`, plus `Tooltip` permanent pro major). Pokud `react-leaflet` v projektu nepodporuje `CircleMarker` z verze, použít `divIcon` + custom SVG.
- **Task 11 cleanup** — pokud `grep` najde referenci na smazanou komponentu (např. v `Header.tsx` po historickém commitu), implementer to opraví.

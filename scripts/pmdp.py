#!/usr/bin/env python3
"""PMDP scraper — Změny v dopravě → src/data/pmdp.json.

Stáhne list a všechny detail stránky z pmdp.cz/cz/informace-o-preprave/zmeny-v-doprave/,
parsuje titulky (linky, datum, předmět) a obsah (per-linka popis odklonu, dotčené zastávky),
namapuje na uzavírky v src/data/closures.json pomocí stem-matche a zapíše strukturovaná data
do src/data/pmdp.json. Toto je AUTO vrstva: extras.json (human-curated) ji při renderu přepíše.

Závislosti: stdlib (stejně jako scraper.py).
Použití: python3 scripts/pmdp.py
"""
from __future__ import annotations

import datetime as dt
import html
import json
import os
import re
import sys
import time
import urllib.request
from typing import Iterable

UA = {"User-Agent": "PlzenPrehledne/1.0 (+https://plzen-prehledne.vercel.app)"}
ROOT = os.path.join(os.path.dirname(__file__), "..")
LIST_URL = "https://www.pmdp.cz/cz/informace-o-preprave/zmeny-v-doprave/"

_TR = str.maketrans(
    {"á": "a", "č": "c", "ď": "d", "é": "e", "ě": "e", "í": "i", "ň": "n",
     "ó": "o", "ř": "r", "š": "s", "ť": "t", "ú": "u", "ů": "u", "ý": "y", "ž": "z"}
)


def ascii_lower(s: str) -> str:
    return s.lower().translate(_TR)


def get(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", "ignore")


def strip_tags(s: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


# --------- title parsing ---------

_LINE_TOKEN = r"N?\d{1,3}"
_LINE_RANGE = rf"{_LINE_TOKEN}(?:\s*[–—-]\s*{_LINE_TOKEN})?"


def expand_lines(text: str) -> list[str]:
    """Najdi všechna čísla linek v textu, expanduj rozsahy 'N1 - N6' → N1..N6."""
    found: list[str] = []
    for m in re.finditer(_LINE_RANGE, text):
        token = re.sub(r"\s+", "", m.group(0))
        if "-" in token or "–" in token or "—" in token:
            parts = re.split(r"[-–—]", token)
            if len(parts) == 2:
                a, b = parts
                pa = re.match(r"^(N)?(\d+)$", a)
                pb = re.match(r"^(N)?(\d+)$", b)
                if pa and pb and pa.group(1) == pb.group(1):
                    prefix = pa.group(1) or ""
                    lo, hi = int(pa.group(2)), int(pb.group(2))
                    if 0 < hi - lo <= 50:
                        found.extend(f"{prefix}{n}" for n in range(lo, hi + 1))
                        continue
        found.append(token)
    seen: set[str] = set()
    out: list[str] = []
    for ln in found:
        if ln not in seen and re.match(r"^N?\d+$", ln):
            seen.add(ln)
            out.append(ln)
    return out


def parse_lines_from_title(title: str) -> list[str]:
    """Extrahuj linky pouze z částí titulku, kde jsou linky zmíněny."""
    out: list[str] = []
    for ctx in re.findall(
        r"(?:linek|linky|linka|lince|linkách|linkami)\s+([^.]*?)(?:\s+(?:od|do|dne|v\s|pro|a\s+změny|, změny|,\s*[A-Z]|$))",
        title,
        re.I,
    ):
        out.extend(expand_lines(ctx))
    if not out:
        out = expand_lines(title)
    seen: set[str] = set()
    return [l for l in out if not (l in seen or seen.add(l))]


def parse_dates_from_title(title: str) -> tuple[str | None, str | None]:
    """Najdi 'od DD. M. YYYY' a 'do DD. M. YYYY' / 'do ukončení prací'."""
    def fmt(m: re.Match) -> str:
        d, mo, y = m.group(1), m.group(2), m.group(3)
        return f"{int(y):04d}-{int(mo):02d}-{int(d):02d}"

    start = None
    end = None
    m1 = re.search(r"od\s+(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})", title)
    if m1:
        start = fmt(m1)
    m2 = re.search(r"do\s+(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})", title)
    if m2:
        end = fmt(m2)
    elif re.search(r"do\s+ukončení", title, re.I):
        end = None  # otevřená výluka
    return start, end


# --------- detail page parsing ---------

# Zachytí p i li (vodorovně dlouhý popis bývá někdy v li)
_BLOCK_RE = re.compile(r"<(p|li)[^>]*>(.*?)</\1>", re.S | re.I)
_LINE_HEADER_RE = re.compile(rf"^Lin[ka|ky]\w*\s+((?:{_LINE_TOKEN}[,\s]*)+)", re.I)


_JUNK_TOKENS = (
    "© ", "Cookie", "osobních údajů", "Jízdné Přehled", "Jednotlivé jízdné",
    "DOMContentLoaded", "cookieconsent", "document.add",
    "Mapa stránek", "Telefon", "RSS Změny",
)


def split_into_paragraphs(html_text: str) -> list[str]:
    seen: list[str] = []
    seen_set: set[str] = set()
    for _, raw in _BLOCK_RE.findall(html_text):
        t = strip_tags(raw)
        if len(t) < 25 or t in seen_set:
            continue
        if any(token in t for token in _JUNK_TOKENS):
            continue
        seen_set.add(t)
        seen.append(t)
    return seen


_VIA_VERB = r"(?:pojedou|pojede|odkloněn[ya]|odklo­ně­n[ya]|jedou|jede|jezd[ií]|vedeny?\s+budou|budou\s+vedeny?|sjedou|odbočí|napojí)"
_VIA_CONN = r"(?:obousměrně\s+)?(?:do|přes|na|ze?|ulicemi|ulicí|sady?|po\s+)"


def via_summary(p: str) -> str:
    """Najdi v textu věta, která obsahuje via vzor; vrať relevantní část.
    Skenuje VŠECHNY věty (ne jen první), bere první, která matchne via pattern."""
    sentences = re.split(r"(?<=[.!?])\s+(?=[A-ZÁ-Ž])", p)
    for s in sentences:
        m = re.search(rf"{_VIA_VERB}\s+{_VIA_CONN}\s*(.+?)(?:[.;]|$)", s, re.I)
        if m:
            text = re.sub(r"\s+", " ", m.group(1).strip(" ,.").strip())
            if text:
                return text[:200]
    return ""


def looks_irrelevant(via: str) -> bool:
    v = via.lower()
    return any(x in v for x in ("beze změny", "se nemění", "stálé trase", "stálou trasu"))


def stops_from_paragraph(p: str) -> list[str]:
    out: list[str] = []
    # "Zrušeny zastávky A, B a C"
    for m in re.finditer(
        r"(?:Zrušen[ay]\s+zastávk[ay]|zrušen[ay]\s+zastávk[ay])\s+([^.]+)", p, re.I
    ):
        for part in re.split(r",| a ", m.group(1)):
            s = part.strip(" .;:")
            if 2 <= len(s) <= 40 and s[0].isupper():
                out.append(s)
    # "zastávka X bude/se nahrazuje/přesune do Y"
    for m in re.finditer(r"zastáv\w*\s+([A-ZÁ-Ž][^,.;:]{2,40})\s+(?:bude|se přesune|nahrazena)", p):
        s = m.group(1).strip()
        if s not in out:
            out.append(s)
    return out


def parse_detail(detail_html: str) -> dict:
    paras = split_into_paragraphs(detail_html)
    summary = paras[0] if paras else ""
    line_groups: list[dict] = []
    stops: list[str] = []
    notes: list[str] = []

    for p in paras:
        m = _LINE_HEADER_RE.match(p)
        if m:
            lines = expand_lines(m.group(1))
            rest = p[m.end():].lstrip(" :–-")
            via = via_summary(rest)
            if lines and via and not looks_irrelevant(via):
                line_groups.append({"lines": lines, "via": via})
            stops.extend(stops_from_paragraph(rest))
            continue

        # Generický paragraph se zmínkou linek a odklonu (Masarykova-style)
        if re.search(r"(odklon|odkloněn|pojedou|odjíž|obousměrně|jed[ou]\s+po|trasa)", p, re.I):
            lines_in = expand_lines(re.findall(r"linek\s+([^.;:]+)", p, re.I)[0]) if re.search(r"linek\s+", p, re.I) else expand_lines(p)
            via = via_summary(p)
            if via and not looks_irrelevant(via):
                line_groups.append({
                    "lines": lines_in[:20] or None,
                    "via": via,
                })
            stops.extend(stops_from_paragraph(p))
        else:
            if len(p) > 40 and "Telefon" not in p and "©" not in p:
                notes.append(p[:300])

    # Dedup stops, dedup reroutes
    seen_s: set[str] = set()
    stops = [s for s in stops if not (s in seen_s or seen_s.add(s))]
    seen_v: set[str] = set()
    dedup_groups: list[dict] = []
    for g in line_groups:
        key = (tuple(g.get("lines") or ()), g["via"])
        sk = json.dumps(key, ensure_ascii=False)
        if sk in seen_v:
            continue
        seen_v.add(sk)
        dedup_groups.append(g)
    return {
        "summary": summary[:500],
        "lineGroups": dedup_groups,
        "stopsAffected": stops,
        "notes": notes[:3],
    }


# --------- list scraping ---------

ENTRY_LINK_RE = re.compile(
    r'<a[^>]*href="(https://www\.pmdp\.cz/systransport/\d+/\d+/\d+/[^"]+)"[^>]*>(.*?)</a>',
    re.S | re.I,
)


def scrape_list() -> list[dict]:
    """Z list page vrať [{id, url, title}, …]. Stejný URL může mít víc <a> tagů
    (ikona + nadpis); vybereme ten s nejdelším smysluplným textem."""
    h = get(LIST_URL)
    candidates: dict[str, str] = {}
    for url, inner in ENTRY_LINK_RE.findall(h):
        title = strip_tags(inner)
        if len(title) < 8:
            continue
        if len(title) > len(candidates.get(url, "")):
            candidates[url] = title
    out: list[dict] = []
    for url, title in candidates.items():
        out.append({
            "id": url.rstrip("/").rsplit("/", 1)[-1] or url.rstrip("/").rsplit("/", 2)[-1],
            "url": url,
            "title": title,
        })
    return out


# --------- closure matching ---------

# Stems → použijí se k matchi titulku PMDP na closure.id
DEFAULT_STEMS: dict[str, list[str]] = {
    "americka": ["americk"],
    "masarykova": ["masaryk"],
    "28-rijna": ["28. říj", "28. rij", "říjn", "rijn", "bíl[áa] hor"],
    "domazlicka": ["domažl", "domazl"],
    "rokycanska": ["rokycan"],
    "rokycanska-2": [r"lávk.*rokycansk", r"lavk.*rokycansk", r"rokycansk.*lávk", r"rokycansk.*lavk"],
    "namesti-republiky": ["náměstí republik", "namesti republik"],
}


def match_closure(title: str, closure_ids: Iterable[str]) -> str | None:
    t = ascii_lower(title)
    # Iteruj v pořadí specifičtějších matcherů nejdřív (delší stem)
    candidates: list[tuple[int, str]] = []
    for cid in closure_ids:
        stems = DEFAULT_STEMS.get(cid)
        if not stems:
            continue
        for stem in stems:
            if re.search(stem, t, re.I):
                candidates.append((len(stem), cid))
                break
    if not candidates:
        return None
    candidates.sort(reverse=True)
    return candidates[0][1]


# --------- aggregator: PMDP → mhdInfo per closure ---------

def aggregate_mhd_info(entries_for_closure: list[dict]) -> dict:
    """Z seznamu PMDP entries pro 1 uzavírku vyrobí mhdInfo strukturu."""
    reroutes: list[dict] = []
    temp_stops: list[dict] = []
    notes: list[str] = []
    source_urls: list[tuple[str, str]] = []

    for e in entries_for_closure:
        for g in e.get("detail", {}).get("lineGroups") or []:
            via = g.get("via") or ""
            if not via:
                continue
            reroutes.append({
                "lines": g.get("lines") or None,
                "via": via,
            })
        for stop in e.get("detail", {}).get("stopsAffected") or []:
            if not any(t["name"] == stop for t in temp_stops):
                temp_stops.append({"name": stop, "where": "viz PMDP", "note": ""})
        for n in (e.get("detail", {}).get("notes") or [])[:2]:
            if n not in notes:
                notes.append(n)
        source_urls.append((e["url"], e["title"]))

    # Cleanup: drop empty/duplicate reroutes
    dedup_r: list[dict] = []
    seen_via: set[str] = set()
    for r in reroutes:
        key = (tuple(r.get("lines") or ()), r["via"])
        sk = json.dumps(key, ensure_ascii=False)
        if sk in seen_via:
            continue
        seen_via.add(sk)
        if r["lines"]:
            dedup_r.append({"lines": r["lines"], "via": r["via"]})
        else:
            dedup_r.append({"via": r["via"]})

    info: dict = {
        "reroutes": dedup_r,
        "tempStops": temp_stops,
        "notes": notes[:3],
        "sourceUrl": source_urls[0][0] if source_urls else None,
        "sourceLabel": "PMDP — " + (source_urls[0][1][:80] if source_urls else "Změny v dopravě"),
        "sourceUrlsAll": [u for u, _ in source_urls],
    }
    return info


# --------- main ---------

def main() -> int:
    print(f"· stahuji list: {LIST_URL}")
    entries = scrape_list()
    print(f"  → {len(entries)} výluk")

    # Načti closures.json kvůli matchování
    with open(os.path.join(ROOT, "src", "data", "closures.json"), encoding="utf-8") as f:
        closures = json.load(f)
    closure_ids = [c["id"] for c in closures]

    for e in entries:
        e["lines"] = parse_lines_from_title(e["title"])
        e["startDate"], e["endDate"] = parse_dates_from_title(e["title"])
        e["matchedClosure"] = match_closure(e["title"], closure_ids)

    matched = [e for e in entries if e["matchedClosure"]]
    print(f"  → {len(matched)} z {len(entries)} matchnuto na uzavírku")

    # Stáhni detail jen pro matched entries (šetříme PMDP)
    for i, e in enumerate(matched, 1):
        try:
            print(f"  · ({i}/{len(matched)}) detail: {e['title'][:70]}…")
            h = get(e["url"])
            e["detail"] = parse_detail(h)
            time.sleep(1)
        except Exception as exc:
            print(f"    ⚠ chyba: {exc}")
            e["detail"] = {"summary": "", "lineGroups": [], "stopsAffected": [], "notes": []}

    # Agreguj per closure
    per_closure: dict[str, dict] = {}
    for cid in {e["matchedClosure"] for e in matched}:
        es = [e for e in matched if e["matchedClosure"] == cid]
        per_closure[cid] = aggregate_mhd_info(es)

    snapshot = {
        "snapshot": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "source": LIST_URL,
        "entries": [{k: v for k, v in e.items() if k != "detail" or v.get("summary")} for e in entries],
        "perClosure": per_closure,
    }

    out_path = os.path.join(ROOT, "src", "data", "pmdp.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(snapshot, f, ensure_ascii=False, indent=1)

    print(f"· zapsáno {len(per_closure)} per-closure záznamů + {len(entries)} raw do {out_path}")
    for cid, info in per_closure.items():
        nr = len(info.get("reroutes", []))
        nt = len(info.get("tempStops", []))
        print(f"  ✓ {cid}: {nr} odklon(ů), {nt} zastáv.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

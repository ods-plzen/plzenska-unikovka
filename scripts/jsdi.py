#!/usr/bin/env python3
"""JSDI / SITmP scraper — aktivní uzavírky z agp.plzen.eu ArcGIS REST API.

Stáhne `Aktivni=1` features z layer 0 (RIA, JSDI) `GIS_Doprava_Uzavirky` MapServer,
přemapuje na `src/data/closures.json` schema, zachová stávající ID konvenci (slug
ulice), aby `extras.json` overlay (= human-curated detail) i PMDP matching
zůstaly funkční.

Datové zdroje:
  - SITmP — Správa informačních technologií města Plzně
  - JSDI ŘSD — Jednotný systém dopravních informací Ředitelství silnic a dálnic
  - SUPERDIO — Městská evidence investičních akcí

Závislosti: jen stdlib. Žádný Overpass, žádný HTML scraping.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import socket
import sys
import urllib.error
import urllib.request

UA = {
    "User-Agent": "PlzenskaUnikovka/1.0 (+https://plzenskaunikovka.cz)",
    "Accept": "application/json",
}
ROOT = os.path.join(os.path.dirname(__file__), "..")
SERVICE = (
    "https://ags.plzen.eu/arcgis/rest/services/"
    "GIS_Doprava/GIS_Doprava_Uzavirky/MapServer/0/query"
)
ROAD_LAYER = (
    "https://ags.plzen.eu/arcgis/rest/services/"
    "GIS_Doprava/GIS_Doprava_Uzavirky/MapServer/11/query"
)

# Pro GH Actions runner: služba má IPv6 record, ale routing často padá.
_orig_getaddrinfo = socket.getaddrinfo
def _ipv4_only(host, *args, **kwargs):
    return [info for info in _orig_getaddrinfo(host, *args, **kwargs) if info[0] == socket.AF_INET]
socket.getaddrinfo = _ipv4_only


_TR = str.maketrans(
    {"á": "a", "č": "c", "ď": "d", "é": "e", "ě": "e", "í": "i", "ň": "n",
     "ó": "o", "ř": "r", "š": "s", "ť": "t", "ú": "u", "ů": "u", "ý": "y", "ž": "z"}
)


def slug(s: str) -> str:
    s = s.lower().translate(_TR)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:40] or "uzavirka"


def get(url: str, retries: int = 3) -> dict:
    req = urllib.request.Request(url, headers=UA)
    last_exc: Exception | None = None
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read())
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            last_exc = e
            if attempt < retries - 1:
                import time
                time.sleep(2 ** attempt)
    raise last_exc if last_exc else RuntimeError("fetch failed")


# -------------- parsing Nazev --------------

_RE_OBVOD = re.compile(r"\bPlzeň\s*(\d{1,2})\b")
_RE_ULICE = re.compile(r"\bulice\s+([^,(]+?)(?:\s*,|\s*\()", re.I)
_RE_SUBULICE = re.compile(r"\(\s*ulice\s+([^)]+)\)", re.I)
_RE_SILNICE = re.compile(r"\bsilnice\s+([IVX]+/\d+|[\w\d\.\-/]+)", re.I)
_RE_REASON = re.compile(
    r"(?:uzavřeno|omezení|omezeno)[\s,]+(.+?)(?:,\s*Od\s+\d|,\s*Vydal:|$)",
    re.I,
)


def parse_street(nazev: str) -> tuple[str | None, bool]:
    """Vrátí (jméno ulice/silnice, je_to_silnice). None = nepodařilo se."""
    # Preferuj "(ulice X)" závorku — typicky upřesnění uvnitř silnice
    m = _RE_SUBULICE.search(nazev)
    if m:
        return m.group(1).strip(), True
    m = _RE_ULICE.search(nazev)
    if m:
        return m.group(1).strip(), False
    m = _RE_SILNICE.search(nazev)
    if m:
        return m.group(1).strip(), True
    return None, False


def parse_obvod(nazev: str) -> str | None:
    m = _RE_OBVOD.search(nazev)
    if not m:
        return None
    n = int(m.group(1))
    if 1 <= n <= 10:
        return f"Plzeň {n}"
    return None


def parse_reason(nazev: str) -> str:
    m = _RE_REASON.search(nazev)
    if m:
        return m.group(1).strip().rstrip(".")
    return ""


def ts_to_cz(ms: int | None) -> str | None:
    if ms is None:
        return None
    try:
        d = dt.datetime.fromtimestamp(ms / 1000, tz=dt.timezone.utc)
        return d.strftime("%-d. %-m. %Y")
    except (OSError, ValueError):
        return None


def ts_to_iso(ms: int | None) -> str | None:
    if ms is None:
        return None
    try:
        return dt.datetime.fromtimestamp(ms / 1000, tz=dt.timezone.utc).date().isoformat()
    except (OSError, ValueError):
        return None


HLAVNI_TAHY = {
    "Americká", "Klatovská", "Klatovská třída", "Rokycanská", "Domažlická",
    "Karlovarská", "28. října", "Lochotínská", "Masarykova", "Folmavská",
    "Borská", "Tylova", "Jateční", "Mikulášská", "Na Roudné",
}


def classify_severity(name: str, akce: str, popis: str) -> str:
    text = (akce + " " + popis).lower()
    is_state = bool(re.search(r"\b(i|ii|iii)\s*/\s*\d+", text, re.I))
    has_closure = bool(re.search(r"\buzavřen|\buzavírk", text))
    on_hlavni = name in HLAVNI_TAHY
    if has_closure and (is_state or on_hlavni):
        return "major"
    if re.search(r"jednosměr|kyvadlov|protisměr|omezení|sveden|jeden\s+jízdní", text):
        return "medium"
    return "minor"


def format_termin(od: int | None, do: int | None) -> str:
    a = ts_to_cz(od)
    b = ts_to_cz(do)
    if a and b:
        return f"{a} – {b}"
    if a:
        return f"od {a}"
    if b:
        return f"do {b}"
    return ""


# -------------- layer 11 polyline join --------------

def fetch_polylines_by_jsdi_id() -> dict[str, list[list[list[float]]]]:
    """Z layer 11 (silniční síť CEDA + JSDI sekce) vrátí polyline geometrii
    sgroupovanou podle JSDI message_id. Klíč = JSDI_ID (UUID), hodnota =
    list polylines (každá polyline = list [lat, lon] bodů)."""
    params = (
        "where=GIS_AG.AGS.DOPRAVA_JSDI_SEKCE.active%3D1"
        "&outFields=GIS_AG.AGS.DOPRAVA_JSDI_SEKCE.message_id"
        "&returnGeometry=true&f=json&outSR=4326&resultRecordCount=2000"
    )
    url = f"{ROAD_LAYER}?{params}"
    print(f"· stahuji silniční sekce: {url[:80]}…")
    data = get(url)
    feats = data.get("features", [])
    print(f"  → {len(feats)} aktivních segmentů")

    by_id: dict[str, list[list[list[float]]]] = {}
    for f in feats:
        mid = (f.get("attributes") or {}).get(
            "GIS_AG.AGS.DOPRAVA_JSDI_SEKCE.message_id"
        )
        if not mid:
            continue
        paths = (f.get("geometry") or {}).get("paths") or []
        for path in paths:
            # path = [[lon, lat], …] (ArcGIS pořadí); chceme [lat, lon]
            pts = [[round(p[1], 5), round(p[0], 5)] for p in path if len(p) >= 2]
            if len(pts) >= 2:
                by_id.setdefault(mid, []).append(pts)
    print(f"  → {len(by_id)} unikátních JSDI message_id má polyline")
    return by_id


# -------------- main --------------

def main() -> int:
    polylines_by_id = fetch_polylines_by_jsdi_id()

    # Bonus output: všechny aktivní silniční segmenty (i ty, co nemají match
    # na konkrétní uzavírku) → renderuje se jako červený overlay „silnice
    # s aktuálním omezením".
    restrictions = [
        {"messageId": mid, "ways": paths}
        for mid, paths in polylines_by_id.items()
    ]
    restr_path = os.path.join(ROOT, "src", "data", "restricted-roads.json")
    with open(restr_path, "w", encoding="utf-8") as f:
        json.dump(
            {
                "snapshot": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
                "source": ROAD_LAYER,
                "roads": restrictions,
            },
            f,
            ensure_ascii=False,
            indent=1,
        )
    print(f"· zapsáno {len(restrictions)} silničních segmentů do {restr_path}")

    params = "where=Aktivni%3D1&outFields=*&returnGeometry=true&f=json&outSR=4326"
    url = f"{SERVICE}?{params}"
    print(f"· stahuji JSDI/SITmP: {url}")
    data = get(url)
    feats = data.get("features", [])
    print(f"  → {len(feats)} aktivních záznamů")

    closures: list[dict] = []
    seen_ids: dict[str, int] = {}
    skipped_outside = 0
    skipped_geom = 0

    for f in feats:
        a = f.get("attributes") or {}
        nazev = a.get("Nazev") or ""
        obvod = parse_obvod(nazev)
        if not obvod:
            skipped_outside += 1
            continue

        street, _ = parse_street(nazev)
        if not street:
            street = "Uzavírka"

        g = f.get("geometry") or {}
        x, y = g.get("x"), g.get("y")
        if x is None or y is None:
            skipped_geom += 1
            continue

        # Upgrade na polyline geometry, pokud JSDI message_id najde match
        # v layer 11. Jinak fallback na point marker.
        jsdi_id = a.get("JSDI_ID")
        polylines = polylines_by_id.get(jsdi_id) if jsdi_id else None

        base = slug(street)
        cid = base
        if cid in seen_ids:
            seen_ids[base] += 1
            cid = f"{base}-{seen_ids[base]}"
        else:
            seen_ids[base] = 1

        # Subtyp je čistý enum z JSDI (uzavřená silnice / kyvadlová doprava /
        # oprava povrchu / jednosměrná uzavírka / …). Preferujeme ho.
        subtyp_field = (a.get("Subtyp") or "").strip()
        reason = parse_reason(nazev)
        akce = (subtyp_field or reason or "Uzavírka")[:80].strip()
        akce = akce[:1].upper() + akce[1:] if akce else "Uzavírka"

        if polylines:
            ways = polylines
            is_point = False
        else:
            ways = [[[round(y, 5), round(x, 5)]]]
            is_point = True
        termin = format_termin(a.get("Od"), a.get("Do"))

        popis = nazev[:500]
        rec: dict = {
            "id": cid,
            "name": street,
            "akce": akce,
            "state": "Probíhá",
            "status": "now",
            "color": "#c0392b",
            "oblast": obvod,
            "termin": termin,
            "ways": ways,
            "point": is_point,
            "popis": popis,
            "typ": a.get("Typ") or "",
            "subtyp": a.get("Subtyp") or "",
            "zdroj": a.get("Zdroj") or "JSDI",
            "jsdiId": a.get("JSDI_ID") or None,
            "superdioId": a.get("Superdio_ID") or None,
            "od": ts_to_iso(a.get("Od")),
            "do": ts_to_iso(a.get("Do")),
            "severity": classify_severity(street, akce, popis),
        }
        closures.append(rec)

    print(f"  → {len(closures)} uzavírek v Plzni")
    if skipped_outside:
        print(f"  ↷ {skipped_outside} mimo plzeňské obvody")
    if skipped_geom:
        print(f"  ⚠ {skipped_geom} bez geometrie")

    out_path = os.path.join(ROOT, "src", "data", "closures.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(closures, f, ensure_ascii=False, indent=1)
    print(f"· zapsáno {len(closures)} uzavírek do {out_path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())

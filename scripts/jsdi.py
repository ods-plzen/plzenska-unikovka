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
import time
import urllib.error
import urllib.parse
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
OVERPASS = "https://overpass-api.de/api/interpreter"
OSM_CACHE_DAYS = 30

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

def fetch_polylines_by_jsdi_id() -> tuple[
    dict[str, list[list[list[float]]]],
    list[list[list[float]]],
]:
    """Z layer 11 (silniční síť CEDA + JSDI sekce) vrátí dva pohledy:
    - by_id: polyline geometrie sgrupovaná podle JSDI message_id
    - all_paths: flat list všech polyline segmentů pro spatial proximity match
    Každá polyline = list [lat, lon] bodů."""
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
    all_paths: list[list[list[float]]] = []
    for f in feats:
        mid = (f.get("attributes") or {}).get(
            "GIS_AG.AGS.DOPRAVA_JSDI_SEKCE.message_id"
        )
        paths = (f.get("geometry") or {}).get("paths") or []
        for path in paths:
            # path = [[lon, lat], …] (ArcGIS pořadí); chceme [lat, lon]
            pts = [[round(p[1], 5), round(p[0], 5)] for p in path if len(p) >= 2]
            if len(pts) < 2:
                continue
            all_paths.append(pts)
            if mid:
                by_id.setdefault(mid, []).append(pts)
    print(f"  → {len(by_id)} JSDI message_id má polyline · {len(all_paths)} segmentů celkem")
    return by_id, all_paths


def fetch_plzen_streets() -> dict[str, list[list[list[float]]]]:
    """Stáhne přes Overpass všechny pojmenované ulice v Plzni. Cache TTL 30 dní
    v scripts/cache/plzen-streets.json (commitnutá do repa). Klíč = lowercase
    název ulice (bez diakritiky pro fuzzy match), hodnota = list polylines."""
    cache_path = os.path.join(ROOT, "scripts", "cache", "plzen-streets.json")
    if os.path.exists(cache_path):
        if os.path.getmtime(cache_path) > time.time() - OSM_CACHE_DAYS * 86400:
            try:
                with open(cache_path, encoding="utf-8") as f:
                    print(f"· OSM streets cache hit: {cache_path}")
                    return json.load(f)
            except (OSError, json.JSONDecodeError):
                pass

    print(f"· stahuji OSM ulice Plzně přes Overpass…")
    q = (
        '[out:json][timeout:120];'
        'area["name"="Plzeň"]["admin_level"="8"]->.p;'
        'way(area.p)["highway"]["name"];'
        'out geom;'
    )
    try:
        body = urllib.parse.urlencode({"data": q}).encode()
        req = urllib.request.Request(
            OVERPASS, data=body, headers={**UA, "Accept": "application/json"}, method="POST"
        )
        last_exc: Exception | None = None
        for attempt in range(3):
            try:
                with urllib.request.urlopen(req, timeout=180) as r:
                    parsed = json.loads(r.read())
                break
            except (urllib.error.URLError, TimeoutError, OSError) as e:
                last_exc = e
                if attempt < 2:
                    time.sleep(5 * (attempt + 1))
                else:
                    raise
    except Exception as e:
        print(f"  ⚠ Overpass selhal ({e}); pokračuji bez OSM streetů")
        return {}

    out: dict[str, list[list[list[float]]]] = {}
    for el in parsed.get("elements", []):
        if el.get("type") != "way":
            continue
        name = (el.get("tags", {}).get("name") or "").lower().strip()
        if not name:
            continue
        path = [
            [round(p["lat"], 5), round(p["lon"], 5)]
            for p in el.get("geometry", [])
            if "lat" in p and "lon" in p
        ]
        if len(path) >= 2:
            out.setdefault(name, []).append(path)
    print(f"  → {len(out)} unikátních ulic, {sum(len(v) for v in out.values())} segmentů")

    os.makedirs(os.path.dirname(cache_path), exist_ok=True)
    try:
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False)
    except OSError as e:
        print(f"  ⚠ Cache write failed: {e}")
    return out


def lookup_osm_street(
    name: str, osm_streets: dict[str, list[list[list[float]]]]
) -> list[list[list[float]]]:
    """Najdi polyline geometrii ulice v OSM. Zkusí: přesný match, lowercase,
    substring (pro varianty jako Klatovská vs Klatovská třída)."""
    key = name.lower().strip()
    if not key:
        return []
    if key in osm_streets:
        return osm_streets[key]
    # substring matches (Klatovská → Klatovská třída)
    matches: list[list[list[float]]] = []
    for osm_name, paths in osm_streets.items():
        if key in osm_name or osm_name in key:
            matches.extend(paths)
    return matches


def find_nearby_paths(
    point_latlon: tuple[float, float],
    all_paths: list[list[list[float]]],
    max_dist_m: float = 150,
) -> list[list[list[float]]]:
    """Spatial match: vrátí všechny polyline segmenty, jejichž nějaký bod
    je do max_dist_m metrů od daného bodu. Hrubá euklidovská aproximace
    v stupních (postačuje pro malé vzdálenosti v Plzni)."""
    plat, plon = point_latlon
    # 1° lat ≈ 111 km, 1° lon na 49.7° ≈ 72 km. Použijeme korekci.
    max_deg = max_dist_m / 111_000
    lon_corr = 0.65  # cos(49.7°)
    matching: list[list[list[float]]] = []
    for path in all_paths:
        for pt in path:
            lat, lon = pt[0], pt[1]
            dlat = lat - plat
            dlon = (lon - plon) * lon_corr
            if (dlat * dlat + dlon * dlon) ** 0.5 < max_deg:
                matching.append(path)
                break
    return matching


_RE_USEK_OD_PO = re.compile(
    r"v\s+úseku\s+od\s+([^,]+?)\s+(?:až\s+(?:za|po|ke?)|po|do|ke?)\s+"
    r"(?:křižovatk[ay]\s+s\s+)?(?:ulicí?\s+)?([^,]+?)"
    r"(?=\s+(?:z\s+důvodu|Vydal|,|$))",
    re.I,
)
_RE_USEK_DASH = re.compile(
    r"v\s+úseku\s+(?:ulicí?\s+)?([^,–\-—]+?)\s*[–\-—]\s*(?:ulicí?\s+)?([^,]+?)"
    r"(?=\s+(?:z\s+důvodu|Vydal|,|$))",
    re.I,
)
_RE_GENERIC_LANDMARK = re.compile(
    r"^(?:kruhov[ého]+\s+objezdu|centr[au]\s+města|nábřeží|mostu|obce\s+\w+)$",
    re.I,
)


def parse_usek(text: str) -> tuple[str, str] | None:
    """Vrátí (X, Y) — názvy okrajových ulic úseku z popisu, nebo None."""
    m = _RE_USEK_OD_PO.search(text)
    if m:
        return _clean_endpoint(m.group(1)), _clean_endpoint(m.group(2))
    m = _RE_USEK_DASH.search(text)
    if m:
        return _clean_endpoint(m.group(1)), _clean_endpoint(m.group(2))
    return None


def _clean_endpoint(s: str) -> str:
    return s.strip().rstrip(".,;:").strip()


def _normalize_osm_key(name: str) -> str:
    n = name.lower().strip()
    n = re.sub(r"^(ulicí?|ulice|silnice|na)\s+", "", n)
    return n


def _nearest_idx_on_path(
    path: list[list[float]], target: tuple[float, float]
) -> tuple[int, float]:
    tlat, tlon = target
    best_d = float("inf")
    best_i = -1
    for i, pt in enumerate(path):
        dlat = pt[0] - tlat
        dlon = (pt[1] - tlon) * 0.65
        d = dlat * dlat + dlon * dlon
        if d < best_d:
            best_d = d
            best_i = i
    return best_i, best_d


def _nearest_intersection(
    main_path: list[list[float]], cross_paths: list[list[list[float]]]
) -> tuple[float, float] | None:
    """Najdi bod na main_path, který je nejblíže k jakémukoliv bodu cross_paths."""
    best_d = float("inf")
    best_pt: tuple[float, float] | None = None
    for pt in main_path:
        plat, plon = pt[0], pt[1]
        for path in cross_paths:
            for opt in path:
                dlat = plat - opt[0]
                dlon = (plon - opt[1]) * 0.65
                d = dlat * dlat + dlon * dlon
                if d < best_d:
                    best_d = d
                    best_pt = (plat, plon)
    # Maximální vzdálenost ~50m, jinak to není opravdový "křížení"
    if best_d > (50 / 111_000) ** 2:
        return None
    return best_pt


def precise_clip_from_text(
    nazev: str,
    closure_pt: tuple[float, float],
    main_paths: list[list[list[float]]],
    osm_streets: dict[str, list[list[list[float]]]],
) -> list[list[list[float]]] | None:
    """Pokus o přesný úsek z textu 'v úseku X po Y'. Vrátí None pokud
    parser selže nebo nelze najít křižovatky obou krajních ulic."""
    parsed = parse_usek(nazev)
    if not parsed:
        return None
    x_name, y_name = parsed
    x_key = _normalize_osm_key(x_name)
    y_key = _normalize_osm_key(y_name)
    # Generické landmarky (kruhový objezd, centrum, …) → nelze najít v OSM
    x_paths = (
        []
        if _RE_GENERIC_LANDMARK.match(x_key)
        else lookup_osm_street(x_key, osm_streets)
    )
    y_paths = (
        []
        if _RE_GENERIC_LANDMARK.match(y_key)
        else lookup_osm_street(y_key, osm_streets)
    )
    if not x_paths and not y_paths:
        return None

    out: list[list[list[float]]] = []
    for main in main_paths:
        if x_paths and y_paths:
            x_pt = _nearest_intersection(main, x_paths)
            y_pt = _nearest_intersection(main, y_paths)
            if not x_pt or not y_pt:
                continue
            a_i, _ = _nearest_idx_on_path(main, x_pt)
            b_i, _ = _nearest_idx_on_path(main, y_pt)
        elif y_paths:
            y_pt = _nearest_intersection(main, y_paths)
            if not y_pt:
                continue
            a_i, _ = _nearest_idx_on_path(main, closure_pt)
            b_i, _ = _nearest_idx_on_path(main, y_pt)
        else:  # only x_paths
            x_pt = _nearest_intersection(main, x_paths)
            if not x_pt:
                continue
            a_i, _ = _nearest_idx_on_path(main, x_pt)
            b_i, _ = _nearest_idx_on_path(main, closure_pt)
        if a_i < 0 or b_i < 0:
            continue
        lo, hi = min(a_i, b_i), max(a_i, b_i) + 1
        clipped = main[lo:hi]
        if len(clipped) >= 2:
            out.append(clipped)
    return out if out else None


def clip_paths_to_radius(
    point_latlon: tuple[float, float],
    paths: list[list[list[float]]],
    max_dist_m: float = 300,
) -> list[list[list[float]]]:
    """OSM ulice jsou často dlouhé (Na Roudné = 2 km). Pro každý segment
    najdi jen vertices ≤ max_dist_m od bodu uzavírky a vrať contiguous range
    od první do poslední blízké. Pokud segment není nikde blízko, vyhoď."""
    plat, plon = point_latlon
    max_deg = max_dist_m / 111_000
    lon_corr = 0.65
    out: list[list[list[float]]] = []
    for path in paths:
        near_idx: list[int] = []
        for i, pt in enumerate(path):
            lat, lon = pt[0], pt[1]
            dlat = lat - plat
            dlon = (lon - plon) * lon_corr
            if (dlat * dlat + dlon * dlon) ** 0.5 < max_deg:
                near_idx.append(i)
        if not near_idx:
            continue
        # Mírně rozšíříme range o 1 vertex na každou stranu pro plynulý kraj
        lo = max(0, near_idx[0] - 1)
        hi = min(len(path), near_idx[-1] + 2)
        clipped = path[lo:hi]
        if len(clipped) >= 2:
            out.append(clipped)
    return out


# -------------- main --------------

def main() -> int:
    polylines_by_id, all_polylines = fetch_polylines_by_jsdi_id()
    osm_streets = fetch_plzen_streets()

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

        # Polyline geometry — 5 tierů přesnosti:
        # 1 = JSDI_ID match v layer 11 (= explicitní SITmP polyline)
        # 2 = Spatial proximity 150m k layer 11 segmentům
        # 3 = OSM main + JSDI text "v úseku X po Y" → klip mezi křižovatkami
        # 4 = OSM main + 300m radius okolo bodu uzavírky (heuristika)
        # 5 = bod (state route bez OSM jména)
        geom_tier = 5
        jsdi_id = a.get("JSDI_ID")
        polylines = polylines_by_id.get(jsdi_id) if jsdi_id else None
        if polylines:
            geom_tier = 1
        else:
            t2 = find_nearby_paths((y, x), all_polylines, max_dist_m=150)
            if t2:
                polylines = t2
                geom_tier = 2
        if not polylines and osm_streets:
            osm_paths = lookup_osm_street(street, osm_streets)
            if osm_paths:
                # Tier 3: pokus o přesný klip mezi křižovatkami z popisu
                precise = precise_clip_from_text(nazev, (y, x), osm_paths, osm_streets)
                if precise:
                    polylines = precise
                    geom_tier = 3
                else:
                    polylines = clip_paths_to_radius((y, x), osm_paths, max_dist_m=300)
                    if polylines:
                        geom_tier = 4

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
            "geomTier": geom_tier,
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

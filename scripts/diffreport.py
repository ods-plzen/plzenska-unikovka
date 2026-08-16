#!/usr/bin/env python3
"""Denní diff uzavírek: co přibylo, zmizelo, co se změnilo.

Běží v cronu PO jsdi.py + pmdp.py, ale PŘED commitem — HEAD tedy ještě drží
včerejší data a pracovní strom už má dnešní. Porovnává obě verze a:

1. zapíše src/data/changes.json (rolling log ~60 dní) — z něj web ukazuje
   badge NOVÉ / PRODLOUŽENO,
2. pošle NTFY souhrn, když se něco změnilo (env NTFY_TOPIC; bez něj ticho),
3. varuje, když se pod kurátorovanou objížďkou v extras.json změnil úřední
   popis nebo termín — to je signál "zákres může být zastaralý".

Test bez gitu: python scripts/diffreport.py --prev stara-data.json
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
import urllib.request
from datetime import date, datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLOSURES = os.path.join(ROOT, "src", "data", "closures.json")
EXTRAS = os.path.join(ROOT, "src", "data", "extras.json")
CHANGES = os.path.join(ROOT, "src", "data", "changes.json")
KEEP_DAYS = 60

# Pole, jejichž změna je pro čtenáře zpráva. Geometrii hlídáme hashem,
# drobné posuny bodů ze zdroje nechceme hlásit jako změnu.
WATCHED = ("termin", "od", "do", "status", "popis")


def load_prev(prev_path: str | None) -> list[dict] | None:
    if prev_path:
        with open(prev_path, encoding="utf-8") as f:
            return json.load(f)
    try:
        out = subprocess.run(
            ["git", "show", "HEAD:src/data/closures.json"],
            cwd=ROOT, capture_output=True, text=True, check=True,
        ).stdout
        return json.loads(out)
    except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
        print(f"⚠ předchozí closures.json nelze načíst ({e}) — diff přeskočen")
        return None


def ways_hash(c: dict) -> str:
    return hashlib.sha1(
        json.dumps(c.get("ways", []), sort_keys=True).encode()
    ).hexdigest()[:10]


def brief(c: dict) -> dict:
    return {"id": c["id"], "name": c.get("name", c["id"]),
            "oblast": c.get("oblast", ""), "termin": c.get("termin", "")}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prev", help="cesta ke starým datům (jinak git HEAD)")
    args = ap.parse_args()

    prev = load_prev(args.prev)
    if prev is None:
        return 0
    with open(CLOSURES, encoding="utf-8") as f:
        new = json.load(f)
    try:
        with open(EXTRAS, encoding="utf-8") as f:
            extras = json.load(f)
    except OSError:
        extras = {}

    prev_by = {c["id"]: c for c in prev}
    new_by = {c["id"]: c for c in new}

    added = [brief(c) for i, c in new_by.items() if i not in prev_by]
    removed = []
    for i, c in prev_by.items():
        if i in new_by:
            continue
        # Penzionované (done/retired) mizí plánovaně po RETIRE_KEEP_DAYS — nehlásit.
        if c.get("retired") or c.get("status") == "done":
            continue
        r = brief(c)
        # Běžící záznam zmizel ÚPLNĚ (retirement ho nezachytil) — to je anomálie.
        r["note"] = ("zmizela ze zdroje (běžela)" if c.get("status") == "now"
                     else "zmizela ze zdroje")
        removed.append(r)

    changed = []
    warnings = []
    for i, c in new_by.items():
        p = prev_by.get(i)
        if p is None:
            continue
        diffs = {}
        for k in WATCHED:
            if (p.get(k) or "") != (c.get(k) or ""):
                diffs[k] = {"z": p.get(k) or "", "na": c.get(k) or ""}
        if ways_hash(p) != ways_hash(c):
            diffs["geometrie"] = {"z": "", "na": "změněn zákres úseku"}
        if not diffs:
            continue
        entry = brief(c)
        entry["zmeny"] = diffs
        # "prodlouženo" = posun konce doprava — nejčastější a nejcitlivější změna
        if "do" in diffs and diffs["do"]["z"] and diffs["do"]["na"] > diffs["do"]["z"]:
            entry["prodlouzeno"] = True
        if "status" in diffs and diffs["status"]["na"] == "done":
            entry["hotovo"] = True
        changed.append(entry)
        # Kurátorovaná objížďka nad změněným úředním záznamem → varování
        ex = extras.get(i) or {}
        if ex.get("detours") and ({"popis", "termin", "geometrie"} & set(diffs)):
            warnings.append({
                "id": i, "name": entry["name"],
                "note": "kurátorovaná objížďka: úřední záznam se změnil, zkontrolovat zákres",
            })

    # Mrtvé overridy: extras s objížďkou k neexistující uzavírce
    for i, ex in extras.items():
        if isinstance(ex, dict) and ex.get("detours") and i not in new_by:
            warnings.append({"id": i, "name": ex.get("title", i),
                             "note": "extras s objížďkou míří na neexistující uzavírku"})

    today = date.today().isoformat()
    day = {"date": today, "added": added, "removed": removed,
           "changed": changed, "warnings": warnings}

    try:
        with open(CHANGES, encoding="utf-8") as f:
            log = json.load(f)
    except (OSError, json.JSONDecodeError):
        log = {"days": []}
    days = [d for d in log.get("days", []) if d.get("date") != today]
    days.insert(0, day)
    log = {"updated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
           "days": days[:KEEP_DAYS]}
    with open(CHANGES, "w", encoding="utf-8") as f:
        json.dump(log, f, ensure_ascii=False, indent=1)

    n = len(added) + len(removed) + len(changed)
    print(f"· diff: +{len(added)} nových, −{len(removed)} zmizelých, "
          f"~{len(changed)} změněných, {len(warnings)} varování")
    for w in warnings:
        print(f"  ⚠ {w['name']}: {w['note']}")

    topic = os.environ.get("NTFY_TOPIC", "").strip()
    if topic and (n or warnings):
        lines = []
        for a in added:
            lines.append(f"+ {a['name']} ({a['oblast']}) {a['termin']}")
        for r in removed:
            lines.append(f"− {r['name']} — {r['note']}")
        for ch in changed:
            what = ", ".join(ch["zmeny"].keys())
            tag = " PRODLOUŽENO" if ch.get("prodlouzeno") else (" HOTOVO" if ch.get("hotovo") else "")
            lines.append(f"~ {ch['name']}: {what}{tag}")
        for w in warnings:
            lines.append(f"⚠ {w['name']}: {w['note']}")
        body = "\n".join(lines[:25])
        req = urllib.request.Request(
            f"https://ntfy.sh/{topic}", data=body.encode(),
            headers={"Title": f"Unikovka data: +{len(added)} -{len(removed)} ~{len(changed)}",
                     "Priority": "high" if warnings else "default"},
        )
        try:
            urllib.request.urlopen(req, timeout=15)
            print("· NTFY odesláno")
        except OSError as e:
            print(f"⚠ NTFY selhalo: {e}")

    return 0


if __name__ == "__main__":
    sys.exit(main())

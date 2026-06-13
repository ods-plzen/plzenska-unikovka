#!/usr/bin/env python3
"""Poloautomatický extraktor objížděk a MHD z článků města — návrh pro lidskou kontrolu.

NEPÍŠE nic do dat automaticky. Najde k uzavírce odpovídající článek na plzen.eu,
vytáhne odstavce o objízdné trase / autobusech / parkování a vypíše NÁVRH bloku
do src/data/extras.json. Člověk ho zkontroluje a ručně vloží (human-in-the-loop).

Použití:
  python3 scripts/enrich.py "28. října"                 # vyhledá článek podle ulice
  python3 scripts/enrich.py "28. října" <URL_clanku>     # použije konkrétní článek
"""
import sys, re, html, json, urllib.request, urllib.parse

UA = {"User-Agent": "PlzenPrehledne/1.0 (+https://plzen-prehledne.vercel.app)"}


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read().decode("utf-8", "ignore")


def slug(name):
    tr = str.maketrans("áčďéěíňóřšťúůýž", "acdeeinorstuuyz")
    return re.sub(r"[^a-z0-9]+", "-", name.lower().translate(tr)).strip("-")[:28]


def find_article(street):
    # Fulltext na plzen.eu; vrať první odkaz do aktualit, který zmiňuje ulici.
    try:
        h = get("https://plzen.eu/?s=" + urllib.parse.quote(street))
    except Exception:
        return None
    for href in re.findall(r'href="(https://plzen\.eu/o-meste/aktuality/[^"]+)"', h):
        return href
    return None


def paragraphs(url):
    h = get(url)
    out = []
    for p in re.findall(r"<p[^>]*>(.*?)</p>", h, re.S):
        t = html.unescape(re.sub(r"<[^>]+>", "", p)).replace("\xa0", " ")
        t = re.sub(r"\s+", " ", t).strip()
        if len(t) > 40:
            out.append(t)
    return out


def classify(t):
    tl = t.lower()
    if re.search(r"objíz|objíž", tl):
        return "objizdka"
    if re.search(r"autobus|tramvaj|\bmhd\b|zastáv|linka|točn", tl):
        return "mhd"
    if re.search(r"parkov", tl):
        return "parkovani"
    return None


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return
    street = sys.argv[1]
    url = sys.argv[2] if len(sys.argv) > 2 else find_article(street)
    if not url:
        print(f"⚠ Nenašel jsem článek pro: {street}. Zadej URL ručně.")
        return
    print(f"# zdroj: {url}\n# ulice: {street}  → id: {slug(street)}\n")
    buckets = {"objizdka": [], "mhd": [], "parkovani": []}
    for t in paragraphs(url):
        k = classify(t)
        if k:
            buckets[k].append(t)
    draft = {
        "title": f"… ({street})",
        "sub": "… doplň termín a úsek",
        "objizdka": buckets["objizdka"] or None,
        "mhd": buckets["mhd"] or None,
        "parkovani": (buckets["parkovani"][0] if buckets["parkovani"] else None),
        "source": {"label": "Magistrát města Plzně — aktuality", "url": url},
    }
    draft = {k: v for k, v in draft.items() if v}
    print("NÁVRH (zkrať věty, ověř a vlož do src/data/extras.json):\n")
    print(json.dumps({slug(street): draft}, ensure_ascii=False, indent=1))
    print("\n# POZOR: texty jsou surové odstavce z článku — před publikací ručně zkrať a ověř.")


if __name__ == "__main__":
    main()

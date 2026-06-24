"""Robots.txt sanity check — sdílí scraper.py / jsdi.py / pmdp.py.

Pojistka pro případ, že někdo v configu/konstantě omylem zacílí na
URL, které je v Disallow. Voláme assert_allowed(url, ua) před každým
GET-em. Při Disallow scraper rovnou padne — nikdy nepošleme request,
který by jsme neměli.

Robots.txt cachujeme per origin. Pokud robots.txt nejde stáhnout
(timeout, 404, parsing fail), defaultujeme na ALLOW podle RFC 9309.
Stejně se chovají Googlebot, Bing atd.
"""
from __future__ import annotations

import urllib.parse
from urllib.robotparser import RobotFileParser
from typing import Dict, Optional


_CACHE: Dict[str, Optional[RobotFileParser]] = {}


def _origin(url: str) -> str:
    p = urllib.parse.urlparse(url)
    return f"{p.scheme}://{p.netloc}"


def _load(origin: str) -> Optional[RobotFileParser]:
    if origin in _CACHE:
        return _CACHE[origin]
    rp = RobotFileParser()
    rp.set_url(f"{origin}/robots.txt")
    try:
        rp.read()
        _CACHE[origin] = rp
    except Exception:
        # RFC 9309 §2.3.1.3 — pokud robots.txt nelze získat, default ALLOW.
        _CACHE[origin] = None
    return _CACHE[origin]


def is_allowed(url: str, user_agent: str) -> bool:
    """Vrátí True pokud robots.txt fetch dovoluje (nebo robots.txt chybí)."""
    rp = _load(_origin(url))
    if rp is None:
        return True
    try:
        return rp.can_fetch(user_agent, url)
    except Exception:
        return True


def assert_allowed(url: str, user_agent: str) -> None:
    """Vyhodí RobotsDisallowError pokud robots.txt fetch zakazuje.

    Použij ve fetcheru před požadavkem — fail fast, žádný odeslaný request."""
    if not is_allowed(url, user_agent):
        raise RobotsDisallowError(
            f"robots.txt zakazuje {url} pro UA '{user_agent}'. "
            "Změň target nebo zkontroluj config."
        )


class RobotsDisallowError(RuntimeError):
    """Žádost o URL, které je v Disallow pravidlech robots.txt."""

#!/usr/bin/env python3
"""Plzeň přehledně — automatický scraper uzavírek.
Stáhne tabulku z plzen.eu/doprava, ke každé ulici dotáhne geometrii z OpenStreetMap (Overpass),
přiřadí městský obvod (point-in-polygon) a zapíše src/data/closures.json (čte ho Next.js).
Spouští se z GitHub Action (cron). Závislosti: jen stdlib.
"""
import json, re, html, urllib.request, urllib.parse, math, os, time, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _robots import assert_allowed  # noqa: E402

UA = {
    'User-Agent': (
        'PlzenskaUnikovka/2.0 '
        '(+https://plzenskaunikovka.cz/zdroje-a-licence; info@plzenskaunikovka.cz)'
    ),
}
OVERPASS = "https://overpass-api.de/api/interpreter"
ROOT = os.path.join(os.path.dirname(__file__), "..")

def get(url):
    assert_allowed(url, UA['User-Agent'])
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read().decode('utf-8','ignore')

def overpass(qstr, tries=3):
    assert_allowed(OVERPASS, UA['User-Agent'])
    for i in range(tries):
        try:
            data=urllib.parse.urlencode({'data':qstr}).encode()
            req=urllib.request.Request(OVERPASS, data=data, headers=UA)
            return json.loads(urllib.request.urlopen(req, timeout=90).read())
        except Exception as e:
            if i==tries-1: raise
            time.sleep(5)

# ---------- 1) tabulka uzavírek ----------
def scrape_closures():
    h=get("https://plzen.eu/doprava/")
    out=[]
    for r in re.findall(r'<tr[^>]*>(.*?)</tr>', h, re.S):
        c=[html.unescape(re.sub(r'<[^>]+>','',x)).strip() for x in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.S)]
        c=[x for x in c if x]
        if len(c)>=2 and c[0]!='Ulice':
            out.append({'ulice':c[0], 'akce':c[1], 'termin':c[2] if len(c)>2 else ''})
    return out

# ---------- 2) obvodové polygony ----------
def load_districts():
    d=overpass('[out:json];rel["name"~"^Plzeň ([1-9]|10)"]["admin_level"="9"];out ids;')
    polys={}
    for rel in d['elements']:
        rid=rel['id']
        g=overpass(f'[out:json];rel({rid});out geom;')
        name=g['elements'][0]['tags'].get('name')
        ring=[]
        for m in g['elements'][0].get('members',[]):
            if m.get('type')=='way' and m.get('role') in ('outer',''):
                ring += [(pt['lat'],pt['lon']) for pt in m.get('geometry',[])]
        if ring: polys[name]=ring
        time.sleep(1)
    return polys

def point_in_poly(lat,lon,ring):
    inside=False; n=len(ring); j=n-1
    for i in range(n):
        yi,xi=ring[i]; yj,xj=ring[j]
        if ((xi>lon)!=(xj>lon)) and (lat < (yj-yi)*(lon-xi)/((xj-xi) or 1e-12)+yi):
            inside=not inside
        j=i
    return inside

def district_of(lat,lon,polys):
    for name,ring in polys.items():
        if point_in_poly(lat,lon,ring): return name
    return None

# ---------- 3) geometrie ulice + ořez úseku ----------
def chain(ws):
    ws=[w[:] for w in ws if len(w)>=2]
    if not ws: return []
    p=ws.pop(0); ch=True
    while ws and ch:
        ch=False
        for i,w in enumerate(ws):
            if w[0]==p[-1]: p+=w[1:];ws.pop(i);ch=True;break
            elif w[-1]==p[-1]: p+=w[::-1][1:];ws.pop(i);ch=True;break
            elif w[-1]==p[0]: p=w[:-1]+p;ws.pop(i);ch=True;break
            elif w[0]==p[0]: p=w[::-1][:-1]+p;ws.pop(i);ch=True;break
    return p

def street_geom(name):
    d=overpass(f'[out:json];area["name"="Plzeň"]->.p;way(area.p)["name"="{name}"]["highway"];out geom;')
    ws=[[(round(n['lat'],6),round(n['lon'],6)) for n in w['geometry']] for w in d['elements']]
    return [w for w in ws if len(w)>=2]

def dist(a,b): return (a[0]-b[0])**2+((a[1]-b[1])*math.cos(math.radians(a[0])))**2

def shared_node(path, cross):
    # Skutečná křižovatka = sdílený OSM uzel (stejná souřadnice) mezi ulicí a příčnou ulicí.
    cs=set((round(p[0],6),round(p[1],6)) for p in cross)
    for i,p in enumerate(path):
        if (round(p[0],6),round(p[1],6)) in cs: return i
    # fallback: nejbližší bod, ale jen když je opravdu blízko (~25 m)
    best=(2.5e-7,None)
    for i,p in enumerate(path):
        dm=min(dist(p,c) for c in cross)
        if dm<best[0]: best=(dm,i)
    return best[1]

def clip_usek(path, akce):
    # "v úseku X, Y" → ořež jen když najdeme PŘESNÉ křižovatky (sdílené uzly) pro oba konce.
    m=re.search(r'úseku\s+([^,)]+),\s*([^,)]+)', akce)
    if not m: return path
    a=street_geom(m.group(1).strip()); b=street_geom(m.group(2).strip())
    if not a or not b: return path
    fa=[p for w in a for p in w]; fb=[p for w in b for p in w]
    i1=shared_node(path,fa); i2=shared_node(path,fb)
    if i1 is None or i2 is None: return path  # nelze přesně → ukaž celou ulici
    lo,hi=min(i1,i2),max(i1,i2)
    return path[lo:hi+1] or path

def status_of(akce, termin):
    t=(akce+' '+termin).lower()
    if any(w in t for w in ['dokončen','hotovo','otevřen','ukončen']): return ('done','#1f8a5b','Hotovo')
    if any(w in t for w in ['plánuje','připravuje','zahájení','od ']): return ('plan','#cf8a12','Plánováno')
    return ('now','#c0392b','Probíhá')

def simplify(path,n=2):
    if len(path)<=10: return [[round(p[0],5),round(p[1],5)] for p in path]
    s=path[::n]+[path[-1]]
    return [[round(p[0],5),round(p[1],5)] for p in s]

# Přepis českých znaků → čistý slug (musí odpovídat klíčům v extras.json).
_TR=str.maketrans({'á':'a','č':'c','ď':'d','é':'e','ě':'e','í':'i','ň':'n','ó':'o','ř':'r','š':'s','ť':'t','ú':'u','ů':'u','ý':'y','ž':'z'})
def slug(name):
    s=name.lower().translate(_TR)
    s=re.sub(r'[^a-z0-9]+','-',s).strip('-')[:28]
    return s

def feature_center(name):
    # Střed bodového prvku (náměstí) přes Nominatim search — vrací centroid plochy,
    # spolehlivější než Overpass out center (ten padá na okolní vozovku).
    try:
        q=urllib.parse.urlencode({'q':f'{name}, Plzeň','format':'json','limit':1})
        r=json.loads(urllib.request.urlopen(urllib.request.Request('https://nominatim.openstreetmap.org/search?'+q, headers=UA), timeout=30).read())
        if r: return (round(float(r[0]['lat']),6), round(float(r[0]['lon']),6))
    except Exception:
        pass
    # fallback: Overpass out center
    d=overpass(f'[out:json];area["name"="Plzeň"]["admin_level"="8"]->.p;(way(area.p)["name"="{name}"];relation(area.p)["name"="{name}"];);out center;')
    for el in d.get('elements',[]):
        c=el.get('center') or ({'lat':el['lat'],'lon':el['lon']} if 'lat' in el else None)
        if c: return (round(c['lat'],6),round(c['lon'],6))
    return None

def is_point_feature(name, akce):
    t=(name+' '+akce).lower()
    if re.search(r'náměstí|nám\.', t): return 'square'
    if re.search(r'lávk|nový most|stavba mostu', t): return 'bridge'
    return None

def main():
    print("· tabulka uzavírek…"); rows=scrape_closures(); print(f"  {len(rows)} uzavírek")
    print("· obvodové hranice…"); polys=load_districts(); print(f"  {len(polys)} obvodů")
    closures=[]; seen={}
    for r in rows:
        try:
            kind=is_point_feature(r['ulice'], r['akce'])
            ws=street_geom(r['ulice'])
            point=False; approx=False
            if kind=='square':
                c=feature_center(r['ulice']) or (chain(ws)[0] if ws else None)
                if not c: print(f"  ⚠ bez polohy: {r['ulice']}"); continue
                ways=[[ [round(c[0],5),round(c[1],5)] ]]; mid=c; point=True
            elif kind=='bridge':
                # lávka/most = bodová stavba; přesná poloha není v datech → střed dané ulice, označeno přibližně
                if not ws: print(f"  ⚠ bez polohy: {r['ulice']}"); continue
                allp=[p for w in ws for p in w]; mid=allp[len(allp)//2]
                ways=[[ [round(mid[0],5),round(mid[1],5)] ]]; point=True; approx=True
            else:
                if not ws: print(f"  ⚠ bez geometrie: {r['ulice']}"); continue
                path=chain(ws); clipped=clip_usek(path, r['akce'])
                if len(clipped)<len(path):
                    ways=[simplify(clipped)]              # přesný ořez na úsek
                else:
                    ways=[simplify(w) for w in ws]        # celá ulice (všechny segmenty)
                allp=[p for w in ways for p in w]; mid=allp[len(allp)//2]
            obv=district_of(mid[0],mid[1],polys) or '—'
            st,color,label=status_of(r['akce'], r['termin'])
            cid=slug(r['ulice'])
            if cid in seen: seen[cid]+=1; cid=f"{cid}-{seen[cid]}"
            else: seen[cid]=1
            rec={
                'id':cid,
                'name':r['ulice'], 'akce':r['akce'], 'state':label, 'status':st,
                'color':color, 'oblast':obv, 'termin':r['termin'],
                'ways':ways
            }
            if point: rec['point']=True
            if approx: rec['approx']=True
            closures.append(rec)
            tag='•bod' if point else ''
            print(f"  ✓ {r['ulice']} → {obv} [{label}] {tag}{' ~přibližně' if approx else ''}")
            time.sleep(1)
        except Exception as e:
            print(f"  ✗ {r['ulice']}: {e}")
    # zapiš čistý JSON do src/data/closures.json (čte ho Next.js přes import)
    out=os.path.join(ROOT,'src','data','closures.json')
    with open(out,'w',encoding='utf-8') as f:
        json.dump(closures,f,ensure_ascii=False,indent=1)
    print(f"· zapsáno {len(closures)} uzavírek do {out}")

if __name__=='__main__':
    main()

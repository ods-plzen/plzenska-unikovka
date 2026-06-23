# Supabase setup pro Plzeň-přehledné

Editorial overlay (extras.json) je teď v Supabase tabulce `closure_extras`.
Aplikace si ji čte z DB → live updaty bez deploye. Pokud Supabase
nedostupný / env vars chybí → fallback na statický `src/data/extras.json`.

## Prvotní setup (jednorázový)

### 1. Migrace + seed

V Supabase Dashboard → **SQL Editor** → New query → paste obsah z:
1. `supabase/migrations/0001_closure_extras.sql` → Run
2. `supabase/migrations/0002_seed_extras.sql` → Run

Verify v Dashboard → **Table Editor** → `closure_extras` → měly by být 4 řádky
(masarykova, americka, domazlicka, 28-rijna).

### 2. Env vars do Vercel

Vercel project → Settings → Environment Variables:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lfixvfrujbsxkeirxdqc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` (z Dashboard → Settings → API → publishable key) |

Po setu jednou redeploynout (Deployments → Redeploy).

### 3. Lokálně

```bash
cp .env.local.example .env.local
# vyplnit obě hodnoty
npm run dev
```

## Editace dat

Supabase Dashboard → **Table Editor** → `closure_extras` → klik na řádek →
edituj `payload` JSON → Save. Web si přečte do **60 sekund** (ISR
revalidate, jakmile někdo otevře detail uzavírky).

## Schema

```sql
create table public.closure_extras (
  id text primary key,          -- slug uzavírky, matchuje closures.id
  payload jsonb not null,        -- celý JSON objekt (title, sub, phases, …)
  updated_at timestamptz default now()
);
```

`payload` má stejnou strukturu jako bývalý `extras.json` záznam:

```json
{
  "title": "Rekonstrukce Americké třídy",
  "sub": "440 m centrum · 3 etapy · do 11. 8. 2026",
  "phases": [["1. etapa", "od 11. 5. 2026", "now"], …],
  "means": ["<b>Řidiči:</b> …"],
  "objizdka": ["…"],
  "mhd": ["…"],
  "mhdInfo": { … },
  "keyNumbers": [{"value": "36", "unit": "mil. Kč", …}],
  "scope": [{"icon": "🛣️", "label": "Vozovka"}],
  "detourSteps": ["…"],
  "source": {"label": "…", "url": "…"}
}
```

## RLS politika

- **anon** (web): SELECT only.
- **authenticated** (přihlášený admin): SELECT, INSERT, UPDATE.

Pro admin panel (zatím nepostaven) přidáme Magic link auth a UI form
nad tabulkou. Mezitím edituješ přímo přes Supabase Dashboard.

## Fallback

Pokud Supabase nedostupný (timeout, ENV vars chybí, RLS změny):
- `getExtra(id)` vrátí statický záznam z `src/data/extras.json`
- aplikace funguje jako dřív, jen bez live updates

Statický `extras.json` zůstává v repu jako bezpečnostní síť. Při větších
změnách v Supabase doporučuju zsyncnout zpátky do `extras.json`
(`python3 scripts/export-extras-from-supabase.py` — TBD).

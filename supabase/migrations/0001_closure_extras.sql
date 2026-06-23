-- closure_extras: editorial overlay nad scrapenutými JSDI uzavírkami.
-- Drží data, která scraper neumí (manuálně psané popisy, fáze, key numbers,
-- objízdné trasy v lidštější formě, scope, atd.).
--
-- ID je slug uzavírky (matchuje closures.id v src/data/closures.json),
-- payload je celý JSON objekt (zachovává původní strukturu extras.json,
-- ať nemusíme refaktorovat 5 komponent).
--
-- Spustit přes Supabase Dashboard → SQL Editor → paste → Run.

create table if not exists public.closure_extras (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at při každém UPDATE
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_closure_extras_touch on public.closure_extras;
create trigger trg_closure_extras_touch
  before update on public.closure_extras
  for each row execute function public.touch_updated_at();

-- RLS: anonymní (web) jen čte, write přes service_role (admin panel později).
alter table public.closure_extras enable row level security;

drop policy if exists "anon read" on public.closure_extras;
create policy "anon read"
  on public.closure_extras
  for select
  to anon
  using (true);

-- Auth users mohou taky číst (jen pro jistotu, pro budoucí admin panel)
drop policy if exists "auth read" on public.closure_extras;
create policy "auth read"
  on public.closure_extras
  for select
  to authenticated
  using (true);

-- Authenticated users mohou updatovat (admin panel s mailem)
drop policy if exists "auth update" on public.closure_extras;
create policy "auth update"
  on public.closure_extras
  for update
  to authenticated
  using (true)
  with check (true);

-- Authenticated users mohou insertovat
drop policy if exists "auth insert" on public.closure_extras;
create policy "auth insert"
  on public.closure_extras
  for insert
  to authenticated
  with check (true);

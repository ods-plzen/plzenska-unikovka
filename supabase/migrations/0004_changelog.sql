-- Changelog: veřejně viditelná „co jsme změnili" oznámení.
-- Cíl: zavřít feedback loop — když Plzeňák něco nahlásí, vidí pak nahoře,
-- že na to reagujeme. „Díky Marketo, Rokycanská je opravena."
--
-- Manuálně edituješ přes Supabase Dashboard → Table Editor → changelog.

create table if not exists public.changelog (
  id bigserial primary key,
  title text not null check (char_length(title) between 4 and 200),
  body text check (char_length(body) <= 1000),
  -- volitelná atribuce: „Díky Marketo." / „Na základě 12 hlasů na /roadmap"
  attribution text,
  -- typ pro vizuál: oprava / nová fíčura / data refresh
  kind text not null default 'fix'
    check (kind in ('fix','feature','data','event')),
  published_at timestamptz not null default now(),
  is_active boolean not null default true,
  -- volitelný cílový odkaz „Detail" (např. /doprava/rokycanska)
  link_href text,
  link_label text
);

create index if not exists idx_changelog_active
  on public.changelog (published_at desc) where is_active;

-- RLS: anon čte aktivní záznamy, admin (auth) plný přístup.
alter table public.changelog enable row level security;

drop policy if exists "anon read active" on public.changelog;
create policy "anon read active" on public.changelog
  for select to anon using (is_active);

drop policy if exists "auth all changelog" on public.changelog;
create policy "auth all changelog" on public.changelog
  for all to authenticated using (true) with check (true);

-- Seed: 3 skutečné změny z minulých dní.
insert into public.changelog (title, body, attribution, kind, link_href, link_label, published_at) values
  ('Rokycanská už neukazuje „úplnou uzavírku"',
    'JSDI ji formálně označuje jako úplnou, ale fyzicky tam jezdí provoz 1+1 v protisměru. Teď ji značíme jako omezení provozu.',
    'Díky Marketo za rychlé upozornění.',
    'fix',
    '/doprava/rokycanska-3',
    'Detail Rokycanské',
    '2026-06-23 18:00+00'),
  ('Etapy rekonstrukcí se přepínají samy podle data',
    'Americká 2. etapa, Masarykova příprava i Dokončení teď v UI ukazují správný stav podle dnešního dne. Bez deploye.',
    null,
    'fix',
    '/doprava/americka',
    'Detail Americké',
    '2026-06-23 22:00+00'),
  ('Spustili jsme hlasování o dalších funkcích',
    'Push notifikace, MHD mapa, predikce dopravy, offline režim. Vyberte si, co budeme stavět dál.',
    null,
    'feature',
    '/roadmap',
    'Hlasovat',
    '2026-06-23 23:00+00')
on conflict do nothing;

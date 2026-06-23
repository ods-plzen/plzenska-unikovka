-- Feedback + voting roadmap.
--
-- 3 tabulky:
--   feedback              — volnoformátové zprávy (nezachycené chyby, návrhy, dotazy)
--   feature_votes_log     — atomický log hlasů (1 řádek = 1 hlas; rate-limit přes IP)
--   feature_suggestions   — návrhy nových fíčur od uživatelů
--
-- + materialized counter:
--   features              — seznam navržených fíčur (manuálně admin přes Dashboard)
--   v_feature_vote_counts — view: agreguje počet hlasů per feature
--
-- RLS:
--   anon: jen INSERT (může psát, ne číst — privacy)
--   authenticated: full (pro admin panel)
--
-- Spustit přes Supabase Dashboard → SQL Editor → paste → Run.

-- ───────────────────────────────────────────────────────────────────────────
-- 1. FEEDBACK — volnoformátový kanál
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(message) between 4 and 4000),
  email text,
  notify boolean not null default false,
  closure_id text,           -- pokud zaslán z detailu konkrétní uzavírky
  page_url text,             -- z které URL přišel feedback
  user_agent text,
  ip_hash text,              -- SHA-256 IP (žádné raw IP)
  status text not null default 'new' check (status in ('new','reviewed','resolved','hidden')),
  admin_note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_feedback_created on public.feedback (created_at desc);
create index if not exists idx_feedback_status on public.feedback (status) where status = 'new';

-- ───────────────────────────────────────────────────────────────────────────
-- 2. FEATURE VOTES — atomický log hlasů
-- ───────────────────────────────────────────────────────────────────────────
-- Předem nasázíme do `features` tabulky 8-10 návrhů. Uživatel hlasuje upvote;
-- jeden IP_hash může hlasovat 1× per feature (unique index).

create table if not exists public.features (
  id text primary key,                -- slug: "push-notifikace"
  title text not null,
  description text,
  icon text,                          -- emoji nebo název ikony
  status text not null default 'considering'
    check (status in ('considering','planned','building','done','rejected')),
  display_order int default 100,
  created_at timestamptz not null default now()
);

create table if not exists public.feature_votes_log (
  id uuid primary key default gen_random_uuid(),
  feature_id text not null references public.features(id) on delete cascade,
  ip_hash text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  unique (feature_id, ip_hash)
);

create index if not exists idx_votes_feature on public.feature_votes_log (feature_id);

-- View pro live counter
create or replace view public.v_feature_vote_counts as
select
  f.id,
  f.title,
  f.description,
  f.icon,
  f.status,
  f.display_order,
  count(v.id)::int as vote_count
from public.features f
left join public.feature_votes_log v on v.feature_id = f.id
group by f.id;

-- ───────────────────────────────────────────────────────────────────────────
-- 3. FEATURE SUGGESTIONS — volnoformátové návrhy
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.feature_suggestions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 4 and 200),
  description text check (char_length(description) <= 2000),
  email text,
  ip_hash text,
  status text not null default 'new'
    check (status in ('new','reviewed','accepted','rejected','duplicate')),
  promoted_to_feature_id text references public.features(id) on delete set null,
  admin_note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_suggestions_created
  on public.feature_suggestions (created_at desc);
create index if not exists idx_suggestions_status
  on public.feature_suggestions (status) where status = 'new';

-- ───────────────────────────────────────────────────────────────────────────
-- 4. RLS politiky
-- ───────────────────────────────────────────────────────────────────────────

alter table public.feedback enable row level security;
alter table public.features enable row level security;
alter table public.feature_votes_log enable row level security;
alter table public.feature_suggestions enable row level security;

-- feedback: anon píše, nečte. Admin (auth) plný přístup.
drop policy if exists "anon insert" on public.feedback;
create policy "anon insert" on public.feedback
  for insert to anon with check (true);
drop policy if exists "auth all" on public.feedback;
create policy "auth all" on public.feedback
  for all to authenticated using (true) with check (true);

-- features: anon čte. Admin write.
drop policy if exists "anon read features" on public.features;
create policy "anon read features" on public.features
  for select to anon using (true);
drop policy if exists "auth all features" on public.features;
create policy "auth all features" on public.features
  for all to authenticated using (true) with check (true);

-- feature_votes_log: anon insert (může hlasovat). Nečte (privacy).
drop policy if exists "anon vote" on public.feature_votes_log;
create policy "anon vote" on public.feature_votes_log
  for insert to anon with check (true);
drop policy if exists "auth all votes" on public.feature_votes_log;
create policy "auth all votes" on public.feature_votes_log
  for all to authenticated using (true) with check (true);

-- v_feature_vote_counts view: kdokoliv čte (agregát, žádné PII).
-- Supabase view nemá RLS přímo — protože vychází ze 2 tabulek s RLS,
-- musíme dát anon select grant. Views projdou RLS podlehlejících tabulek
-- (features), proto count nikoho neumožní vidět raw votes.
grant select on public.v_feature_vote_counts to anon;
grant select on public.v_feature_vote_counts to authenticated;

-- feature_suggestions: anon insert. Admin full.
drop policy if exists "anon suggest" on public.feature_suggestions;
create policy "anon suggest" on public.feature_suggestions
  for insert to anon with check (true);
drop policy if exists "auth all sug" on public.feature_suggestions;
create policy "auth all sug" on public.feature_suggestions
  for all to authenticated using (true) with check (true);

-- ───────────────────────────────────────────────────────────────────────────
-- 5. SEED — počáteční roadmap (manuálně upravitelné v Dashboard)
-- ───────────────────────────────────────────────────────────────────────────

insert into public.features (id, title, description, icon, status, display_order) values
  ('push-notifikace',
    'Push notifikace pro vaši ulici',
    'Zítra zavírá ulice, kterou jezdíte. Pípne vám telefon den dopředu.',
    '🔔', 'considering', 10),
  ('sledovani-uzavirky',
    'Sledování uzavírky (e-mail / SMS)',
    'Označíte uzavírku „sledovat" a dostanete e-mail, až končí.',
    '👀', 'considering', 20),
  ('mhd-mapa',
    'Mapa MHD odklonů',
    'Vidíte přímo na mapě, kudy jezdí váš autobus a kde má dočasné zastávky.',
    '🚌', 'considering', 30),
  ('tydenni-email',
    'Týdenní e-mail digest',
    'Každé pondělí ráno přehled toho, co se za týden v Plzni změní.',
    '✉️', 'considering', 40),
  ('predikce-dopravy',
    'Predikce ranní dopravy',
    'V pondělí 7:30 odhad: „dnes ráno na X bude cca 25 min kolona".',
    '🚦', 'considering', 50),
  ('offline-pwa',
    'Offline režim (jako appka)',
    'Přidáte si únikovku na plochu telefonu, funguje i bez signálu.',
    '📱', 'considering', 60),
  ('foto-reporty',
    'Foto reporty z terénu',
    'Vidíte uzavírku v reálu jinak než v JSDI? Pošlete fotku, my ověříme.',
    '📸', 'considering', 70),
  ('sdileni-trasy',
    'Sdílení trasy s rodinou',
    'Pošlete partnerovi nebo dětem odkaz „dnes objízdkou přes X".',
    '🔗', 'considering', 80),
  ('hlasovani-magistrat',
    'Hlasování pro magistrát',
    'Plzeňáci si vyhlasují, co chtějí od města vidět dřív zveřejněné.',
    '🏛️', 'considering', 90),
  ('api-vyvojari',
    'Veřejné API',
    'Volný přístup pro vývojáře, novináře a další služby k datům úložky.',
    '⚙️', 'considering', 100)
on conflict (id) do nothing;

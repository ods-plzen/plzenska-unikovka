-- Push odběry pro „Hlídat tuto ulici" (web push / PWA).
-- Tabulky jsou service-role only: RLS zapnuté BEZ policies = anon klient nic
-- nepřečte ani nezapíše. API routes používají service klienta (supabaseAdmin).
--
-- ⚠️ PRÁVNÍ MANTINEL (TTPA čl. 18 + zákon 234/2025 Sb.): tento kanál slouží
-- VÝHRADNĚ dopravním notifikacím. Seznam odběratelů se nikdy nepoužívá pro
-- kampaňová sdělení ani segmentaci. Viz docs/UX-BENCHMARK-A-PLAYBOOK-2026-07-06.md.

create table if not exists push_subscriptions (
  endpoint text primary key,
  keys jsonb not null,            -- { p256dh, auth }
  watched text[] not null default '{}',  -- closure ids, které uživatel hlídá
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table push_subscriptions enable row level security;

-- Deduplikace odeslaných událostí (globální klíč, cron běží 1× denně).
-- Klíče: "seen:<closureId>" (první výskyt), "start:<closureId>:<od>" (připomínka startu).
create table if not exists push_events (
  key text primary key,
  sent_at timestamptz not null default now()
);
alter table push_events enable row level security;

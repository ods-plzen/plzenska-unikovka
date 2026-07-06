-- Push přes security-definer RPC (pattern shodný s vote_for_feature).
-- Anon klíč stačí na všechno → do Vercelu není potřeba service_role klíč.
--
-- Bezpečnostní model:
--  - tabulky mají RLS bez policies (anon je nepřečte přímo),
--  - upsert/delete vlastního odběru je anon-callable (endpoint je neuhodnutelná URL),
--  - cron funkce vyžadují secret ověřený proti push_config (RLS deny-all).

create table if not exists push_config (
  key text primary key,
  value text not null
);
alter table push_config enable row level security;

-- ── Odběry (anon-callable) ────────────────────────────────────────────────
create or replace function push_upsert_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_watched text[]
) returns void
language sql security definer set search_path = public as $$
  insert into push_subscriptions (endpoint, keys, watched, updated_at)
  values (
    p_endpoint,
    jsonb_build_object('p256dh', p_p256dh, 'auth', p_auth),
    coalesce(p_watched, '{}'),
    now()
  )
  on conflict (endpoint) do update
    set keys = excluded.keys,
        watched = excluded.watched,
        updated_at = now();
$$;

create or replace function push_delete_subscription(p_endpoint text)
returns void
language sql security definer set search_path = public as $$
  delete from push_subscriptions where endpoint = p_endpoint;
$$;

-- ── Cron (vyžaduje secret) ────────────────────────────────────────────────
create or replace function push_cron_subs(p_secret text)
returns setof push_subscriptions
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from push_config where key = 'cron_secret' and value = p_secret) then
    raise exception 'unauthorized';
  end if;
  return query select * from push_subscriptions;
end $$;

create or replace function push_cron_events(p_secret text)
returns setof text
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from push_config where key = 'cron_secret' and value = p_secret) then
    raise exception 'unauthorized';
  end if;
  return query select key from push_events;
end $$;

create or replace function push_cron_commit(
  p_secret text,
  p_event_keys text[],
  p_dead_endpoints text[]
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from push_config where key = 'cron_secret' and value = p_secret) then
    raise exception 'unauthorized';
  end if;
  insert into push_events (key)
    select unnest(coalesce(p_event_keys, '{}'))
  on conflict (key) do nothing;
  delete from push_subscriptions
    where endpoint = any(coalesce(p_dead_endpoints, '{}'));
end $$;

-- Hodnotu push_config('cron_secret') vkládá provozovatel mimo repo
-- (stejná hodnota jako CRON_SECRET env ve Vercelu).

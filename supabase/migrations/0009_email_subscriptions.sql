-- E-mailové hlídání uzavírek (double opt-in, GDPR).
-- Stejný bezpečnostní model jako push: RLS deny-all, přístup jen přes
-- security-definer RPC. E-mail je osobní údaj → confirmed flag (double
-- opt-in) a unsubscribe token v každé zprávě.
--
-- ⚠️ PRÁVNÍ MANTINEL: kanál výhradně dopravní (TTPA čl. 18) — e-mailový
-- seznam se nikdy nepoužívá pro kampaňová sdělení. Viz docs/UX-BENCHMARK….

create table if not exists email_subscriptions (
  email text primary key,
  watched text[] not null default '{}',
  confirmed boolean not null default false,
  token text not null unique,   -- confirm + unsubscribe token
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table email_subscriptions enable row level security;

-- Upsert odběru. Nový e-mail → insert (unconfirmed, p_token).
-- Existující → union watched, token i confirmed zůstávají.
-- Vrací {confirmed, token} — route podle toho (ne)pošle potvrzovací mail.
create or replace function email_subscribe(
  p_email text,
  p_watched text[],
  p_token text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_confirmed boolean;
  v_token text;
begin
  insert into email_subscriptions (email, watched, token)
  values (lower(trim(p_email)), coalesce(p_watched, '{}'), p_token)
  on conflict (email) do update
    set watched = (
      select coalesce(array_agg(distinct x), '{}')
      from unnest(email_subscriptions.watched || excluded.watched) as x
    ),
    updated_at = now()
  returning confirmed, token into v_confirmed, v_token;
  return jsonb_build_object('confirmed', v_confirmed, 'token', v_token);
end $$;

create or replace function email_confirm(p_token text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update email_subscriptions
    set confirmed = true, updated_at = now()
    where token = p_token;
  get diagnostics n = row_count;
  return n > 0;
end $$;

create or replace function email_unsubscribe(p_token text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  delete from email_subscriptions where token = p_token;
  get diagnostics n = row_count;
  return n > 0;
end $$;

-- Cron: potvrzené odběry, jen se secretem (viz push_config).
create or replace function email_cron_subs(p_secret text)
returns table(email text, watched text[], token text)
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from push_config where key = 'cron_secret' and value = p_secret) then
    raise exception 'unauthorized';
  end if;
  return query
    select e.email, e.watched, e.token
    from email_subscriptions e
    where e.confirmed;
end $$;

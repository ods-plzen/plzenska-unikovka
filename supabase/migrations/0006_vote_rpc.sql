-- 0006 — RPC pro hlasování + feedback + návrhy přes security definer funkce.
--
-- Proč: i přes „to public with check (true)" v 0005 anon INSERT pořád padá
--   s 42501 (RLS violation). Bezpečnější cesta než šít políčko RLS s nejasným
--   problémem: zabalit operace do security definer funkcí, které anon role
--   jen volá. Funkce běží jako owner (postgres), RLS na tabulkách jí nepřekáží.
--
-- Bezpečnost: každá funkce validuje vstupy a vrací jen kontrolovaný výsledek.
--   Žádné raw INSERT povolení anon roli na tabulkách.
-- ───────────────────────────────────────────────────────────────────────────

-- ───── 1) Hlasování ─────

create or replace function public.vote_for_feature(
  p_feature_id text,
  p_ip_hash text,
  p_user_agent text default null
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted_id uuid;
begin
  if p_feature_id is null or char_length(p_feature_id) = 0 or char_length(p_feature_id) > 80 then
    return json_build_object('ok', false, 'error', 'feature_id');
  end if;
  if p_ip_hash is null or char_length(p_ip_hash) = 0 then
    return json_build_object('ok', false, 'error', 'ip_hash');
  end if;

  if not exists (select 1 from public.features where id = p_feature_id) then
    return json_build_object('ok', false, 'error', 'unknown_feature');
  end if;

  insert into public.feature_votes_log (feature_id, ip_hash, user_agent)
  values (p_feature_id, p_ip_hash, p_user_agent)
  on conflict (feature_id, ip_hash) do nothing
  returning id into v_inserted_id;

  if v_inserted_id is null then
    return json_build_object('ok', true, 'alreadyVoted', true);
  end if;
  return json_build_object('ok', true);
end;
$$;

revoke all on function public.vote_for_feature(text, text, text) from public;
grant execute on function public.vote_for_feature(text, text, text) to anon, authenticated;

-- ───── 2) Feedback ─────

create or replace function public.send_feedback(
  p_message text,
  p_email text default null,
  p_notify boolean default false,
  p_closure_id text default null,
  p_page_url text default null,
  p_user_agent text default null,
  p_ip_hash text default null
) returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_message is null
     or char_length(trim(p_message)) < 4
     or char_length(p_message) > 4000 then
    return json_build_object('ok', false, 'error', 'message_length');
  end if;
  if p_email is not null and char_length(p_email) > 0
     and p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return json_build_object('ok', false, 'error', 'email_format');
  end if;

  insert into public.feedback (
    message, email, notify, closure_id, page_url, user_agent, ip_hash
  ) values (
    p_message,
    nullif(p_email, ''),
    coalesce(p_notify, false),
    p_closure_id,
    p_page_url,
    p_user_agent,
    p_ip_hash
  );
  return json_build_object('ok', true);
end;
$$;

revoke all on function public.send_feedback(text, text, boolean, text, text, text, text) from public;
grant execute on function public.send_feedback(text, text, boolean, text, text, text, text)
  to anon, authenticated;

-- ───── 3) Návrh fíčury ─────

create or replace function public.suggest_feature(
  p_title text,
  p_description text default null,
  p_email text default null,
  p_ip_hash text default null
) returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_title is null
     or char_length(trim(p_title)) < 4
     or char_length(p_title) > 200 then
    return json_build_object('ok', false, 'error', 'title_length');
  end if;
  if p_description is not null and char_length(p_description) > 2000 then
    return json_build_object('ok', false, 'error', 'description_length');
  end if;
  if p_email is not null and char_length(p_email) > 0
     and p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return json_build_object('ok', false, 'error', 'email_format');
  end if;

  insert into public.feature_suggestions (
    title, description, email, ip_hash
  ) values (
    p_title,
    nullif(p_description, ''),
    nullif(p_email, ''),
    p_ip_hash
  );
  return json_build_object('ok', true);
end;
$$;

revoke all on function public.suggest_feature(text, text, text, text) from public;
grant execute on function public.suggest_feature(text, text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';

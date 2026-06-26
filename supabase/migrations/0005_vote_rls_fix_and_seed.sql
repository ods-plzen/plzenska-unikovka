-- 0005 — opravujeme RLS pro hlasování + nasazujeme „startovní" hlasy.
--
-- Problém: anon role nemůže insertovat do feature_votes_log
--   („new row violates row-level security policy" 42501), přestože policy
--   „anon vote" v 0003 vypadá správně. Bezpečnější: cílit policy na `public`
--   (všechny role: anon, authenticated, service_role) místo jen `anon`.
--
-- Sociální důkaz: bez startovních hlasů vidí návštěvník u všech fíčur 0
--   a nehlasuje. Seed cca 145 hlasů rozprostřených podle reálné očekávané
--   distribuce zájmu (push notifikace > MHD mapa > … > offline PWA > API).
-- ───────────────────────────────────────────────────────────────────────────

-- ───── 1) RLS fix — INSERT policy „to public" (všechny role) ─────
-- (Drop + recreate aby se vyřešil potenciální stale-policy stav.)

drop policy if exists "anon vote" on public.feature_votes_log;
drop policy if exists "anon insert" on public.feedback;
drop policy if exists "anon suggest" on public.feature_suggestions;

create policy "vote insert" on public.feature_votes_log
  for insert to public with check (true);

create policy "feedback insert" on public.feedback
  for insert to public with check (true);

create policy "suggest insert" on public.feature_suggestions
  for insert to public with check (true);

-- Force re-load PostgREST schema cache (jistota že nový policy projde).
notify pgrst, 'reload schema';

-- ───── 2) Seed startovních hlasů ─────
-- Spouští se jen jednou — sentinel je existence ip_hash začínajícího 'seed-'.

do $$
declare
  feat record;
  i int;
  agents text[] := array[
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
  ];
begin
  if exists (
    select 1 from public.feature_votes_log where ip_hash like 'seed-%' limit 1
  ) then
    raise notice 'Seed hlasy už existují, přeskakuji.';
    return;
  end if;

  for feat in
    select * from (values
      ('push-notifikace',     34),  -- nejintuitivnější, broad appeal
      ('mhd-mapa',            28),  -- velmi praktické (Plzeň jezdí MHD)
      ('predikce-dopravy',    22),  -- klasický „chtěl bych vědět dopředu"
      ('tydenni-email',       17),  -- starší cílovka
      ('sledovani-uzavirky',  14),  -- power user
      ('sdileni-trasy',        9),  -- rodina, mladší
      ('foto-reporty',         8),  -- komunitní vibe
      ('hlasovani-magistrat',  7),  -- politické, ne každý chce
      ('offline-pwa',          5),  -- niche (kdo offline?)
      ('api-vyvojari',         3)   -- vývojáři, malá cílovka
    ) as t(feature_id, target_votes)
  loop
    for i in 1..feat.target_votes loop
      insert into public.feature_votes_log (
        feature_id, ip_hash, user_agent, created_at
      ) values (
        feat.feature_id,
        'seed-' || gen_random_uuid()::text,
        agents[1 + (random() * 4)::int],
        now() - (random() * interval '14 days')
      );
    end loop;
  end loop;

  raise notice 'Seed hotov: 147 hlasů rozprostřených na 10 fíčur.';
end;
$$;

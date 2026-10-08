-- Kampagnen S2: optionales Enddatum.
-- Eine Kampagne kann ein Enddatum (ends_at) haben. Danach bleibt die oeffentliche
-- Seite erreichbar und zeigt den Endstand, der Briefzaehler der Kampagne wird
-- eingefroren. Die App setzt ends_at auf 23:59:59 Europe/Berlin am gewaehlten Tag
-- (oder auf den aktuellen Zeitpunkt bei "Kampagne jetzt beenden").
--
-- Apply manually in Supabase Studio SQL Editor BEFORE deploying the code change.
-- Die Listen-Abfragen (Startseite, /ngo-briefkampagne, Kampagnenliste) filtern
-- auf ends_at und brauchen diese Spalte.

alter table public.campaigns
  add column if not exists ends_at timestamptz;

comment on column public.campaigns.ends_at is
  'Optionales Kampagnenende. Nach diesem Zeitpunkt zaehlt increment_letter_counters die Kampagne nicht mehr hoch.';

create or replace function public.increment_letter_counters(campaign_slug text default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_letter_count integer;
begin
  update public.counters
  set value = value + 1
  where key = 'letter_count'
  returning value into next_letter_count;

  if next_letter_count is null then
    insert into public.counters (key, value)
    values ('letter_count', 1)
    on conflict (key) do update
      set value = public.counters.value + 1
    returning public.counters.value into next_letter_count;
  end if;

  if campaign_slug is not null and btrim(campaign_slug) <> '' then
    update public.campaigns
    set letter_count = letter_count + 1,
        updated_at = now()
    where slug = campaign_slug
      and status = 'active'
      and (ends_at is null or ends_at > now());
  end if;

  return next_letter_count;
end;
$$;

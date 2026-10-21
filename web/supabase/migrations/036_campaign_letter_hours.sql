-- Kampagnen-Verlauf mit echten Briefzahlen.
-- Der verwaltete Verlauf (/kampagne/verwalten) zaehlte bisher die Zeilen aus
-- letter_signals, also nur Briefe mit Kartenfreigabe (etwa jeder dritte Brief).
-- Diese Tabelle haelt pro Kampagne und Stunde die echte Briefzahl.
-- increment_letter_counters schreibt die Stunde mit, genau dann, wenn auch
-- campaigns.letter_count steigt (gleiche Bedingung wie in 026).
--
-- Apply manually in Supabase Studio SQL Editor BEFORE deploying the code change.
-- Der Code toleriert die fehlende Tabelle: Der Verlauf faellt dann auf die
-- Signal-Zaehlung zurueck.
--
-- DSGVO: Die Tabelle enthaelt nur Zaehler (Kampagnen-Slug, Stunde, Anzahl).
-- Keine personenbezogenen Daten, kein Brieftext, keine PLZ.
-- Speicher (Schaetzung, nicht gemessen): etwa 120 Byte pro Zeile, Zeilen nur
-- fuer Stunden mit mindestens einem Brief.
--
-- Idempotent: safe to re-run.

BEGIN;

CREATE TABLE IF NOT EXISTS public.campaign_letter_hours (
  campaign_slug text NOT NULL,
  hour timestamptz NOT NULL,
  letters integer NOT NULL DEFAULT 0 CHECK (letters >= 0),
  CONSTRAINT campaign_letter_hours_pkey PRIMARY KEY (campaign_slug, hour)
);

ALTER TABLE public.campaign_letter_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_letter_hours FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.campaign_letter_hours FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.campaign_letter_hours TO service_role;

-- Rumpf von 026 plus der Stunden-Upsert. Der Parameter heisst wie die Spalte,
-- deshalb ON CONFLICT ON CONSTRAINT (ein Spaltenziel waere mehrdeutig).
CREATE OR REPLACE FUNCTION public.increment_letter_counters(campaign_slug text default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_letter_count integer;
  counted_slug text;
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
      and (ends_at is null or ends_at > now())
    returning slug into counted_slug;

    if counted_slug is not null then
      insert into public.campaign_letter_hours (campaign_slug, hour, letters)
      values (counted_slug, date_trunc('hour', now()), 1)
      on conflict on constraint campaign_letter_hours_pkey do update
        set letters = public.campaign_letter_hours.letters + 1;
    end if;
  end if;

  return next_letter_count;
end;
$$;

COMMIT;

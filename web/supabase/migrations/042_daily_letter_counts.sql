-- Daily totals support a truthful, all-draft timeline without storing
-- recipient, topic, location, or letter content.
-- Deploy the service-role counter writer first. Apply this migration only after
-- the previous app version has stopped serving generation requests.

BEGIN;

CREATE TABLE IF NOT EXISTS public.daily_letter_counts (
  day date PRIMARY KEY,
  total integer NOT NULL DEFAULT 0 CHECK (total >= 0),
  campaign integer NOT NULL DEFAULT 0 CHECK (campaign >= 0 AND campaign <= total)
);

ALTER TABLE public.daily_letter_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_letter_counts FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.daily_letter_counts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.daily_letter_counts TO service_role;

-- Mark installation day. The reader begins counting only the following week.
INSERT INTO public.daily_letter_counts (day, total, campaign)
VALUES ((now() AT TIME ZONE 'Europe/Berlin')::date, 0, 0)
ON CONFLICT (day) DO NOTHING;

-- Keep the existing RPC signature and its counter/campaign-hour behavior.
-- The daily aggregate is written in the same transaction as the global counter.
CREATE OR REPLACE FUNCTION public.increment_letter_counters(campaign_slug text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  next_letter_count integer;
  counted_slug text;
BEGIN
  UPDATE public.counters
  SET value = value + 1
  WHERE key = 'letter_count'
  RETURNING value INTO next_letter_count;

  IF next_letter_count IS NULL THEN
    INSERT INTO public.counters (key, value)
    VALUES ('letter_count', 1)
    ON CONFLICT (key) DO UPDATE
      SET value = public.counters.value + 1
    RETURNING public.counters.value INTO next_letter_count;
  END IF;

  IF campaign_slug IS NOT NULL AND btrim(campaign_slug) <> '' THEN
    UPDATE public.campaigns
    SET letter_count = letter_count + 1,
        updated_at = now()
    WHERE slug = campaign_slug
      AND status = 'active'
      AND (ends_at IS NULL OR ends_at > now())
    RETURNING slug INTO counted_slug;

    IF counted_slug IS NOT NULL THEN
      INSERT INTO public.campaign_letter_hours (campaign_slug, hour, letters)
      VALUES (counted_slug, date_trunc('hour', now()), 1)
      ON CONFLICT ON CONSTRAINT campaign_letter_hours_pkey DO UPDATE
        SET letters = public.campaign_letter_hours.letters + 1;
    END IF;
  END IF;

  INSERT INTO public.daily_letter_counts (day, total, campaign)
  VALUES (
    (now() AT TIME ZONE 'Europe/Berlin')::date,
    1,
    CASE WHEN campaign_slug IS NOT NULL AND btrim(campaign_slug) <> '' THEN 1 ELSE 0 END
  )
  ON CONFLICT (day) DO UPDATE
    SET total = public.daily_letter_counts.total + 1,
        campaign = public.daily_letter_counts.campaign + EXCLUDED.campaign;

  RETURN next_letter_count;
END;
$$;

-- The new timeline must only include increments from the server-side writer.
REVOKE EXECUTE ON FUNCTION public.increment_letter_counters(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_letter_counters(text) TO service_role;

COMMIT;

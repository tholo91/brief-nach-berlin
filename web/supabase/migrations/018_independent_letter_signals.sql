-- 018: Kartenbeitraege gelten direkt nach Einwilligung, unabhaengig von der Briefgenerierung.

SELECT cron.unschedule('cleanup-pending-letter-signals')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-pending-letter-signals'
);

ALTER TABLE public.letter_signals
  DROP CONSTRAINT IF EXISTS letter_signals_generated_at_check;

ALTER TABLE public.letter_signals
  DROP CONSTRAINT IF EXISTS letter_signals_status_check;

UPDATE public.letter_signals
SET status = 'contributed'
WHERE status IN ('pending', 'generated');

ALTER TABLE public.letter_signals
  ALTER COLUMN status SET DEFAULT 'contributed';

ALTER TABLE public.letter_signals
  ADD CONSTRAINT letter_signals_status_check CHECK (status = 'contributed');

ALTER TABLE public.letter_signals
  DROP CONSTRAINT IF EXISTS letter_signals_topic_source_check;

ALTER TABLE public.letter_signals
  ADD CONSTRAINT letter_signals_topic_source_check
  CHECK (topic_source IN ('routing', 'routing_fallback', 'generation_fallback'));

DROP INDEX IF EXISTS public.letter_signals_generated_at_idx;
DROP INDEX IF EXISTS public.letter_signals_plz_prefix_idx;

CREATE INDEX IF NOT EXISTS letter_signals_generated_at_idx
  ON public.letter_signals (generated_at DESC)
  WHERE generated_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS letter_signals_plz_prefix_idx
  ON public.letter_signals (plz_prefix);

CREATE OR REPLACE FUNCTION public.get_letter_signal_region_counts()
RETURNS TABLE (plz_prefix text, contribution_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    letter_signals.plz_prefix::text,
    count(*)::bigint AS contribution_count
  FROM public.letter_signals AS letter_signals
  WHERE letter_signals.status = 'contributed'
  GROUP BY letter_signals.plz_prefix
  ORDER BY letter_signals.plz_prefix;
$$;

REVOKE ALL ON FUNCTION public.get_letter_signal_region_counts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_letter_signal_region_counts() FROM anon;
REVOKE ALL ON FUNCTION public.get_letter_signal_region_counts() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_letter_signal_region_counts() TO service_role;

-- 020: Klartext-E-Mail fuer ausdrueckliche Einwilligungen und exakte,
-- serverseitig projizierte PLZ-Punkte fuer die oeffentliche Karte.

ALTER TABLE public.letter_signals
  ADD COLUMN IF NOT EXISTS email_normalized text;

ALTER TABLE public.letter_signals
  DROP CONSTRAINT IF EXISTS letter_signals_email_normalized_check;

ALTER TABLE public.letter_signals
  ADD CONSTRAINT letter_signals_email_normalized_check CHECK (
    email_normalized IS NULL
    OR (
      email_normalized = lower(btrim(email_normalized))
      AND char_length(email_normalized) BETWEEN 3 AND 254
      AND email_normalized ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    )
  );

CREATE INDEX IF NOT EXISTS letter_signals_email_normalized_idx
  ON public.letter_signals (email_normalized)
  WHERE email_normalized IS NOT NULL;

DROP FUNCTION IF EXISTS public.get_letter_signal_region_counts();

CREATE OR REPLACE FUNCTION public.get_letter_signal_postcode_counts()
RETURNS TABLE (plz text, contribution_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    letter_signals.plz::text,
    count(*)::bigint AS contribution_count
  FROM public.letter_signals AS letter_signals
  WHERE letter_signals.status = 'contributed'
  GROUP BY letter_signals.plz
  ORDER BY letter_signals.plz;
$$;

REVOKE ALL ON FUNCTION public.get_letter_signal_postcode_counts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_letter_signal_postcode_counts() FROM anon;
REVOKE ALL ON FUNCTION public.get_letter_signal_postcode_counts() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_letter_signal_postcode_counts() TO service_role;

REVOKE ALL ON TABLE public.letter_signals FROM anon;
REVOKE ALL ON TABLE public.letter_signals FROM authenticated;
REVOKE ALL ON TABLE public.letter_signals FROM PUBLIC;

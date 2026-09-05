-- Private review signals for political self-efficacy and experienced
-- powerlessness. Both remain internal and are never part of public review data.

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS political_self_efficacy text,
  ADD COLUMN IF NOT EXISTS political_powerlessness_frequency text;

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_political_self_efficacy_check;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_political_self_efficacy_check CHECK (
    political_self_efficacy IS NULL
    OR political_self_efficacy IN (
      'clearly_yes',
      'rather_yes',
      'rather_no',
      'no',
      'unsure'
    )
  );

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_political_powerlessness_frequency_check;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_political_powerlessness_frequency_check CHECK (
    political_powerlessness_frequency IS NULL
    OR political_powerlessness_frequency IN (
      'often',
      'sometimes',
      'rarely',
      'never'
    )
  );

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_political_self_efficacy_requires_send_check;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_political_self_efficacy_requires_send_check CHECK (
    political_self_efficacy IS NULL OR letter_sent IS TRUE
  );

REVOKE SELECT (political_self_efficacy, political_powerlessness_frequency)
  ON public.reviews FROM anon;
REVOKE SELECT (political_self_efficacy, political_powerlessness_frequency)
  ON public.reviews FROM authenticated;
REVOKE SELECT (political_self_efficacy, political_powerlessness_frequency)
  ON public.reviews FROM PUBLIC;

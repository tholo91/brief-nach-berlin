-- Optional age group from the feedback form. Internal only, never part of
-- public review data.

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS age_group text;

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_age_group_check;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_age_group_check CHECK (
    age_group IS NULL
    OR age_group IN (
      'under_30',
      '30_44',
      '45_59',
      '60_74',
      '75_plus'
    )
  );

REVOKE SELECT (age_group) ON public.reviews FROM anon;
REVOKE SELECT (age_group) ON public.reviews FROM authenticated;
REVOKE SELECT (age_group) ON public.reviews FROM PUBLIC;

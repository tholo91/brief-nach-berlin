-- Quick 261027-hjb: youngest age bucket split into under_20 and 20_29.
-- Every existing row of the old bucket becomes 20_29 (no pupils used the app yet).
BEGIN;

ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_age_group_check;

UPDATE public.reviews SET age_group = '20_29' WHERE age_group = 'under_30';

ALTER TABLE public.reviews ADD CONSTRAINT reviews_age_group_check CHECK (
  age_group IS NULL OR age_group IN ('under_20', '20_29', '30_44', '45_59', '60_74', '75_plus')
);

COMMIT;

-- Optional first-time-writer questions from the feedback form. Internal only,
-- never part of public review data. Apply BEFORE deploying: the review insert
-- and the /stats query select these columns (42703 until then).
--
-- letter_history: 'first' (first letter ever), 'bnb_only' (earlier letters only
-- via Brief-nach-Berlin), 'before' (wrote to politicians before).
-- prior_other_contact: follow-up, only asked for 'first' and 'bnb_only'.

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS letter_history text,
  ADD COLUMN IF NOT EXISTS prior_other_contact boolean;

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_letter_history_check;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_letter_history_check CHECK (
    letter_history IS NULL
    OR letter_history IN ('first', 'bnb_only', 'before')
  );

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_prior_other_contact_check;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_prior_other_contact_check CHECK (
    prior_other_contact IS NULL
    OR letter_history IN ('first', 'bnb_only')
  );

REVOKE SELECT (letter_history) ON public.reviews FROM anon;
REVOKE SELECT (letter_history) ON public.reviews FROM authenticated;
REVOKE SELECT (letter_history) ON public.reviews FROM PUBLIC;
REVOKE SELECT (prior_other_contact) ON public.reviews FROM anon;
REVOKE SELECT (prior_other_contact) ON public.reviews FROM authenticated;
REVOKE SELECT (prior_other_contact) ON public.reviews FROM PUBLIC;

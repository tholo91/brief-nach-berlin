-- 025: Reviews kennen ihre Kampagne. Der Slug reist im signierten Feedback-Token
-- und wird beim Speichern in eine echte Spalte geschrieben (Fundament fuer
-- Ersteller-Stats). Backfill ueber letter_signals, wo die Zuordnung schon existiert.
-- Apply manually in Supabase Studio SQL Editor BEFORE deploying the code change.

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS campaign_slug text;

CREATE INDEX IF NOT EXISTS reviews_campaign_slug_idx
  ON public.reviews (campaign_slug)
  WHERE campaign_slug IS NOT NULL;

UPDATE public.reviews r
SET campaign_slug = s.campaign_slug
FROM public.letter_signals s
WHERE s.letter_id = r.letter_id
  AND r.campaign_slug IS NULL
  AND s.campaign_slug IS NOT NULL;

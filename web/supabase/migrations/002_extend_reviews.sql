-- Extend the existing `reviews` table for feedback capture (Phase: Star-Rating).
-- Apply manually in Supabase Studio SQL Editor against project brief-nach-berlin.
--
-- Pre-condition: table `reviews` already exists with columns:
--   id uuid pk, created_at timestamptz, rating int, body text, consent bool default true
--
-- This migration is additive (IF NOT EXISTS / IF EXISTS guards everywhere).

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS email          text,
  ADD COLUMN IF NOT EXISTS display_name   text,
  ADD COLUMN IF NOT EXISTS politician_id  text,
  ADD COLUMN IF NOT EXISTS plz            text,
  ADD COLUMN IF NOT EXISTS debug_payload  jsonb,
  ADD COLUMN IF NOT EXISTS debug_token    text,
  ADD COLUMN IF NOT EXISTS ip_hash        text,
  ADD COLUMN IF NOT EXISTS user_agent     text,
  -- "Hast du deinen Brief schon verschickt oder verschickst ihn gleich?"
  -- true  = will send / already sent
  -- false = will not send
  -- null  = pre-existing rows from before the field existed
  ADD COLUMN IF NOT EXISTS letter_sent    boolean;

-- Enforce rating range. Drop-then-add so we can re-run the migration safely.
ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_rating_check;
ALTER TABLE public.reviews
  ADD  CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 1 AND 5);

-- Indexes for typical query paths.
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews (created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_consent_idx    ON public.reviews (consent) WHERE consent = TRUE;
CREATE INDEX IF NOT EXISTS reviews_email_idx      ON public.reviews (email);

-- RLS policy: Phase 2 public display via anon key reads only consented rows.
-- INSERTs run with SUPABASE_SERVICE_ROLE_KEY which bypasses RLS, so we
-- intentionally do NOT add an INSERT policy. The spam-gate sits at the
-- Server-Action layer (HMAC-signed token).
DROP POLICY IF EXISTS reviews_public_consented_select ON public.reviews;
CREATE POLICY reviews_public_consented_select
  ON public.reviews
  FOR SELECT
  TO anon
  USING (consent = TRUE);

-- Migration 003: lock down public access to `reviews` and prevent token replay.
-- Apply manually in Supabase Studio SQL Editor against project brief-nach-berlin.
--
-- What this migration does:
--   1. Enables + forces RLS on `reviews` so direct anon access is impossible.
--   2. Recreates the "consented rows visible to anon" policy.
--   3. Adds COLUMN-level grants so anon can only ever read display-safe fields
--      (id, created_at, rating, body, display_name). Email, plz, politician_id,
--      ip_hash, debug_payload, debug_token, user_agent are unreachable for anon
--      regardless of any future policy bug.
--   4. Adds a UNIQUE constraint on debug_token so each signed feedback token can
--      only be redeemed for exactly one rating. Duplicate inserts return SQL
--      error 23505 (handled in submitReviewAction with a friendly message).
--
-- Idempotent: safe to re-run.

-- 1) RLS on, forced.
--    FORCE makes table owners also subject to RLS. Service role bypasses via
--    its BYPASSRLS attribute (configured in Supabase), unaffected by FORCE.
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews FORCE  ROW LEVEL SECURITY;

-- 2) Recreate the public-read policy. consent=true rows are eligible for
--    anon SELECT, but column grants below restrict which fields they see.
DROP POLICY IF EXISTS reviews_public_consented_select ON public.reviews;
CREATE POLICY reviews_public_consented_select
  ON public.reviews
  FOR SELECT
  TO anon
  USING (consent = TRUE);

-- 3) Column-level grants. Strip everything from anon first, then re-grant only
--    the display-safe columns. Same treatment for `authenticated` (we don't
--    use Supabase Auth in v1; defense in depth).
REVOKE ALL ON public.reviews FROM anon;
REVOKE ALL ON public.reviews FROM authenticated;
REVOKE ALL ON public.reviews FROM PUBLIC;

GRANT SELECT (id, created_at, rating, body, display_name)
  ON public.reviews TO anon;
GRANT SELECT (id, created_at, rating, body, display_name)
  ON public.reviews TO authenticated;

-- 4) One rating per signed feedback token.
--    Existing rows have NULL debug_token; NULLs are not considered equal by
--    Postgres UNIQUE, so this is safe on pre-existing data.
ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_debug_token_unique;
ALTER TABLE public.reviews
  ADD  CONSTRAINT reviews_debug_token_unique UNIQUE (debug_token);

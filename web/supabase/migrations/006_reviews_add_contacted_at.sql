-- Migration 006: track when Thomas personally responded to a reviewer.
-- Apply manually in Supabase Studio SQL Editor against project brief-nach-berlin.
--
-- What this migration does:
--   1. Adds `contacted_at date` for marking when a reviewer received a personal
--      reply. NULL means "not yet contacted". Plain date is enough; no need
--      for timestamps or who-responded — Thomas is the only sender.
--   2. Adds a partial index on the unset case so `mark-contacted` queries
--      stay fast as reviews grow.
--
-- RLS / column grants: `contacted_at` is operator-only metadata. It is NOT
-- exposed to anon by the grants in migration 003 (those re-grant only id,
-- created_at, rating, body, display_name). New columns default to deny, so
-- no further policy change is required.
--
-- Idempotent: safe to re-run.

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS contacted_at date;

COMMENT ON COLUMN public.reviews.contacted_at IS
  'Date Thomas personally responded to the reviewer. NULL = not yet contacted.';

-- Speed up the most common operator query: "show me everyone I have not
-- written back yet". Partial index keeps storage tiny.
CREATE INDEX IF NOT EXISTS reviews_uncontacted_idx
  ON public.reviews (created_at DESC)
  WHERE contacted_at IS NULL;

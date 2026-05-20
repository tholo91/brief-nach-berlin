-- Migration 004: add structured quick-feedback tags to reviews.
-- Apply manually in Supabase Studio SQL Editor against project brief-nach-berlin.
--
-- What this migration does:
--   1. Adds `feedback_tags text[]` for multi-select Pilbert-style chips on the
--      feedback page (e.g. {zu_lang, falscher_ton}).
--   2. Adds a GIN index for tag-based filtering (e.g. "show me all reviews
--      that flagged 'zu_generisch'").
--
-- RLS: anon cannot read this column. Column grants in migration 003
-- (003_lockdown_reviews.sql) only expose id, created_at, rating, body,
-- display_name to anon/authenticated. New columns default to deny.
--
-- Idempotent: safe to re-run.

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS feedback_tags text[];

CREATE INDEX IF NOT EXISTS reviews_feedback_tags_gin
  ON public.reviews USING gin (feedback_tags);

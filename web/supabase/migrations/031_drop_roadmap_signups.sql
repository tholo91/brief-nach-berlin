-- Migration 031: drop `roadmap_signups` (old waitlist, created in migration 005).
-- Apply manually in Supabase Studio SQL Editor against project brief-nach-berlin,
-- only after Thomas' OK. Irreversible: all rows are lost.
--
-- Why:
--   The waitlist form ("tell me when this level goes live") was removed. The table
--   is obsolete and holds email addresses without any remaining purpose (DSGVO
--   data minimisation). No code reads or writes it any more (submitRoadmapSignup,
--   the self-service deletion and the delete script no longer touch it), so the
--   deploy order relative to this migration does not matter.

DROP TABLE IF EXISTS public.roadmap_signups;

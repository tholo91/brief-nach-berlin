-- Migration 005: create `roadmap_signups` for "tell me when this level goes live".
-- Apply manually in Supabase Studio SQL Editor against project brief-nach-berlin.
--
-- What this migration does:
--   1. Creates `roadmap_signups` to persist email + level interest from
--      /was-noch-kommt (and any future level-specific signup form). Each row is
--      one user committing to a single ebene (land/kommune/eu/alle).
--   2. Adds indexes for the typical query paths: "all signups for ebene X" and
--      "most recent first" for ops/admin views.
--   3. Locks the table down: RLS enabled + forced, all grants revoked. Inserts
--      only ever happen via the service-role key from a Server Action
--      (submitRoadmapSignup). Reads only via Supabase Studio.
--
-- DSGVO promise we encode here:
--   - email + ebene are the only user-supplied fields persisted
--   - ip_hash is HMAC-SHA256(ip, REVIEW_IP_SALT), irreversible, only for rate-limit dedupe
--   - user_agent is captured for abuse triage; coarse, no per-user tracking
--   - notified_at marks when the one-shot launch notification went out, so a
--     scheduled cleanup job can hard-delete the row afterwards
--
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS public.roadmap_signups (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  email         text NOT NULL,
  ebene         text NOT NULL CHECK (ebene IN ('land', 'kommune', 'eu', 'alle')),
  ip_hash       text,
  user_agent    text,
  -- Set when the one-shot launch notification has been sent. Row can be
  -- hard-deleted afterwards by an admin cleanup script.
  notified_at   timestamptz,
  -- Same email may sign up for different levels; one row per (email, ebene).
  -- A repeat signup for the same pair returns a friendly "already on the list"
  -- in the Server Action (Postgres 23505).
  CONSTRAINT roadmap_signups_email_ebene_unique UNIQUE (email, ebene)
);

CREATE INDEX IF NOT EXISTS roadmap_signups_ebene_idx
  ON public.roadmap_signups (ebene);
CREATE INDEX IF NOT EXISTS roadmap_signups_created_at_idx
  ON public.roadmap_signups (created_at DESC);

-- RLS on, forced. FORCE makes table owners also subject to RLS; service role
-- bypasses via its BYPASSRLS attribute (configured in Supabase), unaffected
-- by FORCE.
ALTER TABLE public.roadmap_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_signups FORCE  ROW LEVEL SECURITY;

-- No public read, no public write. Inserts run via service role from the
-- submitRoadmapSignup Server Action. Reads happen only from Supabase Studio
-- (admin) or the notification cron (also service role).
REVOKE ALL ON public.roadmap_signups FROM anon;
REVOKE ALL ON public.roadmap_signups FROM authenticated;
REVOKE ALL ON public.roadmap_signups FROM PUBLIC;

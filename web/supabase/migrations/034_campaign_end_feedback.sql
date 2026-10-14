-- Migration 034: Kampagnen-Abschluss-Mail mit 1-Minute-Feedback.
-- Apply manually in Supabase Studio SQL Editor against project brief-nach-berlin,
-- only after Thomas' OK and only AFTER migration 029 (this file alters
-- `campaign_creator_surveys`, which 029 creates). Order: 029, then 034.
--
-- What this migration does:
--   1. campaigns.created_by_founder: Thomas sets it in the Supabase dashboard for
--      campaigns he built himself. Effect: extra thank-you sentence in the closing
--      mail and a line in the survey admin mail.
--   2. campaigns.ended_notified_at: set by scripts/send-campaign-ended-mail.ts
--      after a real send to the creator. Guards against double sends and drives
--      the --list view.
--   3. campaign_creator_surveys: new columns for the expectation, the results the
--      creator heard of (plus an optional note), the To-Do statement and the
--      quote mode (named or anonymous, with an optional label).
--   4. Mirrors the allowlists of src/lib/campaigns/creatorSurvey.ts as CHECK
--      constraints, so a bad write fails even if the app validation is bypassed.
--
-- The code tolerates a missing 034: getCreatorSurveyStatus probes quote_mode and
-- returns "unavailable" without it (no card, no nav item, the feedback page
-- redirects). The script's --list and --send refuse with a clear message.
-- The app's main campaign queries never select the two new campaigns columns.
--
-- DSGVO notes:
--   - Only voluntary survey answers and a free-text note. No new personal data
--     beyond what 029 already covers.
--   - consent_quote_at keeps proving the consent. The app re-stamps it whenever
--     the quote, the quote mode or the anonymous label changes.
--
-- Idempotent: safe to re-run.

-- 1 + 2: campaigns
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS created_by_founder boolean NOT NULL DEFAULT false;

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS ended_notified_at timestamptz;

COMMENT ON COLUMN public.campaigns.created_by_founder IS
  'true, wenn Thomas die Kampagne selbst aufgesetzt hat. Setzt er manuell im Supabase-Dashboard. Steuert den Dankessatz in der Abschluss-Mail.';

COMMENT ON COLUMN public.campaigns.ended_notified_at IS
  'Zeitpunkt, an dem die Abschluss-Mail an die Ersteller:innen verschickt wurde (scripts/send-campaign-ended-mail.ts --send). NULL = noch nicht verschickt.';

-- 3: campaign_creator_surveys
ALTER TABLE public.campaign_creator_surveys
  ADD COLUMN IF NOT EXISTS expectation text,
  ADD COLUMN IF NOT EXISTS outcomes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS outcomes_note text,
  ADD COLUMN IF NOT EXISTS statement_todo_handeln text,
  ADD COLUMN IF NOT EXISTS quote_mode text,
  ADD COLUMN IF NOT EXISTS anonymous_label text;

-- Backfill before the constraints: an old consent meant "mit Logo und Name".
UPDATE public.campaign_creator_surveys
SET quote_mode = 'named'
WHERE consent_quote AND quote_mode IS NULL;

-- 4: CHECK constraints (DROP IF EXISTS + ADD, so re-runs are safe)
ALTER TABLE public.campaign_creator_surveys
  DROP CONSTRAINT IF EXISTS campaign_creator_surveys_expectation_check;
ALTER TABLE public.campaign_creator_surveys
  ADD CONSTRAINT campaign_creator_surveys_expectation_check CHECK (
    expectation IS NULL OR expectation IN ('mehr', 'so_viele', 'weniger')
  );

ALTER TABLE public.campaign_creator_surveys
  DROP CONSTRAINT IF EXISTS campaign_creator_surveys_outcomes_check;
ALTER TABLE public.campaign_creator_surveys
  ADD CONSTRAINT campaign_creator_surveys_outcomes_check CHECK (
    outcomes <@ ARRAY[
      'medienbericht',
      'antwort_politik',
      'politische_entscheidung',
      'noch_nichts',
      'zu_frueh'
    ]::text[]
  );

-- 'noch_nichts' und 'zu_frueh' stehen nie neben einem gemeldeten Ergebnis.
ALTER TABLE public.campaign_creator_surveys
  DROP CONSTRAINT IF EXISTS campaign_creator_surveys_outcomes_exclusive_check;
ALTER TABLE public.campaign_creator_surveys
  ADD CONSTRAINT campaign_creator_surveys_outcomes_exclusive_check CHECK (
    NOT (
      ('noch_nichts' = ANY (outcomes) OR 'zu_frueh' = ANY (outcomes))
      AND cardinality(outcomes) > 1
    )
  );

ALTER TABLE public.campaign_creator_surveys
  DROP CONSTRAINT IF EXISTS campaign_creator_surveys_outcomes_note_length_check;
ALTER TABLE public.campaign_creator_surveys
  ADD CONSTRAINT campaign_creator_surveys_outcomes_note_length_check CHECK (
    outcomes_note IS NULL OR char_length(outcomes_note) BETWEEN 1 AND 300
  );

ALTER TABLE public.campaign_creator_surveys
  DROP CONSTRAINT IF EXISTS campaign_creator_surveys_statement_todo_handeln_check;
ALTER TABLE public.campaign_creator_surveys
  ADD CONSTRAINT campaign_creator_surveys_statement_todo_handeln_check CHECK (
    statement_todo_handeln IN ('stimmt', 'teils', 'stimmt_nicht', 'weiss_nicht')
  );

ALTER TABLE public.campaign_creator_surveys
  DROP CONSTRAINT IF EXISTS campaign_creator_surveys_quote_mode_check;
ALTER TABLE public.campaign_creator_surveys
  ADD CONSTRAINT campaign_creator_surveys_quote_mode_check CHECK (
    quote_mode IS NULL OR quote_mode IN ('named', 'anonymous')
  );

-- Der Umfang der Freigabe ist immer ausdruecklich: ohne Freigabe kein Modus,
-- ohne Modus keine Freigabe.
ALTER TABLE public.campaign_creator_surveys
  DROP CONSTRAINT IF EXISTS campaign_creator_surveys_consent_requires_mode_check;
ALTER TABLE public.campaign_creator_surveys
  ADD CONSTRAINT campaign_creator_surveys_consent_requires_mode_check CHECK (
    NOT consent_quote OR quote_mode IS NOT NULL
  );

ALTER TABLE public.campaign_creator_surveys
  DROP CONSTRAINT IF EXISTS campaign_creator_surveys_mode_requires_consent_check;
ALTER TABLE public.campaign_creator_surveys
  ADD CONSTRAINT campaign_creator_surveys_mode_requires_consent_check CHECK (
    quote_mode IS NULL OR consent_quote
  );

ALTER TABLE public.campaign_creator_surveys
  DROP CONSTRAINT IF EXISTS campaign_creator_surveys_anonymous_label_check;
ALTER TABLE public.campaign_creator_surveys
  ADD CONSTRAINT campaign_creator_surveys_anonymous_label_check CHECK (
    anonymous_label IS NULL
    OR (char_length(anonymous_label) BETWEEN 1 AND 80 AND quote_mode = 'anonymous')
  );

-- Migration 029: create `campaign_creator_surveys` for the feedback form of campaign creators.
-- Apply manually in Supabase Studio SQL Editor against project brief-nach-berlin.
--
-- What this migration does:
--   1. Creates `campaign_creator_surveys`: one row per campaign with the answers
--      of the creator (reasons, concerns, four statements, one quote, consents,
--      help offers). Written only by the Server Action submitCreatorSurveyAction
--      via the service-role key, read only by the manage page and Supabase Studio.
--   2. Mirrors the allowlists of src/lib/campaigns/creatorSurvey.ts as CHECK
--      constraints, so a bad write fails even if the app validation is bypassed.
--   3. Locks the table down: RLS enabled + forced, all grants revoked.
--
-- The code tolerates the missing table: until this migration is applied,
-- getCreatorSurveyStatus returns "unavailable" (no card, no nav item, the
-- feedback page redirects). It is safe to deploy the code before the migration.
--
-- DSGVO notes:
--   - No new personal data beyond the voluntary answers. The creator email is not
--     stored here, it stays on the campaign.
--   - consent_quote_at is the proof of the consent to show the quote with logo and
--     name. It is set on first consent and whenever the consented quote changes.
--   - Rows are deleted with the campaign (ON DELETE CASCADE).
--   - A campaign transfer carries the answers and consents to the new owner
--     (accepted risk, disclosed in the privacy policy).
--
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS public.campaign_creator_surveys (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   uuid NOT NULL UNIQUE REFERENCES public.campaigns(id) ON DELETE CASCADE,

  reasons       text[] NOT NULL DEFAULT '{}',
  concerns      text[] NOT NULL DEFAULT '{}',
  help_offers   text[] NOT NULL DEFAULT '{}',

  statement_einfacher_einstieg text,
  statement_handschrift_wirkt  text,
  statement_schnell_eingerichtet text,
  statement_wieder_kampagne    text,

  quote              text,
  consent_quote      boolean NOT NULL DEFAULT false,
  consent_quote_at   timestamptz,
  consent_aggregate  boolean NOT NULL DEFAULT false,

  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT campaign_creator_surveys_reasons_check CHECK (
    reasons <@ ARRAY[
      'kostenlos_ohne_account',
      'persoenlicher_kontakt',
      'handschrift',
      'empfehlung',
      'presse_podcast',
      'einfach_fuer_community',
      'neues_ausprobieren'
    ]::text[]
  ),
  CONSTRAINT campaign_creator_surveys_concerns_check CHECK (
    concerns <@ ARRAY[
      'ki_spam',
      'aufwand',
      'wirkung',
      'kontrolle',
      'keine'
    ]::text[]
  ),
  -- 'keine' schliesst alle anderen Bedenken aus.
  CONSTRAINT campaign_creator_surveys_concerns_keine_alone_check CHECK (
    NOT ('keine' = ANY (concerns) AND cardinality(concerns) > 1)
  ),
  CONSTRAINT campaign_creator_surveys_help_offers_check CHECK (
    help_offers <@ ARRAY[
      'gemeinsamer_post',
      'medien_kontakt',
      'initiative_vorstellen',
      'austausch'
    ]::text[]
  ),

  CONSTRAINT campaign_creator_surveys_statement_einfacher_einstieg_check CHECK (
    statement_einfacher_einstieg IN ('stimmt', 'teils', 'stimmt_nicht', 'weiss_nicht')
  ),
  CONSTRAINT campaign_creator_surveys_statement_handschrift_wirkt_check CHECK (
    statement_handschrift_wirkt IN ('stimmt', 'teils', 'stimmt_nicht', 'weiss_nicht')
  ),
  CONSTRAINT campaign_creator_surveys_statement_schnell_eingerichtet_check CHECK (
    statement_schnell_eingerichtet IN ('stimmt', 'teils', 'stimmt_nicht', 'weiss_nicht')
  ),
  CONSTRAINT campaign_creator_surveys_statement_wieder_kampagne_check CHECK (
    statement_wieder_kampagne IN ('stimmt', 'teils', 'stimmt_nicht', 'weiss_nicht')
  ),

  CONSTRAINT campaign_creator_surveys_quote_length_check CHECK (
    quote IS NULL OR char_length(quote) BETWEEN 1 AND 300
  ),
  -- Ohne Zitat gibt es nichts freizugeben.
  CONSTRAINT campaign_creator_surveys_consent_requires_quote_check CHECK (
    NOT consent_quote OR quote IS NOT NULL
  )
);

-- RLS on, forced. FORCE makes table owners also subject to RLS; service role
-- bypasses via its BYPASSRLS attribute (configured in Supabase), unaffected
-- by FORCE.
ALTER TABLE public.campaign_creator_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_creator_surveys FORCE ROW LEVEL SECURITY;

-- No public read, no public write. Writes run via service role from the
-- submitCreatorSurveyAction Server Action. Reads happen via the manage page
-- (service role) and Supabase Studio (admin).
REVOKE ALL ON public.campaign_creator_surveys FROM anon;
REVOKE ALL ON public.campaign_creator_surveys FROM authenticated;
REVOKE ALL ON public.campaign_creator_surveys FROM PUBLIC;

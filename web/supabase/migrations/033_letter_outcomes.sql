BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE TABLE IF NOT EXISTS public.letter_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL CHECK (length(email) <= 254),
  cohort text NOT NULL CHECK (cohort = 'lastcall_2026_10'),
  entry_choice text NOT NULL CHECK (entry_choice IN ('yes', 'no', 'not_sent')),
  letter_sent text CHECK (letter_sent IN ('handwritten', 'typed', 'not_sent')),
  not_sent_reason text CHECK (not_sent_reason IN ('no_time', 'postage_or_address', 'doubt', 'forgot', 'other')),
  reply_channels text[] NOT NULL DEFAULT '{}',
  reply_addressed text CHECK (reply_addressed IN ('concrete', 'partly', 'generic')),
  issue_scope text CHECK (issue_scope IN ('local', 'big')),
  expectation text CHECK (expectation IN ('answer', 'read', 'said_it', 'nothing_specific')),
  political_self_efficacy text CHECK (political_self_efficacy IN ('clearly_yes', 'rather_yes', 'rather_no', 'no', 'unsure')),
  write_again text CHECK (write_again IN ('already_did', 'yes', 'maybe', 'rather_not')),
  body text CHECK (body IS NULL OR length(body) <= 3000),
  processing_consent boolean NOT NULL DEFAULT false,
  processing_consented_at timestamptz,
  consent boolean NOT NULL DEFAULT false,
  display_name text CHECK (display_name IS NULL OR length(display_name) <= 80),
  call_ok boolean NOT NULL DEFAULT false,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  last_step text NOT NULL DEFAULT 'entry' CHECK (length(last_step) <= 60),
  ip_hash text NOT NULL CHECK (ip_hash ~ '^[0-9a-f]{64}$'),
  UNIQUE (email, cohort),
  CONSTRAINT letter_outcomes_reply_channels_allowed CHECK (
    reply_channels <@ ARRAY['letter','email','phone','callback','meeting','acknowledgement','none']::text[]
  ),
  CONSTRAINT letter_outcomes_reply_channels_count CHECK (cardinality(reply_channels) <= 7),
  CONSTRAINT letter_outcomes_none_exclusive CHECK (
    NOT ('none' = ANY(reply_channels)) OR cardinality(reply_channels) = 1
  ),
  CONSTRAINT letter_outcomes_branch_clear CHECK (
    (letter_sent = 'not_sent' AND cardinality(reply_channels) = 0 AND reply_addressed IS NULL)
    OR (letter_sent IS DISTINCT FROM 'not_sent' AND not_sent_reason IS NULL)
  ),
  CONSTRAINT letter_outcomes_completed_branch CHECK (
    NOT completed OR (
      letter_sent IS NOT NULL AND completed_at IS NOT NULL
      AND issue_scope IS NOT NULL AND expectation IS NOT NULL
      AND political_self_efficacy IS NOT NULL AND write_again IS NOT NULL
      AND processing_consent = true AND processing_consented_at IS NOT NULL
      AND ((letter_sent = 'not_sent' AND not_sent_reason IS NOT NULL)
        OR (letter_sent IN ('handwritten', 'typed') AND cardinality(reply_channels) > 0
          AND ((reply_channels = ARRAY['none']::text[] AND reply_addressed IS NULL)
            OR (NOT ('none' = ANY(reply_channels)) AND reply_addressed IS NOT NULL))))
    )
  )
);

CREATE INDEX IF NOT EXISTS letter_outcomes_created_at_idx ON public.letter_outcomes (created_at);

ALTER TABLE public.letter_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_outcomes FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.letter_outcomes FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.letter_outcomes TO service_role;

-- Single RPC is the only supported writer. Row-level locking plus the completed
-- predicate makes progress/full writes safe when a request arrives late.
CREATE OR REPLACE FUNCTION public.submit_letter_outcome(
  p_mode text,
  p_email text,
  p_cohort text,
  p_entry_choice text,
  p_answers jsonb,
  p_processing_consent boolean,
  p_last_step text,
  p_body text,
  p_consent boolean,
  p_display_name text,
  p_call_ok boolean,
  p_ip_hash text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing public.letter_outcomes%ROWTYPE;
BEGIN
  IF p_mode NOT IN ('initial', 'progress', 'full') OR p_cohort <> 'lastcall_2026_10'
     OR p_entry_choice NOT IN ('yes', 'no', 'not_sent') THEN
    RAISE EXCEPTION 'invalid outcome request';
  END IF;
  IF p_mode <> 'initial' AND p_processing_consent IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'processing consent required';
  END IF;

  IF p_mode = 'initial' THEN
    INSERT INTO public.letter_outcomes (email, cohort, entry_choice, ip_hash)
    VALUES (lower(trim(p_email)), p_cohort, p_entry_choice, p_ip_hash)
    ON CONFLICT (email, cohort) DO NOTHING;
    RETURN;
  END IF;

  INSERT INTO public.letter_outcomes (email, cohort, entry_choice, ip_hash)
  VALUES (lower(trim(p_email)), p_cohort, p_entry_choice, p_ip_hash)
  ON CONFLICT (email, cohort) DO NOTHING;

  SELECT * INTO v_existing FROM public.letter_outcomes
  WHERE email = lower(trim(p_email)) AND cohort = p_cohort FOR UPDATE;
  IF v_existing.completed AND p_mode <> 'full' THEN RETURN; END IF;

  UPDATE public.letter_outcomes SET
    letter_sent = NULLIF(p_answers->>'letterSent', 'null'),
    not_sent_reason = NULLIF(p_answers->>'notSentReason', 'null'),
    reply_channels = ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_answers->'replyChannels', '[]'::jsonb))),
    reply_addressed = NULLIF(p_answers->>'replyAddressed', 'null'),
    issue_scope = NULLIF(p_answers->>'issueScope', 'null'),
    expectation = NULLIF(p_answers->>'expectation', 'null'),
    political_self_efficacy = NULLIF(p_answers->>'politicalSelfEfficacy', 'null'),
    write_again = NULLIF(p_answers->>'writeAgain', 'null'),
    last_step = p_last_step,
    ip_hash = p_ip_hash,
    body = CASE WHEN p_mode = 'full' THEN p_body ELSE body END,
    processing_consent = true,
    processing_consented_at = COALESCE(processing_consented_at, now()),
    consent = CASE WHEN p_mode = 'full' THEN COALESCE(p_consent, false) ELSE consent END,
    display_name = CASE WHEN p_mode = 'full' THEN p_display_name ELSE display_name END,
    call_ok = CASE WHEN p_mode = 'full' THEN COALESCE(p_call_ok, false) ELSE call_ok END,
    completed = (p_mode = 'full'),
    completed_at = CASE WHEN p_mode = 'full' THEN COALESCE(completed_at, now()) ELSE NULL END,
    updated_at = now()
  WHERE email = lower(trim(p_email)) AND cohort = p_cohort AND (completed = false OR p_mode = 'full');
END;
$$;

REVOKE ALL ON FUNCTION public.submit_letter_outcome(text,text,text,text,jsonb,boolean,text,text,boolean,text,boolean,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_letter_outcome(text,text,text,text,jsonb,boolean,text,text,boolean,text,boolean,text) TO service_role;

-- Delete one day before the 24-month limit so daily execution never intentionally exceeds it.
SELECT cron.schedule(
  'cleanup-letter-outcomes',
  '23 3 * * *',
  $cleanup$
    DELETE FROM public.letter_outcomes
    WHERE created_at < now() - interval '24 months' + interval '1 day';
  $cleanup$
);

COMMIT;

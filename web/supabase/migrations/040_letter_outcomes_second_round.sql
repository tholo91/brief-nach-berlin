-- Quick 261116-c14: second "Rückmeldung" wave (cohort lastcall_2026_11).
-- Pure superset of 033/035: widens what is allowed, removes nothing.
--  * cohort allows lastcall_2026_10 and lastcall_2026_11
--  * letter_sent additionally allows 'printed' and 'email' ('typed' stays valid for old rows)
--  * letter_outcomes_completed_branch accepts the new sent methods
--  * submit_letter_outcome accepts both cohorts
-- DEPENDS ON 035 (reply_feeling column; the function body below is the 035 body).
-- The pg_cron job 'cleanup-letter-outcomes' has no cohort reference and is unchanged.
-- Apply BEFORE deploying the code: once the form offers printed/email, a write against
-- the old CHECK fails. Being a superset, applying it early is safe.
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'letter_outcomes' AND column_name = 'reply_feeling'
  ) THEN
    RAISE EXCEPTION 'migration 035 (reply_feeling) must be applied before 040';
  END IF;
END $$;

ALTER TABLE public.letter_outcomes DROP CONSTRAINT IF EXISTS letter_outcomes_cohort_check;
ALTER TABLE public.letter_outcomes DROP CONSTRAINT IF EXISTS letter_outcomes_letter_sent_check;
ALTER TABLE public.letter_outcomes DROP CONSTRAINT IF EXISTS letter_outcomes_completed_branch;

ALTER TABLE public.letter_outcomes ADD CONSTRAINT letter_outcomes_cohort_allowed CHECK (
  cohort IN ('lastcall_2026_10', 'lastcall_2026_11')
);

ALTER TABLE public.letter_outcomes ADD CONSTRAINT letter_outcomes_letter_sent_allowed CHECK (
  letter_sent IN ('handwritten', 'typed', 'printed', 'email', 'not_sent')
);

ALTER TABLE public.letter_outcomes ADD CONSTRAINT letter_outcomes_completed_branch CHECK (
  NOT completed OR (
    letter_sent IS NOT NULL AND completed_at IS NOT NULL
    AND issue_scope IS NOT NULL AND expectation IS NOT NULL
    AND political_self_efficacy IS NOT NULL AND write_again IS NOT NULL
    AND processing_consent = true AND processing_consented_at IS NOT NULL
    AND ((letter_sent = 'not_sent' AND not_sent_reason IS NOT NULL)
      OR (letter_sent IN ('handwritten', 'typed', 'printed', 'email') AND cardinality(reply_channels) > 0
        AND ((reply_channels = ARRAY['none']::text[] AND reply_addressed IS NULL)
          OR (NOT ('none' = ANY(reply_channels)) AND reply_addressed IS NOT NULL))))
  )
);

-- Assertions: the transaction rolls back if the constraint set is inconsistent.
DO $$
DECLARE
  v_cohort_checks integer;
  v_stale_checks integer;
BEGIN
  SELECT count(*) INTO v_cohort_checks
  FROM pg_constraint
  WHERE conrelid = 'public.letter_outcomes'::regclass AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%cohort%';
  IF v_cohort_checks <> 1 THEN
    RAISE EXCEPTION 'expected exactly one cohort CHECK, found %', v_cohort_checks;
  END IF;

  SELECT count(*) INTO v_stale_checks
  FROM pg_constraint
  WHERE conrelid = 'public.letter_outcomes'::regclass AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%''typed''%'
    AND (pg_get_constraintdef(oid) NOT LIKE '%''printed''%' OR pg_get_constraintdef(oid) NOT LIKE '%''email''%');
  IF v_stale_checks <> 0 THEN
    RAISE EXCEPTION 'found % CHECK(s) with typed but without printed/email', v_stale_checks;
  END IF;
END $$;

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
  IF p_mode NOT IN ('initial', 'progress', 'full')
     OR p_cohort NOT IN ('lastcall_2026_10', 'lastcall_2026_11')
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
    reply_feeling = NULLIF(p_answers->>'replyFeeling', 'null'),
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

COMMIT;

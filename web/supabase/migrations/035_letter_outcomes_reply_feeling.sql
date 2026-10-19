BEGIN;

-- Quick 261019-uim: "Wie war die Reaktion für dich?" is only asked when a reply came.
-- Nullable on purpose: older completed rows with a reply have no value and stay valid,
-- so letter_outcomes_completed_branch is intentionally left untouched.
ALTER TABLE public.letter_outcomes ADD COLUMN IF NOT EXISTS reply_feeling text;

ALTER TABLE public.letter_outcomes DROP CONSTRAINT IF EXISTS letter_outcomes_reply_feeling_allowed;
ALTER TABLE public.letter_outcomes ADD CONSTRAINT letter_outcomes_reply_feeling_allowed CHECK (
  reply_feeling IS NULL OR reply_feeling IN ('positive_surprise', 'glad_someone_answered', 'as_expected', 'disappointing')
);

ALTER TABLE public.letter_outcomes DROP CONSTRAINT IF EXISTS letter_outcomes_reply_feeling_needs_reply;
ALTER TABLE public.letter_outcomes ADD CONSTRAINT letter_outcomes_reply_feeling_needs_reply CHECK (
  reply_feeling IS NULL OR (
    letter_sent IS DISTINCT FROM 'not_sent'
    AND cardinality(reply_channels) > 0
    AND NOT ('none' = ANY(reply_channels))
  )
);

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

-- 017: freiwillige Themensignale, ohne Brief- oder Anliegen-Volltext.
-- Apply manually in Supabase Studio SQL Editor after migration 016.

CREATE TABLE IF NOT EXISTS public.letter_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  consented_at timestamptz NOT NULL DEFAULT now(),
  generated_at timestamptz,
  status text NOT NULL,
  consent_version text NOT NULL,
  plz char(5) NOT NULL,
  plz_prefix char(2) NOT NULL,
  bundesland_key char(2) NOT NULL,
  political_level text NOT NULL,
  recipient_kind text NOT NULL,
  topic_categories text[] NOT NULL,
  topic_labels text[] NOT NULL,
  topic_taxonomy_version text NOT NULL,
  topic_source text NOT NULL,
  topic_model text NOT NULL,
  campaign_slug text,
  email_lookup_hash text NOT NULL,
  CONSTRAINT letter_signals_status_check CHECK (status IN ('pending', 'generated')),
  CONSTRAINT letter_signals_generated_at_check CHECK (
    (status = 'pending' AND generated_at IS NULL)
    OR (status = 'generated' AND generated_at IS NOT NULL)
  ),
  CONSTRAINT letter_signals_plz_check CHECK (plz ~ '^[0-9]{5}$'),
  CONSTRAINT letter_signals_plz_prefix_check CHECK (plz_prefix = left(plz, 2)),
  CONSTRAINT letter_signals_bundesland_key_check CHECK (bundesland_key ~ '^[A-Z]{2}$'),
  CONSTRAINT letter_signals_level_check CHECK (political_level IN ('Bund', 'Land', 'Kommune')),
  CONSTRAINT letter_signals_recipient_kind_check CHECK (recipient_kind IN ('mdb', 'mdl', 'landesregierung', 'rathaus')),
  CONSTRAINT letter_signals_topic_categories_check CHECK (
    cardinality(topic_categories) BETWEEN 1 AND 3
    AND array_position(topic_categories, NULL) IS NULL
    AND topic_categories <@ ARRAY[
      'demokratie_staat', 'bildung', 'gesundheit_pflege', 'soziales_familie',
      'wohnen_bauen', 'verkehr_mobilitaet', 'klima_umwelt', 'wirtschaft_arbeit',
      'migration_integration', 'sicherheit_justiz', 'digitales_verwaltung',
      'kultur_sport', 'sonstiges'
    ]::text[]
  ),
  CONSTRAINT letter_signals_topic_labels_check CHECK (
    cardinality(topic_labels) BETWEEN 1 AND 3
    AND array_position(topic_labels, NULL) IS NULL
  ),
  CONSTRAINT letter_signals_topic_source_check CHECK (topic_source IN ('routing', 'generation_fallback')),
  CONSTRAINT letter_signals_email_lookup_hash_check CHECK (email_lookup_hash ~ '^[a-f0-9]{64}$')
);

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS letter_id uuid;

CREATE INDEX IF NOT EXISTS letter_signals_created_at_idx
  ON public.letter_signals (created_at DESC);
CREATE INDEX IF NOT EXISTS letter_signals_generated_at_idx
  ON public.letter_signals (generated_at DESC)
  WHERE status = 'generated';
CREATE INDEX IF NOT EXISTS letter_signals_plz_prefix_idx
  ON public.letter_signals (plz_prefix)
  WHERE status = 'generated';
CREATE INDEX IF NOT EXISTS letter_signals_email_lookup_hash_idx
  ON public.letter_signals (email_lookup_hash);
CREATE INDEX IF NOT EXISTS reviews_letter_id_idx
  ON public.reviews (letter_id)
  WHERE letter_id IS NOT NULL;

ALTER TABLE public.letter_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_signals FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.letter_signals FROM anon;
REVOKE ALL ON TABLE public.letter_signals FROM authenticated;
REVOKE ALL ON TABLE public.letter_signals FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.letter_signals TO service_role;

-- Supabase Cron runs inside Postgres and therefore does not depend on the
-- Vercel Hobby cron limit. The 23-hour cutoff plus hourly execution removes a
-- pending row no later than 24 hours after creation.
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cleanup-pending-letter-signals',
  '17 * * * *',
  $cleanup$
    DELETE FROM public.letter_signals
    WHERE status = 'pending'
      AND created_at < now() - interval '23 hours';
  $cleanup$
);

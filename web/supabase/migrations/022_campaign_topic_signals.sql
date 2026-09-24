-- 022: Persist the shared, privacy-minimized topic signal for an NGO campaign.
-- The campaign text itself already exists in this restricted table; these
-- fields hold only taxonomy codes and neutral short labels for internal stats.

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS topic_categories text[],
  ADD COLUMN IF NOT EXISTS topic_labels text[],
  ADD COLUMN IF NOT EXISTS topic_taxonomy_version text,
  ADD COLUMN IF NOT EXISTS topic_model text,
  ADD COLUMN IF NOT EXISTS topic_classified_at timestamptz;

ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_topic_categories_check,
  DROP CONSTRAINT IF EXISTS campaigns_topic_labels_check,
  DROP CONSTRAINT IF EXISTS campaigns_topic_signal_presence_check;

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_topic_categories_check CHECK (
    topic_categories IS NULL OR (
      cardinality(topic_categories) BETWEEN 1 AND 3
      AND array_position(topic_categories, NULL) IS NULL
      AND topic_categories <@ ARRAY[
        'demokratie_staat', 'bildung', 'gesundheit_pflege', 'soziales_familie',
        'wohnen_bauen', 'verkehr_mobilitaet', 'klima_umwelt', 'wirtschaft_arbeit',
        'migration_integration', 'sicherheit_justiz', 'digitales_verwaltung',
        'kultur_sport', 'sonstiges'
      ]::text[]
    )
  ),
  ADD CONSTRAINT campaigns_topic_labels_check CHECK (
    topic_labels IS NULL OR (
      cardinality(topic_labels) BETWEEN 1 AND 3
      AND array_position(topic_labels, NULL) IS NULL
    )
  ),
  ADD CONSTRAINT campaigns_topic_signal_presence_check CHECK (
    (topic_categories IS NULL) = (topic_labels IS NULL)
    AND (topic_categories IS NULL) = (topic_taxonomy_version IS NULL)
    AND (topic_categories IS NULL) = (topic_model IS NULL)
    AND (topic_categories IS NULL) = (topic_classified_at IS NULL)
  );

ALTER TABLE public.letter_signals
  DROP CONSTRAINT IF EXISTS letter_signals_topic_source_check;

ALTER TABLE public.letter_signals
  ADD CONSTRAINT letter_signals_topic_source_check
  CHECK (topic_source IN ('routing', 'routing_fallback', 'generation_fallback', 'campaign'));

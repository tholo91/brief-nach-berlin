-- 022: Durable Idempotenz fuer Briefgenerierung, Zaehler und Erstversand.
-- Speichert ausschliesslich die zufaellige letter_id und technische Zeitpunkte,
-- niemals Anliegen-, Brief- oder E-Mail-Inhalte.

CREATE TABLE IF NOT EXISTS public.letter_generation_claims (
  letter_id uuid PRIMARY KEY,
  owner_token uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  irreversible_at timestamptz,
  completed_at timestamptz,
  CONSTRAINT letter_generation_claims_updated_at_check CHECK (
    updated_at >= created_at
  ),
  CONSTRAINT letter_generation_claims_irreversible_at_check CHECK (
    irreversible_at IS NULL OR irreversible_at >= created_at
  ),
  CONSTRAINT letter_generation_claims_completed_at_check CHECK (
    completed_at IS NULL OR completed_at >= created_at
  )
);

ALTER TABLE public.letter_generation_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_generation_claims FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.letter_generation_claims FROM anon;
REVOKE ALL ON TABLE public.letter_generation_claims FROM authenticated;
REVOKE ALL ON TABLE public.letter_generation_claims FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.letter_generation_claims TO service_role;

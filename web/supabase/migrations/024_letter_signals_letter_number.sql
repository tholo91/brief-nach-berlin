-- 024: Globale Briefnummer (Zaehlerstand bei Generierung) am Kartenbeitrag,
-- fuer spaetere Wachstumsauswertungen. Stammt aus dem signierten generationProof.
-- Apply manually in Supabase Studio SQL Editor BEFORE deploying the code change.

ALTER TABLE public.letter_signals
  ADD COLUMN IF NOT EXISTS letter_number integer;

ALTER TABLE public.letter_signals
  DROP CONSTRAINT IF EXISTS letter_signals_letter_number_check;

ALTER TABLE public.letter_signals
  ADD CONSTRAINT letter_signals_letter_number_check
  CHECK (letter_number IS NULL OR letter_number > 0);

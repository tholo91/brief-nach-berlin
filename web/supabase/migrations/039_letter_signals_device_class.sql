-- 039: Grober Gerätetyp (mobile/tablet/desktop) am freiwilligen Kartenbeitrag,
-- um auszuwerten, auf welchen Geräten Briefe entstehen. Kein User-Agent, nur die Klasse.
-- Apply manually in Supabase Studio SQL Editor BEFORE deploying the code change.

ALTER TABLE public.letter_signals
  ADD COLUMN IF NOT EXISTS device_class text;

ALTER TABLE public.letter_signals
  DROP CONSTRAINT IF EXISTS letter_signals_device_class_check;

ALTER TABLE public.letter_signals
  ADD CONSTRAINT letter_signals_device_class_check
  CHECK (device_class IS NULL OR device_class IN ('mobile', 'tablet', 'desktop'));

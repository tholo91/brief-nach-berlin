-- 021: Erlaubt den serverseitig aufgeloesten Bundeskanzler als Empfaengerart.
-- Lokal vorbereitete Migration. Vor dem Livegang separat in Supabase anwenden
-- und den Remote-Migrationsstand unabhaengig verifizieren.

ALTER TABLE public.letter_signals
  DROP CONSTRAINT IF EXISTS letter_signals_recipient_kind_check;

ALTER TABLE public.letter_signals
  ADD CONSTRAINT letter_signals_recipient_kind_check CHECK (
    recipient_kind IN ('mdb', 'mdl', 'landesregierung', 'rathaus', 'bundeskanzler')
  );

-- 041: Persönliche Aufhänger pro Kampagne ("Bist du selbst betroffen?") und zwei
-- Messsignale am freiwilligen Kartenbeitrag. Kein Inhalt der Notiz wird gespeichert,
-- nur ob eine vorhanden war und ob der Kampagnentext bearbeitet wurde.
-- Apply manually in Supabase Studio SQL Editor BEFORE deploying the code change.
--
-- personal_hooks liegt nur auf campaigns (nicht in campaign_revisions).
-- approve_campaign und der Revision-Publish überschreiben die Spalte nicht.
-- Keine neue Tabelle, daher kein REVOKE/GRANT; RLS und Rechte bleiben unverändert.

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS personal_hooks text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_personal_hooks_check;

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_personal_hooks_check
  CHECK (cardinality(personal_hooks) <= 3);

ALTER TABLE public.letter_signals
  ADD COLUMN IF NOT EXISTS has_personal_note boolean;

ALTER TABLE public.letter_signals
  ADD COLUMN IF NOT EXISTS campaign_text_edited boolean;

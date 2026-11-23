-- 043: Klartext-Admin-Link pro Kampagne (nur für den Betreiber, nur Service-Role).
-- Die Spalte bleibt bei normalen Tokens NULL. Werte werden manuell im SQL Editor
-- gesetzt, nie per Migration oder im Repo. Rechte der Tabelle bleiben unverändert
-- (008: anon, authenticated, PUBLIC ohne Zugriff).

BEGIN;

ALTER TABLE public.campaign_tokens
  ADD COLUMN IF NOT EXISTS admin_link text;

COMMENT ON COLUMN public.campaign_tokens.admin_link IS
  'Klartext-Verwaltungslink nur für den Betreiber. Nie an Seiten oder Mails ausgeben.';

COMMIT;

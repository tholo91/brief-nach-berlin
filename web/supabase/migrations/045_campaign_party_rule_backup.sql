-- 045: Partei-Regel und Ersatz-Empfänger für Bund-Kampagnen.
-- target_parties: Parteien, deren Bundestagsabgeordnete als Empfänger infrage kommen
--   (z. B. {"CDU/CSU","SPD"}). Die Werte müssen exakt den Politician.party-Strings
--   entsprechen: CDU/CSU steht kombiniert, die Grünen enthalten einen weichen
--   Trennstrich (U+00AD). Der Code ignoriert Leerzeichen und den weichen Trennstrich.
-- backup_recipient: fester Empfänger (Form wie target_recipient, plus optional "role"),
--   an den der Brief geht, wenn die PLZ keinen lokalen MdB aus der Regel hat.
-- Apply manually in Supabase Studio SQL Editor. Der Code liest die Spalten per select *
-- und toleriert fehlende Spalten, die Reihenfolge zum Deploy ist also frei.
--
-- Beide Spalten liegen nur auf campaigns (nicht in campaign_revisions).
-- approve_campaign und publishCampaignEdits schreiben explizite Spaltenlisten und
-- lassen sie unberührt (wie personal_hooks in 041).
-- Keine neue Tabelle, daher kein REVOKE/GRANT; RLS und Rechte bleiben unverändert.

BEGIN;

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS target_parties text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS backup_recipient jsonb;

ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_target_parties_require_bund;

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_target_parties_require_bund
  CHECK (target_level = 'Bund' OR cardinality(target_parties) = 0);

ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_backup_recipient_valid;

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_backup_recipient_valid
  CHECK (
    backup_recipient IS NULL
    OR (
      target_level = 'Bund'
      AND jsonb_typeof(backup_recipient) = 'object'
      AND (cardinality(target_parties) > 0 OR cardinality(target_politician_ids) > 0)
    )
  );

COMMIT;

-- Konfiguration für die Kampagne demokratiearbeit-finanzieren (NICHT automatisch
-- ausgeführt; erst nach der Migration im SQL Editor ausführen). Den Wert von
-- personName kann Thomas vorher anpassen (Briefumschlag-Konvention).
--
-- UPDATE public.campaigns
-- SET
--   target_parties = '{"CDU/CSU","SPD"}',
--   backup_recipient = jsonb_build_object(
--     'organizationName', 'Bundesministerium für Bildung, Familie, Senioren, Frauen und Jugend',
--     'personName', 'Frau Bundesministerin Karin Prien',
--     'role', 'Bundesministerin für Bildung, Familie, Senioren, Frauen und Jugend, für das Anliegen zuständig',
--     'salutation', 'Sehr geehrte Frau Bundesministerin Prien,',
--     'street', 'Glinkastraße',
--     'houseNumber', '24',
--     'postalCode', '10117',
--     'city', 'Berlin',
--     'countryCode', 'DE'
--   ),
--   updated_at = now()
-- WHERE slug = 'demokratiearbeit-finanzieren'
--   AND target_level = 'Bund';
--
-- Kontrolle (nur lesen):
-- SELECT slug, target_parties, backup_recipient
-- FROM public.campaigns
-- WHERE slug = 'demokratiearbeit-finanzieren';

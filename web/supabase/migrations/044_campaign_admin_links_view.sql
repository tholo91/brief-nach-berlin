-- 044: Lesbare Sicht auf die Admin-Links, nur für den Betreiber (Service-Role / SQL Editor).
-- Zeigt zu jedem aktiven Verwaltungslink Titel, Slug und Status der Kampagne,
-- damit man im Table Editor nicht mehr Kampagnen-IDs raten muss.
-- Die Sicht speichert nichts doppelt: Titeländerungen erscheinen sofort.

BEGIN;

CREATE OR REPLACE VIEW public.campaign_admin_links
WITH (security_invoker = true) AS
SELECT
  c.title,
  c.slug,
  c.status,
  t.admin_link,
  t.campaign_id,
  t.created_at
FROM public.campaign_tokens t
JOIN public.campaigns c ON c.id = t.campaign_id
WHERE t.kind = 'manage'
  AND t.admin_link IS NOT NULL
  AND t.used_at IS NULL
  AND t.expires_at > now();

COMMENT ON VIEW public.campaign_admin_links IS
  'Klartext-Verwaltungslinks mit Kampagnentitel, nur für den Betreiber. Nie an Seiten oder Mails ausgeben.';

REVOKE ALL ON TABLE public.campaign_admin_links FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.campaign_admin_links TO service_role;

COMMIT;

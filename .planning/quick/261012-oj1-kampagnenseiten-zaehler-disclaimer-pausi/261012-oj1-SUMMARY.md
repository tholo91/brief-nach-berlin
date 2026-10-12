---
status: complete
quick_id: 261012-oj1
date: 2026-10-12
commit: 6b20dd3
---

# Kampagnenseiten: Zähler, Disclaimer, pausiert per Link, "Weitere Kampagnen"

- `getPublicCampaignBySlug` (active + paused, approved) ersetzt `getActiveCampaignBySlug` in Seite, Kurz-Alias, OG-Bild, generate-letter und den Wizard-/Report-Actions. `getActiveCampaignBySlug` und `isEndedWhilePaused` entfernt.
- Pausierte Kampagnen: Hero per Direktlink, `robots: noindex, nofollow`, nicht in Listen (getRunningCampaigns/getLandingCampaigns unverändert). Briefzähler-SQL und Kampagnen-Meilensteine zählen weiter nur `active`.
- `PUBLIC_LETTER_COUNT_MIN = 20` in `lib/campaigns/display.ts`, genutzt in Hero, Liste und Beendet-Ansicht.
- Neuer Disclaimer im Hero, NGO-Copy zum Pausieren (Verwalten + Mail) angepasst.
- AppHeader: sekundärer Link "Weitere Kampagnen" / mobil "Kampagnen" nur auf `/kampagne/<slug>`.

## Verification
- jest: 123 Suites, 1083 Tests grün.
- Dev-Server: ehrensache-erbschaftsteuer ohne Zähler, neuer Disclaimer, Button sichtbar (Desktop + 375px). Pausierte `hitze-kostet-milliarden` erreichbar mit noindex, nicht auf /ngo-briefkampagne.
- Nicht geprüft: echter Briefversand auf einer pausierten Kampagne (nur per Unit-Test abgedeckt).

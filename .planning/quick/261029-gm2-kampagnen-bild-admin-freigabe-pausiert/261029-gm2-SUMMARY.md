---
status: complete
date: 2026-10-29
---

# 261029-gm2: Kampagnen-Bild, Admin-Freigabe, Pausiert

## Ergebnis
- Logo bleibt beim Schrittwechsel erhalten: Datei liegt im State, Submit nimmt sie von dort.
- Admin-Mail `[BnB Freigabe] <Titel>` nach erster E-Mail-Bestätigung (per `after()`), mit Inhalt, Logo und fertiger `approve_campaign`-Zeile.
- Neue Ersteller-Mail `approved` ("Deine Kampagne ist live").
- Lokaler, gitignored Skill `/kampagne-freigeben` (`list`, `beispiel`, `approve`).
- Pausiert: Titel verlinkt, Tooltip + Hinweis, Fortsetzen-Knopf (`resumeCampaignAction`), Pause-Meldung korrigiert, "schreib uns" zu "schreib mir".

## Checks
- `npx jest`: 173 Suites, 1640 Tests grün. eslint sauber, tsc ohne Fehler in `src`.

## Offen / ungeprüft
- Logo-Fix nicht im Browser getestet (Absenden würde echte Kampagne + Mail erzeugen).
- Skill `beispiel` und `approve` nicht ausgeführt; `list` lief (0 wartend).
- Admin-Mail und Live-Mail nicht real versendet.

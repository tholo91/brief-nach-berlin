# Kampagnen-Karte in der Brief-Mail zusammenführen

## Context
In Kampagnen-Mails stehen zwei Karten untereinander: „Teil der Kampagne von X … Danke dir ❤️“ und „Diese Kampagne weitertragen“ + Teilen-Buttons. Das wirkt doppelt. Ziel: eine Karte, die schön aussieht.

Entschieden (Grilling-Runde 1):
- Aufbau „Logo-Kopf“: Logo + „Kampagne von PRÜF-Demos“ als grüne Überschrift (Link zur Kampagne), darunter Zähler + Danke; feine Trennlinie; dann Teilen-Text + 4 Buttons. „Diese Kampagne weitertragen“ entfällt.
- Fallbacks: kein Logo → Kopf ohne Bild; kein Name → „Öffentliche Kampagne“; unter 25 Briefen → nur „Danke dir ❤️“ (Schwelle `CAMPAIGN_COUNT_MIN` bleibt).
- Umfang: nur HTML-Mail mit Kampagne. Normale Mails unverändert, Text-Version unverändert.

## Umsetzung (über `/gsd:quick`, Design-Check mit /frontend-design)
1. `web/src/lib/email/buildEmailHtml.ts`
   - `buildCampaignAttributionHtml` umbauen zu `buildCampaignHeaderHtml`: liefert nur den Kopf (Logo-Tabelle 40px wie bisher, Überschrift 16px Georgia `#2D5016` wie die bisherige h2, Unterzeile 13px `#4A4A4A`), ohne eigene Box. Danach Trennlinie (`border-top:1px solid #E0DCD7`, margin 14px 0).
   - Eigene `<tr>` mit der Kampagnen-Box (Zeile ~856) entfernen.
   - Im Recruit-Block (Zeile ~864): bei `data.campaign?.slug` Kopf statt `<h2>` einsetzen; sonst wie bisher `copy.shareHeading`.
   - `getRecruitCopy`, Buttons, `getFooterBannerHtml` unverändert (Kampagnen-Empfänger haben ohnehin kein Banner; MdB-Kampagnen behalten ihr Banner unten).
2. `web/src/lib/email/mailLocale.ts` (de/en/tr)
   - `campaignPart` → `campaignHeading(link, creator?)`: „Kampagne von <strong>X</strong>“ / „Öffentliche Kampagne“; en „Campaign by X“ / „Public campaign“; tr „X kampanyası“ / „Herkese açık kampanya“.
   - `campaignShareHeading` entfernen, falls nirgends mehr genutzt. `campaignCount`, `campaignThanks` bleiben.
3. Snapshot `letterEmailAdultSnapshot` bewusst aktualisieren (`npx jest -u` nur für diese Datei), Diff prüfen.

Keine Gedankenstriche in Copy (Memory-Regel).

## Verifikation
- `cd web && npx jest letterEmail` grün (Mistral gemockt, keine echten Aufrufe).
- Mail-HTML für 4 Fälle lokal rendern (Logo+Name+27 Briefe, ohne Logo, ohne Name, 8 Briefe) in Scratchpad-HTML, im Browser-Pane bei Desktop- und 375px-Breite screenshotten.
- Kurzer Check: Nicht-Kampagnen-Mail sieht unverändert aus.

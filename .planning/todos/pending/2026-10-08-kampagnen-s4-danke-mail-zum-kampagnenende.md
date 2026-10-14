---
created: 2026-10-08T13:36:32.000Z
title: "Kampagnen S4: Danke-Mail zum Kampagnenende"
area: api
severity: minor
files:
  - web/src/lib/email/sendCampaignCreatorEmail.ts
  - web/src/lib/campaigns/creatorStats.ts
  - web/vercel.json
---

> **Zurückgestellt am 2026-10-08** zugunsten der Meilenstein-Mails (`2026-10-08-kampagnen-meilenstein-mails.md`). Hinweise: S3 ist noch nicht gemerged (`creatorStats.ts` fehlt). Der `letter_signals`-Purge läuft per Supabase-`pg_cron`, nicht als Vercel-Cron. Verwalten-Tokens sind gehasht, der Versand muss pro Mail einen neuen `manage`-Token erzeugen.

## Stand 2026-10-14 (quick-261014-hhs)

Entscheidungen (Grilling 2026-10-14):
- D-01: Bestehendes ausbauen, kein Neubau. Migration 029 und 034 werden erst nach Thomas' OK angewendet.
- D-02: Formular mit drei neuen Fragen (Erwartung, gehörte Ergebnisse plus Freitext, To-Do-Aussage), Lead-Text „etwa 1 Minute“.
- D-03: Zitat-Freigabe „mit Logo und Name“ oder anonym, optionales Label („eine Initiative“ als Fallback), Live-Vorschau.
- D-04: `campaigns.created_by_founder`, Thomas setzt es im Supabase-Dashboard. Wirkung: Dankessatz in der Mail, Zeile in der Admin-Mail.
- D-05: Feedback-Berechtigung: beendet mit 10+ Briefen. Laufende Kampagnen weiter ab 500.
- D-06: Abschluss-Mail: Abschickquote ab 10 Antworten, ein großer Button „1 Minute Feedback“, Weiterempfehlung darüber, Spende nur als kleiner Textlink, großes Danke, persönlicher Absatz von Thomas ganz oben.
- D-07: Versand bleibt manuell und zweistufig (`--preview-to-me`, `--note`, `--send`), danach `ended_notified_at`. Kein Cron.
- D-08: Admin-Mail an Thomas bei „Kampagne beenden“ (`endCampaignAction`), abgelaufene Enddaten über `--list`.
- D-09: Bestand (inkl. NRV) läuft durch denselben Ablauf, bei NRV formuliert der Absatz es als Nachtrag.

Gebaut:
- Migration `web/supabase/migrations/034_campaign_end_feedback.sql` (nur Datei, nicht angewendet, braucht 029 zuerst), `MIGRATION_STATUS.md` gepflegt.
- Umfrage: `creatorSurvey.ts`, `creatorSurveyRepository.ts`, `submitCreatorSurvey.ts`, `sendCreatorSurveyAdminEmail.ts`, `CreatorSurveyForm.tsx`, `CreatorSurveyCard.tsx`, Datenschutz Abschnitt 21. Bleibt unsichtbar, bis 029 und 034 da sind (Probe auf `quote_mode`).
- Mail: `buildCampaignCreatorEmailHtml.ts` (ended), `sendCampaignCreatorEmail.ts`, Statistik-Builder in `creatorStatsView.ts` (ohne server-only), Auswahl und Versandschutz in `endedMail.ts`.
- Skript `web/scripts/send-campaign-ended-mail.ts` mit `--list`, `--preview-to-me`, `--note`, `--send`. `endCampaignAction` schickt über `sendCampaignEndedAdminNotice.ts` einen Hinweis an Thomas.

Manueller Ablauf pro Kampagne: `--list`, dann `--slug <slug> --preview-to-me`, Thomas schreibt 2-3 Sätze, `--note "..." --preview-to-me` als zweite Vorschau, nach OK `--note "..." --send` (setzt `ended_notified_at`).

Offen:
- Migration 029, dann 034 im SQL Editor anwenden (nach OK).
- `created_by_founder` im Dashboard für Kampagnen setzen, die Thomas selbst aufgesetzt hat.
- Browser-Check des Formulars bei 375 px nach den Migrationen.
- Copy aus dem SUMMARY von quick-261014-hhs freigeben.

## Stand 2026-10-09 (älter, teils überholt)

- Template `ended` (`buildCampaignCreatorEmailHtml.ts`, `sendCampaignCreatorEmail.ts`) und das Einmal-Skript `web/scripts/send-campaign-ended-mail.ts` gibt es (quick-261009-luq). Das Skript zeigt ohne `--send` nur eine Vorschau.
- Offen ist nur noch der automatische Auslöser: direkt in `endCampaignAction`, kein Cron, weil es noch keinen Vercel-Cron gibt. Dazu die Spalte `ended_notified_at`. (überholt: Versand bleibt manuell, Admin-Hinweis statt Auslöser, siehe Stand 2026-10-14)
- Die Feedback-Bitte läuft per Antwort auf die Mail (`replyTo` auf `FOUNDER_EMAIL`).
- Testimonials von NGOs pflegt Thomas später von Hand (`creatorTestimonials.ts` und ein Block auf `/ngo-briefkampagne`), sobald die erste Zitat-Freigabe da ist. Eine eigene Bewertungsseite ist bewusst nicht geplant. (überholt, siehe unten)
- Erster Versand von Hand am 2026-10-09 an die NRV-Kampagne `unterschrift-ist-kein-dienstvergehen` (90 Briefe). Anrede mit Vorname über `--name`, weil `creator_name` oft der volle Name ist.
- Das Feedback-Formular für Ersteller:innen gibt es jetzt (quick-261009-r0z): Seite `/kampagne/verwalten/feedback`, Tabelle `campaign_creator_surveys`, Migration 029 ist noch nicht angewendet (bis dahin bleibt alles unsichtbar). Der Button „1 Minute Feedback“ in der Abschluss-Mail ist erledigt (quick-261014-hhs), der Feedback-Block in der 500er-Mail ist weiter offen und nicht Teil dieses Umfangs.

### Für die schönere Version (Thomas will die Mail noch ausbauen)
- Den Empfehlungsteil wieder aufnehmen, für den ersten Versand bewusst rausgenommen: „Darf ich dich gegenüber anderen NGOs zitieren?“ und die Bitte, Initiativen auf `/ngo-briefkampagne` hinzuweisen. (erledigt: Weiterempfehlung über dem Feedback-Button, Zitat-Freigabe im Formular)
- Kopfbild: Die Bild-Route `kampagne/[slug]/meilenstein/[stufe]/bild` schreibt fest „Meilenstein“ ins Bild. Eine eigene Variante „Abschluss“ prüfen.
- Anrede: Für den Vornamen entweder ein Feld `creator_first_name` oder eine Heuristik (erstes Wort von `creator_name`). Bei Organisationsnamen keine Heuristik.
- Zahlen in die Mail selbst holen (ab Schwelle 10): Abschickquote, Sterne-Schnitt, Top-Bundesländer aus `getCampaignCreatorStats`, damit die NGO sie direkt zitieren kann, ohne die Verwaltungsseite zu öffnen. (teils erledigt: nur die Abschickquote steht in der Mail, Sterne-Schnitt und Bundesländer bleiben auf der Verwaltungsseite)
- Grußformel und handschriftliche Signatur (Caveat) wie beim ersten Versand beibehalten.
- Buttons am Ende: kein „Verwalten“ und kein „Thomas schreiben“ (seit 2026-10-09 entfernt). Zur Verwaltungsseite kommt man über „Statistiken ansehen“, Kontakt läuft über die Antwort auf die Mail. (überholt: genau ein großer Button „1 Minute Feedback“ zum eigenen Formular, Spende nur als kleiner Textlink.)

## Problem

Teil von "Kampagnen 2.0" (S4 von 5, bewusst später). Braucht S2 (`ends_at`) und S3 (`getCampaignCreatorStats`). Wenn eine Kampagne endet, bekommt der Ersteller heute nichts. Ein Danke mit Endstand schließt die Kampagne gut ab und ist ein natürlicher Moment für den freiwilligen Spendenhinweis.

## Solution

1. Auslöser ist jedes Ende: abgelaufenes Enddatum oder "Kampagne jetzt beenden" (S2 setzt `ends_at = now()`), also auch Kampagnen ohne vorher gesetztes Enddatum.
2. Täglicher Vercel-Cron (bestehendes Cron-Muster aus dem `letter_signals`-Purge übernehmen) sucht Kampagnen mit `ends_at < now()` und `ended_notified_at is null`.
3. Migration: `campaigns.ended_notified_at timestamptz null`, nach erfolgreichem Versand setzen (idempotent).
4. Brevo-Mail an `creator_email`: Danke, Endstand (Briefe, ggf. Abschickquote/Bewertung ab Schwelle 10), Link zur Verwalten-Seite, freiwilliger Spendenhinweis (Box aus S6 wiederverwenden), Kontakt `BRIEF_EMAIL`.
5. Template-Copy erst Thomas zur Freigabe zeigen. Kein echter Versand ohne explizite Freigabe.

Check: Jest für Auswahl-Query und Idempotenz; Mail-HTML als Preview rendern.

## Startprompt für neuen Chat

`/gsd-quick` Setze `.planning/todos/pending/2026-10-08-kampagnen-s4-danke-mail-zum-kampagnenende.md` um. Voraussetzung: S2 und S3 sind gemerged.

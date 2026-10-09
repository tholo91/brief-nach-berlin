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

## Stand 2026-10-09

- Template `ended` (`buildCampaignCreatorEmailHtml.ts`, `sendCampaignCreatorEmail.ts`) und das Einmal-Skript `web/scripts/send-campaign-ended-mail.ts` gibt es (quick-261009-luq). Das Skript zeigt ohne `--send` nur eine Vorschau.
- Offen ist nur noch der automatische Auslöser: direkt in `endCampaignAction`, kein Cron, weil es noch keinen Vercel-Cron gibt. Dazu die Spalte `ended_notified_at`.
- Die Feedback-Bitte läuft per Antwort auf die Mail (`replyTo` auf `FOUNDER_EMAIL`).
- Testimonials von NGOs pflegt Thomas später von Hand (`creatorTestimonials.ts` und ein Block auf `/ngo-briefkampagne`), sobald die erste Zitat-Freigabe da ist. Eine eigene Bewertungsseite ist bewusst nicht geplant. (überholt, siehe unten)
- Erster Versand von Hand am 2026-10-09 an die NRV-Kampagne `unterschrift-ist-kein-dienstvergehen` (90 Briefe). Anrede mit Vorname über `--name`, weil `creator_name` oft der volle Name ist.
- Das Feedback-Formular für Ersteller:innen gibt es jetzt (quick-261009-r0z): Seite `/kampagne/verwalten/feedback`, Tabelle `campaign_creator_surveys`, Migration 029 ist noch nicht angewendet (bis dahin bleibt alles unsichtbar). Der Button „Feedback geben“ in der Abschluss-Mail und der Feedback-Block in der 500er-Mail kommen in einem Folge-Quick-Task (Task 2 des freigegebenen Plans).

### Für die schönere Version (Thomas will die Mail noch ausbauen)
- Den Empfehlungsteil wieder aufnehmen, für den ersten Versand bewusst rausgenommen: „Darf ich dich gegenüber anderen NGOs zitieren?“ und die Bitte, Initiativen auf `/ngo-briefkampagne` hinzuweisen.
- Kopfbild: Die Bild-Route `kampagne/[slug]/meilenstein/[stufe]/bild` schreibt fest „Meilenstein“ ins Bild. Eine eigene Variante „Abschluss“ prüfen.
- Anrede: Für den Vornamen entweder ein Feld `creator_first_name` oder eine Heuristik (erstes Wort von `creator_name`). Bei Organisationsnamen keine Heuristik.
- Zahlen in die Mail selbst holen (ab Schwelle 10): Abschickquote, Sterne-Schnitt, Top-Bundesländer aus `getCampaignCreatorStats`, damit die NGO sie direkt zitieren kann, ohne die Verwaltungsseite zu öffnen.
- Grußformel und handschriftliche Signatur (Caveat) wie beim ersten Versand beibehalten.
- Buttons am Ende: kein „Verwalten“ und kein „Thomas schreiben“ (seit 2026-10-09 entfernt). Zur Verwaltungsseite kommt man über „Statistiken ansehen“, Kontakt läuft über die Antwort auf die Mail. Perspektivisch genau zwei Buttons: „♥ Unterstützen“ (Spende) und „Feedback geben“. Für „Feedback geben“ klären: Antwort auf die Mail (`mailto:` mit Betreff), `CAMPAIGN_CREATOR_FEEDBACK_URL` (heyspeak) oder später ein eigenes Formular für Ersteller:innen. Dann kann die Feedback-Box im Text kürzer werden.

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

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

---
created: 2026-10-08T13:36:32.000Z
title: "Kampagnen S3: Ersteller-Stats und Spendenkarte auf Verwalten-Seite"
area: ui
severity: major
files:
  - web/src/components/campaigns/CampaignManager.tsx:278-300
  - web/src/app/(site)/kampagne/verwalten/page.tsx
  - web/src/lib/campaigns/creatorStats.ts (neu)
  - web/src/lib/internalStats/aggregate.ts:510-570
  - web/src/lib/internalStats/getInternalStats.ts
  - web/src/lib/feedback/politicalActivation.ts
  - web/src/lib/config.ts:84-85
---

## Problem

Teil von "Kampagnen 2.0" (S3 von 5). Braucht S1 (`reviews.campaign_slug`), S2 (Beendet-Zustand) und S6 (Ersteller-Spenden-Copy). Die Verwalten-Seite zeigt heute nur "Briefe über diese Kampagne" und "Live seit". Ersteller wissen nicht, ob ihre Briefe abgeschickt werden und wie sie ankommen. Sie kennen Brief nach Berlin und die Feedback-Befragung nicht, also muss alles in ihrer Sprache und kompakt sein.

Außerdem trägt Thomas die Kosten (Feedback-Datenbank, Brevo-Mailversand, Hosting), die mit großen Kampagnen steigen. Ersteller sollen das erfahren, ohne Druck.

## Solution

Entschieden mit Thomas (2026-10-08):

1. **Daten:** `getCampaignCreatorStats(slug)` server-only in `web/src/lib/campaigns/creatorStats.ts`. Aggregations-Helper aus `internalStats/aggregate.ts` und Fetch-Muster aus `getInternalStats.ts` wiederverwenden, nicht duplizieren. Zuordnung Review → Kampagne über `reviews.campaign_slug` (aus S1, inkl. Backfill).
2. **KPIs (nur diese):**
   - Briefe geschrieben (`campaigns.letter_count`, immer sichtbar).
   - Abschickquote: `letter_sent = true` / Reviews mit gesetztem `letter_sent`.
   - Ø Bewertung (1 bis 5 Sterne), Frame "So zufrieden sind Schreibende mit ihrem Brief".
   - Gefühlte Wirksamkeit: Anteil "Ja, deutlich" + "Eher ja" unter Abschickenden, ohne "Kann ich noch nicht sagen" (`politicalActivation.ts`). Z.B. "71 % fühlen sich danach eher in der Lage, sich politisch einzubringen".
   - Immer mit "aus N Rückmeldungen".
3. **Schwelle 10:** unter 10 Rückmeldungen keine Prozent-/Sternwerte, sondern freundlicher Platzhalter mit Fortschritt, z.B. "Hier siehst du bald, wie viele ihren Brief abschicken und wie zufrieden sie sind. Noch 7 Rückmeldungen bis dahin." Plus ein Satz, woher die Zahlen kommen (Schreibende bekommen nach ihrem Brief eine kurze Frage per Mail).
4. **Kommentare:** nur `consent = true`, Rating ≥ 4, getrimmter Text > 10 Zeichen (filtert "Danke", "ist gut"), max. 5 neueste. Ohne Name, PLZ, E-Mail; Datum nur Monat/Jahr. Erst ab Schwelle 10 zeigen.
5. **Spendenkarte** unter den Stats. Wortlaut, Foto (`SUPPORT_CONTENT.founder.avatarPath`) und Buttons kommen aus `SUPPORT_CAMPAIGN_CREATOR_COPY` (S6, `support-content.ts`) und werden nicht neu formuliert. Link `DONATION_PROVIDER_URL` (WE AID). Nur auf der Verwalten-Seite, nicht auf der öffentlichen Seite.
6. Ersetzt den Stats-Strip in `CampaignManager.tsx:278-300`, funktioniert auch im Beendet-Zustand aus S2.

Design: `/frontend-design:frontend-design` + `/design-taste-frontend` laden, `.planning/brand-identity.md` lesen. Kompakt, übersichtlich, mobil zuerst. Copy ohne Gedankenstriche, Check gegen signs-of-ai-writing.

Check: Jest für Aggregation mit Fixtures (Schwelle 9/10, Kommentar-Filter, Wirksamkeit ohne "Kann ich noch nicht sagen", Kampagne ohne Reviews). Browser-Screenshots mobil + Desktop mit <10 und ≥10 Reviews, aktiv und beendet. `npm run test`, `npm run lint`, `npm run build`.

## Startprompt für neuen Chat

`/gsd-quick` Setze `.planning/todos/pending/2026-10-08-kampagnen-s3-ersteller-stats-und-spendenkarte.md` um. Voraussetzung: S1, S2 und S6 sind gemerged. Plan-Kontext: `/Users/thomas/.claude/plans/ok-ich-will-mit-hashed-reddy.md`.

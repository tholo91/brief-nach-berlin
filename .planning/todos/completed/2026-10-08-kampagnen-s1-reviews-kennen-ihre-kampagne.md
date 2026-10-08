---
created: 2026-10-08T13:36:32.000Z
completed: 2026-10-08T00:00:00.000Z
title: "Kampagnen S1: Reviews kennen ihre Kampagne (reviews.campaign_slug)"
area: database
severity: major
files:
  - web/src/lib/email/sendLetterEmail.ts:156-160
  - web/src/lib/actions/submitReview.ts:151-162
  - web/src/app/(site)/feedback/FeedbackForm.tsx:484
  - web/src/lib/actions/letterSignals.ts:71
  - web/supabase/migrations/025_reviews_campaign_slug.sql (neu)
---

## Problem

Teil von "Kampagnen 2.0" (S1 von 6, Fundament für S3 Ersteller-Stats). Ein Review weiß heute nicht, zu welcher Kampagne es gehört. Die Zuordnung klappt nur über `letter_signals.campaign_slug`. Diese Zeile entsteht nur, wenn Schreibende auf der Erfolgsseite ihr Anliegen teilen (Opt-in, `letterSignals.ts:71`). Für alle anderen Reviews fehlt die Kampagne.

Gleiches Muster wie bei `letter_signals`, nur für alle Reviews: Der Kampagnen-Slug reist im signierten Feedback-Token mit und wird beim Speichern in eine echte Spalte geschrieben. Bewusst nicht nur im `debug_payload`-Blob, weil der keinen Index und keinen Vertrag hat und bei einer späteren Bereinigung die Stats lautlos brechen würden.

Je früher das live ist, desto mehr zugeordnete Reviews liegen vor, wenn S3 kommt.

## Solution

1. Migration `web/supabase/migrations/025_reviews_campaign_slug.sql`: `reviews.campaign_slug text null` + Index. Backfill: `update reviews r set campaign_slug = s.campaign_slug from letter_signals s where s.letter_id = r.letter_id and r.campaign_slug is null and s.campaign_slug is not null`.
2. `sendLetterEmail.ts`: Feedback-Payload um `campaignSlug: campaign?.slug` erweitern, Token-Payload-Typ um `campaignSlug?: string`. Alte Tokens ohne Slug bleiben gültig.
3. `submitReview.ts` `tokenMeta`: `campaign_slug: payload.campaignSlug ?? null`. Gilt für `initial` und `full`.
4. Consent-Text (`FeedbackForm.tsx:484`) ergänzen, z.B.: "Meine Bewertung darf später anonymisiert auf brief-nach-berlin.de gezeigt werden, auch der Initiative hinter einer Kampagne." Keine Gedankenstriche.

Check: Jest-Test, dass der Feedback-Token mit Kampagne `campaignSlug` enthält und ohne nicht, und dass `submitReview` `campaign_slug` schreibt. `npm run test`, `npm run lint`, `npm run build`. Migration lokal vs. remote getrennt berichten, Remote-Anwendung nur nach Thomas' Freigabe.

Parallel zu S2 und S6 umsetzbar (S2 nutzt Migration 026).

## Startprompt für neuen Chat

`/gsd-quick` Setze `.planning/todos/pending/2026-10-08-kampagnen-s1-reviews-kennen-ihre-kampagne.md` um. Plan-Kontext: `/Users/thomas/.claude/plans/ok-ich-will-mit-hashed-reddy.md`.

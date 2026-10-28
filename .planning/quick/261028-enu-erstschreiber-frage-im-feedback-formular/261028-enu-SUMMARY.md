---
phase: quick-261028-enu
plan: 01
subsystem: feedback
tags: [feedback-form, stats, supabase-migration, datenschutz]
status: complete
requirements: [QUICK-261028-enu]
commits: 2
plan_head_before: 9b81ed3
plan_head_after: 221d477
key-files:
  created:
    - web/supabase/migrations/038_reviews_letter_history.sql
    - web/src/lib/feedback/letterHistory.ts
    - web/src/__tests__/letterHistory.test.ts
  modified:
    - web/supabase/MIGRATION_STATUS.md
    - web/src/app/(site)/feedback/FeedbackForm.tsx
    - web/src/lib/actions/submitReview.ts
    - web/src/app/(site)/datenschutz/page.tsx
    - web/src/lib/internalStats/aggregate.ts
    - web/src/lib/internalStats/getInternalStats.ts
    - web/src/app/stats/page.tsx
    - web/src/lib/campaigns/creatorStatsView.ts
    - web/src/components/campaigns/CampaignCreatorStats.tsx
    - web/src/__tests__/internalStats.test.ts
    - web/src/__tests__/campaignCreatorStats.test.ts
---

# Quick 261028-enu: Erstschreiber-Frage im Feedback-Formular Summary

Optionale Frage "Hast du schon mal einen Brief an Politiker:innen geschrieben?" plus Folgefrage im Feedback-Formular, gespeichert in `reviews.letter_history` / `reviews.prior_other_contact`, ausgewertet in /stats und (ab 10 Antworten) in der Kampagnen-Statistik.

## Commits

- `3c67e4d` Task 1: Migration 038, Formular, Server-Action, Datenschutz, Tests
- `221d477` Task 2: Aggregation, /stats-Abschnitt, Kampagnen-Statistik, Tests

## Form copy (German)

- Frage: "Hast du schon mal einen Brief an Politiker:innen geschrieben? (optional)"
- Hinweis: "Hilft mir zu sehen, ob Brief-nach-Berlin Menschen zum ersten Mal zum Schreiben bringt."
- Optionen: "Nein, das ist mein erster" / "Ja, aber nur mit Brief-nach-Berlin" / "Ja, auch schon vorher"
- Folgefrage (nur bei erster/bnb_only, animate-feedback-in): "Hattest du davor schon mal anders Kontakt zu Politiker:innen, z. B. per Mail oder Anruf? (optional)" mit "Ja" / "Nein"
- Datenschutz: "Optional: ob Sie schon einmal an Politiker:innen geschrieben oder sie anders kontaktiert haben"
- Kampagnen-Statistik: "X % hatten vor Brief-nach-Berlin noch nie einen Brief an Politiker:innen geschrieben."

## Verification

- `npx jest`: 170 suites passed, 1623 tests passed, 0 failed
- `npx tsc --noEmit`: clean for all project files. Only 5 errors remain, all in the gitignored iCloud duplicate `web/.next/types/routes.d 3.ts` (not part of this change). With that duplicate excluded via a temporary tsconfig, tsc reports no errors.
- Mistral stays mocked in all tests; no DB writes, no push, migration not applied.

## Deviations from Plan

None in scope. Decisions on open details:

- `CampaignFeedbackRow.letter_history` and `InternalReviewRow.letter_history/prior_other_contact` are optional fields, so existing fixtures (`campaignEndedMailFlow`, other tests) needed no changes; `endedMail.ts` shows nothing new.
- `firstTimeShare` is `number | null` (rounded integer percent), null below `CREATOR_STATS_MIN_RESPONSES` answers to this question (not total responses).
- Handlungsfähigkeit in /stats uses all answers with `political_self_efficacy` as base (incl. "Kann ich noch nicht sagen"), as the plan states; this differs from the existing directional card, noted in the BasisNote on the page.
- `validateLetterHistoryAnswers` is a pure function in `letterHistory.ts` and runs in both modes; the initial-mode upsert does not touch the new columns.

## Known Stubs

None.

## Open before deploy

Thomas must apply `web/supabase/migrations/038_reviews_letter_history.sql` in the Supabase SQL Editor BEFORE pushing: the full review upsert and the /stats query reference the new columns (42703 otherwise). `MIGRATION_STATUS.md` lists it as "Not yet applied".

## Self-Check: PASSED

Files and commits `3c67e4d`, `221d477` verified present.

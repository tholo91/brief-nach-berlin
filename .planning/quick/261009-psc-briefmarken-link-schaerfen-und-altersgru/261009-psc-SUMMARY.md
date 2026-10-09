---
status: complete
date: 2026-10-09
---

# 261009-psc: Briefmarken-Link schaerfen + Altersgruppe im Review

## Changes
- Letter mail step 3 (DE/EN/TR): "Briefmarke drauf (0,95 EUR, online kaufen) + ab in den Briefkasten!"; mobile drops the price. Link target unchanged (Deutsche Post mobile Briefmarke). `web/src/lib/email/mailLocale.ts`, `web/src/lib/email/buildEmailHtml.ts`.
- Optional age group in feedback form ("Wie alt bist du?", 5 groups, helper text on why). `web/src/lib/feedback/ageGroup.ts`, `FeedbackForm.tsx`, `submitReview.ts` (writes `reviews.age_group` in full mode).
- Migration `web/supabase/migrations/028_reviews_age_group.sql` (nullable text + check constraint, SELECT revoked from anon/authenticated). Listed as not applied in `MIGRATION_STATUS.md`.
- Privacy copy: `PrivacyDisclosure.tsx` and `/datenschutz` list the age group.
- Test: step-3 stamp link per locale in `emailLocalization.test.ts`.

## Verification
- Jest: 110 suites, 924 tests passed (before the added test); emailLocalization: 8/8.
- tsc: no errors in touched files (remaining errors are stale `.next/dev/types/* 3.ts` duplicates and pre-existing `campaignTopicReset.test.ts`).
- Mail rendered and inspected in browser, desktop + 375px.
- Not verified live: feedback form in browser. Opening `/feedback` with a valid token fires a silent `initial` upsert into Supabase, so it was skipped to avoid a fake review row.

## Deploy order
Run 028 in the Supabase SQL Editor before deploying, otherwise every full review submit fails on the unknown column.

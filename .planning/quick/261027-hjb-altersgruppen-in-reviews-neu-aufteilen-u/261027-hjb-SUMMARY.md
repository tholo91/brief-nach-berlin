---
phase: quick-261027-hjb
plan: 01
subsystem: feedback, internal-stats
tags: [age-group, stats, migration]
status: complete
requirements: [QUICK-261027-hjb]
key-files:
  created:
    - web/supabase/migrations/037_reviews_age_group_split.sql
    - web/src/__tests__/ageGroup.test.ts
  modified:
    - web/src/lib/feedback/ageGroup.ts
    - web/src/lib/internalStats/aggregate.ts
    - web/src/lib/internalStats/getInternalStats.ts
    - web/src/app/stats/page.tsx
    - web/src/__tests__/internalStats.test.ts
    - web/supabase/MIGRATION_STATUS.md
    - web/src/app/(site)/feedback/FeedbackForm.tsx
actuals:
  tasks: 3
  commits: 3
plan_head_before: ffe4c5c472554c35fdeb09799a345be7eb5002b0
plan_head_after: 81b310e87be0454969d164e299dbdfa984748f3c
---

# Quick 261027-hjb: Altersgruppen aufteilen und /stats "Alter"

Six age groups (unter 20, 20 bis 29, 30 bis 44, 45 bis 59, 60 bis 74, 75 oder älter) in form, validation and DB constraint (migration 037, not applied), plus a new "Alter" section on /stats with distribution and answer rate since the first age answer.

## Commits

- d47d53c: six age values, age aggregate in internalStats, Alter section with distribution (tracer)
- 6017703: answer rate (answeredSince, rateBase, rateAnswerCount, ratePercent), Antwortquote card, Definition
- 81b310e: migration 037, MIGRATION_STATUS row, six-option form grid, ageGroup.test.ts

## Verification

- Full Jest: 168 suites, 1555 tests, all passed.
- tsc: only pre-existing errors in `.next/types/routes.d 3.ts` (iCloud duplicate file); none in src.
- eslint: 0 errors on changed files; `npm run lint` shows 7 pre-existing warnings.
- `grep under_30 web/src` outside `__tests__`: clean.

## Deviations from Plan

None. Minor implementation detail: the `ageGroup` value is read into a local const in aggregate.ts so TypeScript narrows the index type.

## Known Stubs

None.

## Notes for Thomas

Run migration 037 in the Supabase SQL Editor BEFORE deploying, then deploy right away (see MIGRATION_STATUS.md). /stats selects `age_group`, which already exists from migration 028.

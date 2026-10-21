---
phase: quick-261021-oy9
plan: 01
status: complete
subsystem: stats
tags: [supabase, pagination, stats, stimmen]
commits: 1
plan_head_before: 2c5cc03
plan_head_after: 97b3878
completed: 2026-10-21
key-files:
  created:
    - web/src/lib/supabase/fetchAllRows.ts
    - web/src/__tests__/fetchAllRows.test.ts
  modified:
    - web/src/lib/internalStats/getInternalStats.ts
    - web/src/lib/reviews/getReviewStats.ts
    - web/src/lib/letterSignals/getPublicMapData.ts
    - web/src/__tests__/getReviewStats.test.ts
    - web/src/__tests__/internalStatsOutcomes.test.ts
actuals:
  tasks: 1
  commits: 1
---

# Quick 261021-oy9: Stats ohne 1000-Zeilen-Grenze

One shared `fetchAllRows` helper pages Supabase queries in 1000-row ranges (ordered by `id`) until a short page; used for reviews, letter_signals and letter_outcomes in /stats, reviews in /stimmen, and the map RPC (inline loop removed).

## Commit
- 97b3878 fix(stats): alle Zeilen laden statt 1.000er-Grenze

## Verification
- jest: fetchAllRows, getReviewStats, internalStatsOutcomes (21 tests) plus letterSignalMigration (3) pass
- tsc --noEmit: 0 errors outside .next/
- eslint: clean on the 7 files

## Deviations from Plan
None. Helper was written right after the RED test file without a separate failing run (module-missing failure is trivial). getReviewStats `totalCount` is now `data.length` as planned.

## Self-Check: PASSED

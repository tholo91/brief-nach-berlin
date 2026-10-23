---
phase: quick-261023-ilb
plan: 01
subsystem: reviews
tags: [revert, privacy, hero-reviews]
status: complete
requirements: [QUICK-261023-ilb]
key-files:
  deleted:
    - web/src/lib/reviews/fallbackReviews.ts
  modified:
    - web/src/lib/reviews/getHeroReviews.ts
    - web/src/__tests__/getHeroReviews.test.ts
    - web/scripts/delete-letter-data-by-email.ts
actuals:
  tasks: 1
  commits: 1
plan_head_before: 1d30502ced00d4effb3fb9ae7dfc7ad3cf0df7de
plan_head_after: 2556d9921c49cc1b3074b389f58edfc491f741af
completed: 2026-10-23
---

# Quick 261023-ilb: Hard-coded hero reviews removed

c8d6b18 undone exactly: the hard-coded review list is deleted, `getHeroReviews` returns `[]` on error or no featured reviews again, so the review strip hides.

## Commit
- 2556d99 `revert(reviews): feste Review-Liste entfernt, Review-Streifen blendet bei Fehler wieder aus` (local only, not pushed)

## Verification
- `npx jest getHeroReviews`: 1 suite, 5/5 tests passed
- `npx tsc --noEmit`: no errors outside `.next/`; the only errors are in the gitignored iCloud duplicate `.next/types/routes.d 2.ts` (unrelated to this change)
- `grep -rn "FALLBACK_HERO_REVIEWS\|fallbackReviews" web/src web/scripts`: no matches
- `git diff c8d6b18^ HEAD` for the 3 restored files: identical; HEAD commit contains exactly the 4 paths
- `git status --porcelain`: only ` M web/src/components/MdbLookupCard.tsx` (untouched, unstaged) plus the untracked quick-task dir

## Deviations
None.

## Residual note
c8d6b18 (with the six real reviews: first names, places, UUIDs, text) remains readable in the public git history. History was deliberately not rewritten; Thomas can decide separately on a history purge.

## Self-Check: PASSED

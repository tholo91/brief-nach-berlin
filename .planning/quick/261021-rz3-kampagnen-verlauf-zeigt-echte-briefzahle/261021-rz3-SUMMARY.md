---
phase: quick-261021-rz3
plan: 01
subsystem: campaigns
tags: [creator-stats, supabase-migration, timeline]
status: complete
commits: 0
requirements: [QUICK-261021-rz3]
key-files:
  created:
    - web/supabase/migrations/036_campaign_letter_hours.sql
  modified:
    - web/supabase/MIGRATION_STATUS.md
    - web/src/lib/campaigns/creatorStats.ts
    - web/src/lib/campaigns/creatorStatsView.ts
    - web/src/components/campaigns/CampaignCreatorStats.tsx
    - web/src/__tests__/campaignCreatorStats.test.ts
---

# Quick 261021-rz3: Kampagnen-Verlauf zeigt echte Briefzahlen

Uncommitted by instruction: all changes sit in the working tree, nothing is staged or committed.

Migration 036 adds `campaign_letter_hours` (slug, hour, letters) that `increment_letter_counters` fills exactly when `campaigns.letter_count` rises. The Verlauf counts these hour rows exactly, estimates letters from before the first hour row from earlier map signals, and falls back to today's signal timeline when the table is missing.

## What changed

- **036 migration:** table with FORCE RLS and no policies, REVOKE/GRANT like 033, `increment_letter_counters` = 026 body plus `returning slug into counted_slug` and the hour upsert (`on conflict on constraint campaign_letter_hours_pkey`), all in BEGIN/COMMIT. Signature, return value and grants of the function unchanged.
- **MIGRATION_STATUS.md:** 036 row, "Not yet applied".
- **creatorStatsView.ts:** `CampaignLetterHourRow`, `CREATOR_STATS_HOUR_COLUMNS`, `estimated?` on buckets, `buildTimeline` with `hourRows` and `letterCount` (exact counting, legacy estimation, per-bucket rounding), optional `hourRows` on `buildCampaignCreatorStats` (the ended-mail script compiles unchanged).
- **creatorStats.ts:** `loadHourRows` and `loadSignalRows` via `fetchAllRows` (signals now ordered by `id`, paged); errors logged without slug.
- **CampaignCreatorStats.tsx:** estimated bars lighter (`bg-waldgruen/60` peak, `bg-waldgruen/20 group-hover:bg-waldgruen/35` others), "ca." in tooltip and peak summary, one note line "Hellere Balken sind hochgerechnet aus den Briefen mit Kartenfreigabe." only when estimated buckets exist.
- **Tests:** 87 -> 95 in `campaignCreatorStats.test.ts` (hour/day/week exact counting, fallback, loader shape and fallback, end to end, mixed legacy + exact with "ca." peak, rounding, no-estimate cases).

## Deviations from Plan

- **Commits skipped:** Both task commits were not made (uncommitted by instruction).
- **Tasks 1 and 2 implemented in one pass in `buildTimeline`:** The legacy estimation lives in the same function as the exact path, so it was written together. Task 2 tests were added after the implementation, so they were not seen failing first (RED) as TDD asks. Task 1 tests were run RED first (10 failing) and went green with the implementation.
- **Not run:** `npm run build` (not requested in the constraints).

## Verification (from web/)

- `npx jest src/__tests__/campaignCreatorStats.test.ts`: 95 passed, 0 failed
- Full `npx jest`: 148 suites passed, 1408 tests passed, 0 failed
- `npx tsc --noEmit -p .`: exit 0
- `npm run lint`: FAILED overall (1 error, 7 warnings), all pre-existing in untouched files: error `@typescript-eslint/no-require-imports` in `src/__tests__/lastcallSender.test.ts:58`; the rest are warnings elsewhere. `npx eslint` on the touched components, lib/campaigns and the test file: clean.
- Static migration checks (grep gates from the plan): all pass, no `create policy`. SQL was not executed anywhere.
- No em dashes in the added code or the migration.

## Thomas's manual steps, in order

1. Check the database size in the Supabase dashboard (Free tier, 500 MB).
2. Run `web/supabase/migrations/036_campaign_letter_hours.sql` in the SQL Editor BEFORE deploying.
3. Read-only checks:
   - `select relrowsecurity, relforcerowsecurity from pg_class where oid = 'public.campaign_letter_hours'::regclass;` (expect true, true)
   - `select has_table_privilege('anon', 'public.campaign_letter_hours', 'select'), has_table_privilege('authenticated', 'public.campaign_letter_hours', 'select'), has_table_privilege('service_role', 'public.campaign_letter_hours', 'select');` (expect false, false, true)
   - `select pg_get_functiondef('public.increment_letter_counters(text)'::regprocedure) like '%campaign_letter_hours%' and pg_get_functiondef('public.increment_letter_counters(text)'::regprocedure) like '%ends_at%';` (expect true)
4. Deploy, then update the 036 row in `MIGRATION_STATUS.md`.

## Verification gaps and risks

- The SQL is unexecuted (no local Postgres). Production behavior is unverified until the first letter after the migration.
- Known approximation: letters in the cutover hour from before the migration count as legacy but are spread over earlier signals.
- Before 036 is applied the page looks as today (fallback, error logged).

## Follow-up options (not done)

- The timeline is still gated on 10 map signals and sits in the origin section.
- Public EXECUTE on `increment_letter_counters` (T-rz3-03, pre-existing).
- The reviews loader still reads a single 1000-row response.

## Known Stubs

None.

## Threat Flags

None beyond the plan's threat model.

## Self-Check: PASSED

All six files exist and the tests above passed. No commit hashes to check (uncommitted by instruction).

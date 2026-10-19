---
phase: quick-261019-uim
plan: 01
subsystem: rueckmeldung
tags: [rueckmeldung, letter_outcomes, stats, supabase-migration]
requires: [033_letter_outcomes]
provides: [letter_outcomes.reply_feeling, outcomeAnswersSchema.replyFeeling, /stats reply_feeling block]
affects: [web/src/app/(site)/rueckmeldung, web/src/app/stats]
tech-stack:
  added: []
  patterns: [reused Question/Choices/SurveyDistributionBars, named re-runnable CHECK constraints]
key-files:
  created: [web/supabase/migrations/035_letter_outcomes_reply_feeling.sql]
  modified:
    - web/supabase/MIGRATION_STATUS.md
    - web/src/lib/rueckmeldung/schema.ts
    - web/src/lib/actions/submitOutcome.ts
    - web/src/app/(site)/rueckmeldung/RueckmeldungForm.tsx
    - web/src/__tests__/outcomeAction.test.ts
    - web/src/lib/internalStats/outcomes.ts
    - web/src/app/stats/page.tsx
    - web/src/__tests__/internalStatsOutcomes.test.ts
decisions:
  - "reply_feeling is nullable and letter_outcomes_completed_branch is untouched so older completed rows stay valid"
  - "Server nulls replyFeeling in the RPC payload whenever there is no reply, so progress saves cannot trip the DB needs-reply CHECK"
status: complete
plan_head_before: a1617bf352d3b695002402ab36935e75a3ea0f7e
plan_head_after: 2ca0c359b1b7ec97f7b36e43d258f0b84d8d39bf
actuals:
  tokens: 14000
  tasks: 2
  commits: 2
completed: 2026-10-19
---

# Quick 261019-uim: Rückmeldeformular "Wie war die Reaktion für dich?"

Required follow-up question shown only after a real reaction, stored in new nullable `letter_outcomes.reply_feeling`, validated server-side, and shown on /stats with a per-concreteness cross-tab.

## Manual step for Thomas (BEFORE deploying)

Run `web/supabase/migrations/035_letter_outcomes_reply_feeling.sql` in the Supabase SQL Editor. /stats selects the new column `reply_feeling`; until the migration is applied that select fails with 42703. The migration is re-runnable (named constraints, drop-then-add). No agent ran it; `MIGRATION_STATUS.md` lists it as "Not yet applied".

## Commits

- 18d63c1 feat(quick-261019-uim): Rückmeldeformular fragt, wie die Reaktion für dich war (migration, schema, action, form, action tests)
- 2ca0c35 feat(quick-261019-uim): /stats zeigt die Verteilung zu "Wie war die Reaktion für dich?" (aggregation, stats block, stats tests)

## What changed

- Migration 035: column, `letter_outcomes_reply_feeling_allowed`, `letter_outcomes_reply_feeling_needs_reply`, `submit_letter_outcome` identical to 033 plus one `reply_feeling = ...` line (verified by diff), same REVOKE/GRANT.
- Action: full submit rejects a reply without feeling and a feeling without reply; RPC payload nulls the feeling for not-sent, no channel, or "none".
- Form: new question after "Wurde auf dein Anliegen eingegangen?", counted in progress (8 questions with reply), reset together with `replyAddressed`.
- /stats: distribution bars (base = non-null answers), one line per concreteness level with total > 0, hint "Frage seit 19.10.2026, frühere Rückmeldungen ohne Angabe."

## Verification

- `npx jest`: 143 suites, 1308 tests passed.
- `npx eslint` on all touched TS/TSX files: clean.
- `npm run build`: succeeded.
- New copy contains no em or en dash.

## Deviations from Plan

None - plan executed as written. The pre-commit "protected branch" assertion was skipped on purpose because the orchestrator specified sequential execution on `main`.

## Pre-existing issues (not touched)

- `npx tsc --noEmit -p .` reports TS6200/TS2300 only in iCloud duplicate files under `.next/types/` (`cache-life.d 2.ts`, `routes.d 3.ts`, ...). None in touched files.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

Created/modified files exist; commits 18d63c1 and 2ca0c35 are ancestors of HEAD.

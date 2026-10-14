---
phase: quick-261014-iuq
plan: 01
subsystem: internal-stats
tags: [stats, letter_outcomes, rueckmeldung, briefweg]
requires: [letter_outcomes table (migration 033)]
provides: [/stats section "Nach dem Brief", aggregateOutcomes, formatShare]
affects: [web/src/app/stats/page.tsx]
key-files:
  created:
    - web/src/lib/internalStats/outcomes.ts
    - web/src/components/internalStats/Briefweg.tsx
    - web/src/__tests__/internalStatsOutcomes.test.ts
  modified:
    - web/src/lib/rueckmeldung/cohort.ts
    - web/src/lib/internalStats/getInternalStats.ts
    - web/src/lib/internalStats/view.ts
    - web/src/app/stats/page.tsx
decisions:
  - "Counting: mail click decides main question, completed form overrides, details only from completed forms (D-03)"
  - "formatShare switches from 'x von y' to 'z % (n = y)' at base 30 (D-04)"
  - "Test addresses excluded in the query via .not('email','in',list); email column never selected (D-03, D-08)"
metrics:
  tasks: 3
  commits: 2
status: complete
commits: 2
plan_head_before: 09dee39cc4ba870bbf55f45c2fdec91072273961
plan_head_after: 08523ab5feac68580b86a4fc50df4f61121756f0
actuals:
  tokens: 45000
  tasks: 3
  commits: 2
completed: 2026-10-14
---

# Phase quick-261014-iuq Plan 01: Stats-Sektion "Nach dem Brief" Summary

New /stats section "Nach dem Brief" between Feedback and Wirkung, fed by a fifth query on `letter_outcomes`, with the airmail-style Briefweg funnel, daily return chart, four open detail blocks and a closed "Alle Antworten" collapsible.

## Commits

- 8ecefa7: feat(quick-261014-iuq): Rückmeldungen laden und aggregieren (letter_outcomes, formatShare) (Task 1)
- 08523ab: feat(quick-261014-iuq): Sektion Nach dem Brief auf /stats mit Briefweg-Grafik (Task 2)
- Task 3 (gates) produced no code changes, so no commit.

## Gates

- `npm run test`: 141 suites, 1272 tests passed (new file: 14 tests).
- `npm run build`: passed.
- `npm run lint`: 1 error, 7 warnings, all pre-existing and outside this plan (see below). Touched files lint clean.
- `tsc --noEmit`: clean.

## Deviations from Plan

None in behavior. Small implementation notes:
- `OUTCOME_ROW_COLUMNS` const added to outcomes.ts so the 16 selected columns have one source (select string and row type stay in sync).
- `DetailBlock` / `OutcomeRoundBlock` helper components added in page.tsx to keep the section JSX readable; the section itself opens with `<Section id="nach-dem-brief" accent="rot">` as specified.
- Group-comparison label in the UI reads "Gefühl, sich politisch einbringen zu können" instead of a first-person question, to avoid reading as the author's voice.

## Pre-existing failures (not fixed, out of scope)

- `npm run lint`: error `@typescript-eslint/no-require-imports` at `web/src/__tests__/lastcallSender.test.ts:58:8` (file untouched by this plan). 7 other warnings in unrelated files (beispiele/page.tsx, wahlkreisbuero-oder-berlin/page.tsx, PromptCopyBlock.tsx, Step1Form.tsx, fetchMdbContext.ts, others).

## Known risks / open items

- The reviews query in getInternalStats still has no pagination (silent 1000-row default); intentionally unchanged, the self-efficacy review comparison depends on it.
- 322 zugestellt is a fixed value from the Brevo report (`LASTCALL_DELIVERED_COUNT`), not read from the database.
- Migration 033 read-only verification is still open per MIGRATION_STATUS.md.
- Browser verification at 375px and desktop (closed "Alle Antworten", no email in HTML) is pending with the orchestrator.
- All four detail blocks will show the "kleine Basis" badge for now (base below 30), as designed.

## Known Stubs

None.

## Threat Flags

None. The only new data surface is the service-role read of `letter_outcomes` (non-email columns) on the already password-gated /stats page, as covered by T-261014iuq-01 to -05.

## Self-Check: PASSED

Files exist (outcomes.ts, Briefweg.tsx, internalStatsOutcomes.test.ts); commits 8ecefa7 and 08523ab are ancestors of HEAD; git status shows only the quick-task directory untracked.

## Orchestrator follow-up (browser check)

- Browser check on localhost `/stats` (desktop + 375px): section renders between Feedback and Wirkung, no horizontal overflow, "Alle Antworten" closed by default, no email address in the HTML.
- Found: the review self-efficacy question only exists since 2026-09-06 (412 answers, 0 before the 12.08. cutoff), so the planned comparison group was empty. Thomas decided: compare with all answered reviews, label "Reviews seit 06.09.2026". `reviewCutoffUtc` removed from `OutcomeRound`; `selfEfficacy.reviewsSince` added.
- Bar rows now show only the percent from n>=30 (`formatBarShare`), the base appears once under each list (`shareBaseNote`).
- Commit: 914b37f. Full suite 141/1273 green, build green.

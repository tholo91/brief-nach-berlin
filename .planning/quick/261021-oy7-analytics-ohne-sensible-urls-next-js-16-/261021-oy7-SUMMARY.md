---
phase: quick-261021-oy7
plan: 01
subsystem: analytics, deps, ci
tags: [privacy, vercel-analytics, next-16.4.2, github-actions]
status: complete
commits: 3
plan_head_before: 8cd4b97
plan_head_after: 2c5cc03
actuals:
  tasks: 3
  commits: 3
---

# Quick 261021-oy7: Analytics ohne sensible URLs, Next.js 16.4.2, CI

Vercel Analytics `beforeSend` drops token/PII routes and sends only origin+pathname; Next.js bumped to 16.4.2 (exact pins); GitHub Actions runs tsc + jest on push/PR.

## Commits

| Task | Hash | Subject |
|------|------|---------|
| 1 | a3888c1 | fix(analytics): keine sensiblen URLs an Vercel Analytics |
| 2 | b406d41 | chore(deps): Next.js 16.4.2 |
| 3 | 2c5cc03 | ci: Typecheck und Tests bei jedem Push |

## Verification

- Task 1: new cases failed first (11 of 14), then 14/14 pass; eslint clean on changed files.
- Task 2: package.json diff = 2 lines (next, eslint-config-next). Top-level sharp stays 0.34.5; nested `node_modules/next/node_modules/sharp` 0.35.5 added (as expected). tsc clean apart from iCloud `.next/* 4.ts` duplicates. Full jest 147 suites / 1390 tests green. `next build` PASS.
- Task 3: workflow parsed (js-yaml) and structure checked; no secrets/eslint/pull_request_target. Clean clone of HEAD: `npm ci` ok, `tsc` exit 0, scrubbed-env jest (`TZ=UTC CI=true`, no .env.local) 147 suites / 1390 tests green.

## Deviations from Plan

**1. [Rule 3 - Blocking] Pre-existing TS error in recipientSelectionHardening.test.ts**
- Found during: Task 1 verify (tsc), blocked `next build` in Task 2 and would turn CI red from day one.
- Issue: `Parameters<typeof createGenerationProof>[0]["recipient"]` fails because the parameter is `string | {...}` (introduced by 4c6d2e2, after the planning baseline).
- Fix: `Exclude<Parameters<typeof createGenerationProof>[0], string>["recipient"]` (type only, one line).
- Commit: 2c5cc03 (included in the ci commit, not a separate fourth commit; body says so). Notable: HEAD before this fix failed `next build`/tsc, which likely also affects the Vercel build of main.

## Open gaps

- Vercel script referrer field is not passed through beforeSend and is not cleaned (T-261021-oy7-02, accepted).
- No intercepted local browser check done.
- Other points of todo 2026-10-13 (debug link transport, paused campaigns, Brevo texts) stay open; todo file untouched.
- CI proven locally on Node 26.11.1 and UTC; Node 20 on GitHub unproven until the first run. Nothing pushed.

## Self-Check: PASSED

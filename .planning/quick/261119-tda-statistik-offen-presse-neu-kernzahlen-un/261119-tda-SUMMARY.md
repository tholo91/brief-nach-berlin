---
phase: quick-261119-tda
plan: 01
subsystem: stats
tags: [stats, kernzahlen, press, quote-carousel, design]
requires: []
provides:
  - buildKeyFigures / keyFigureQuoteLines (single source for the five Kernzahlen)
  - KeyFigures strip component shared by public page and press dashboard
  - PublicStatsLanding, QuoteCarousel, pickSpreadQuotes
affects: [web/src/app/stats/page.tsx, getPressStats, public stats cache]
key-files:
  created:
    - web/src/lib/internalStats/keyFigures.ts
    - web/src/components/internalStats/KeyFigures.tsx
    - web/src/components/internalStats/PublicStatsLanding.tsx
    - web/src/lib/reviews/pickSpreadQuotes.ts
    - web/src/components/reviews/QuoteCarousel.tsx
    - web/src/__tests__/statsKeyFigures.test.ts
    - web/src/__tests__/statsQuotes.test.ts
  modified:
    - web/src/lib/internalStats/getInternalStats.ts
    - web/src/lib/internalStats/publicTeaser.ts
    - web/src/components/internalStats/PressStatsDashboard.tsx
    - web/src/app/stats/page.tsx
    - web/src/__tests__/internalStatsOutcomes.test.ts
  removed:
    - web/src/__tests__/internalStatsPublicTeaser.test.ts (replaced by statsKeyFigures.test.ts)
status: complete
commits: 3
plan_head_before: feba4ced86ce015cfe6772d9082b1d230e22303c
plan_head_after: d68fee216a2d33d426715150e0b361ff3f1f6b34
actuals:
  tokens: 60000
  tasks: 3
  commits: 3
completed: 2026-11-19
---

# Phase quick-261119-tda Plan 01: Statistik offen und Presse neu (Kernzahlen) Summary

One shared Kernzahlen strip (letter total, first-timers, handlungsfähig, würden wieder schreiben, Ø-Bewertung) now leads both the logged-out /stats page and the press dashboard; the open page gains a month-spread quote carousel and the press view regroups the Nachbefragung.

## Commits

- e275e63 feat(stats): Kernzahlen-Streifen auf der offenen Statistikseite (Task 1, tracer)
- e486ceb feat(stats): Stimmen-Karussell auf der offenen Statistikseite (Task 2)
- d68fee2 feat(stats): Presseansicht mit Kernzahlen und neu gruppierter Nachbefragung (Task 3)

## Design direction (design-taste-frontend, app-screen reading)

Calm "Jahresbericht" in the brand look, applied identically in all three tasks:
- Creme ground, waldgrün-dark ink; big numbers in font-typewriter with tabular-nums (letter total 5xl/7xl, shares 3xl/5xl), long text in font-body.
- Airmail red/blue only as one thin diagonal stripe above the strip; no other accent color, no icons, no charts in the strip.
- Tiles separated by a tone step (waldgrün 6 %), not by borders or shadows; whitespace carries the hierarchy; label and base note ("aus N Antworten ...") under each value.
- Container-query grid (1 column on phone, 2 on the 768 px public page, 4 in the press view); quote card on a white paper surface, handwriting font only for the quote mark.
- The skill's full draw/inspect run was not used: the repo's brand guide fixes palette and type, and the plan prescribes the direction. Screenshot loop was done by hand (see below).

## What was built

- keyFigures.ts: pure `buildKeyFigures` (sources locked per field in comments; unfiltered; shares null below 30; rating null below 30; JSON-serializable) and `keyFigureQuoteLines`.
- getPressStats: loads rows and getReviewStats in parallel, returns `keyFigures` from unfiltered stats (reuses `stats` for the default filter). getInternalStats and getInternalStatsWithBaseline untouched.
- publicTeaser.ts: `getPublicStatsTeaser` (cache key public-stats-teaser-v3, daily) and `getPublicStatsQuotes` (public-stats-quotes-v1, daily; empty result throws inside the cache so it is not cached, error is logged by message only and [] returned). getPublicReviews unchanged (consent filter and 5-column select intact, grep-gated).
- Public /stats order: kicker, H1, intro, Kernzahlen, "Was Schreibende sagen" carousel, Zugang box, password form. Old send-rate and topic tiles removed.
- QuoteCarousel: client component, no library, aria-roledescription/aria-label, aria-live polite, arrow keys, 44x44 buttons, "n von N", no autoplay, plain-text body.
- Press dashboard: strip with "Zahlen zitieren" (now includes activation numbers) and "Abmelden" in the header, filter note, topics then weekly, visible "Was die Nachbefragung zeigt" with the newest round open ("Erste Werte" badge and note), "Frühere Runden" collapsed (only if any), bias note on the October cohort, "Versandangaben" disclosure without the first-timer cell.

## Verification (real output)

- `npx jest` (full): `Test Suites: 192 passed, 192 total; Tests: 1879 passed, 1879 total; Snapshots: 19 passed`.
- `npx tsc --noEmit`: clean (exit 0, no output).
- `npm run lint`: `✖ 9 problems (0 errors, 9 warnings)`, all pre-existing in other files (none in new or changed files).
- `npm run build` (Turbopack): fails before compiling with `Error: Could not find the Next.js package (next/package.json) ... Resolved from: .../stats-redesign/web/src/app`. Cause: `web/node_modules` is a symlink to the main checkout, so Turbopack cannot resolve it (worktree artifact, not code).
- `npx next build --webpack`: `Compiled successfully in 16.8s`, `Finished TypeScript in 10.2s`, then `Error: Failed to collect configuration for /kampagne ... [cause]: Error: supabaseUrl is required.` This is the env-only prerender failure the plan anticipates.
- Scope check: `git diff --stat main...HEAD` for `web/src/app/stats/intern/**`, `SectionNav.tsx`, `outcomes.ts` is empty. Nothing pushed.

## Screenshots

Taken through a TEMPORARY fixture route (invented data, no Supabase import), now deleted and never committed. Viewport was emulated through Chrome DevTools (a plain headless window clamps to 500 px). `scrollWidth` equals viewport at both widths (no horizontal scroll).
- /private/tmp/claude-501/-Users-thomas--claude-spares-spare-VVu3hn/efb2684e-6e1a-4be4-a912-6db2e3851abc/scratchpad/final-375.png (public page then press view, 375 px)
- /private/tmp/claude-501/-Users-thomas--claude-spares-spare-VVu3hn/efb2684e-6e1a-4be4-a912-6db2e3851abc/scratchpad/final-1280.png (same, 1280 px)

Keyboard and a11y checked in the browser: carousel region is focusable (tabIndex 0), ArrowRight/ArrowLeft move and wrap ("2 von 6", "6 von 6"), both buttons 44x44, aria-live polite, "Versandangaben" details toggles open. The dev server (webpack mode, port 3107) and a helper static server were stopped; `web/.next/dev` removed.

## Deviations from Plan

**1. [Rule 3 - Blocking] Fixture route location.** The plan puts it at web/src/app/stats/fixture-tmp, but `/stats/layout.tsx` renders Footer which imports a Supabase client that throws without env. The temporary route lived at web/src/app/fixture-tmp instead (no stats header/footer in the screenshots). Deleted before commit.

**2. [Rule 3 - Blocking] Dev server in webpack mode.** `next dev` (Turbopack) fails in this worktree because of the symlinked node_modules; used `next dev --webpack` for screenshots only.

**3. [Rule 1 - Bug, test hygiene] internalStatsOutcomes.test.ts.** getPressStats now calls getReviewStats, which logged a console error against the old Supabase mock. Added a `getReviewStats` mock to that test file (3 lines). No behavior change.

**4. Visual tweak after screenshots.** Smaller tile padding and value size on phones, smaller quote mark and card min-height (first version overlapped the quote text and left a large empty card). Included in the Task 3 commit.

TDD note: tests and implementation were written together per task and went green together; a red run was not observed separately.

## Known Stubs

None.

## Threat Flags

None. No new endpoints, auth paths or columns. T-261119-01..06 mitigations are in place: null below base 30, getPublicReviews unchanged (grep gate), no dangerouslySetInnerHTML (grep gate), daily caches with throw-on-empty, getPressStats keeps PRESS_OUTCOME_ROW_COLUMNS, fixture route deleted.

## BLOCKERS for the orchestrator

- BLOCKER: real-data preview of /stats (logged out at 375 px and desktop, press view logged in) needs env; not done here.
- BLOCKER (env-only): production build cannot finish prerender without Supabase env (`supabaseUrl is required` at /kampagne). Compile and TypeScript pass in webpack mode.
- Note: `npm run build` with Turbopack does not work inside this worktree because node_modules is a symlink; it should work in a normal checkout.

## Self-Check: PASSED

Files exist: keyFigures.ts, KeyFigures.tsx, PublicStatsLanding.tsx, pickSpreadQuotes.ts, QuoteCarousel.tsx, both new test files. Commits e275e63, e486ceb, d68fee2 are ancestors of HEAD; fixture route absent; `git status` shows only the untracked .planning directory.

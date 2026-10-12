---
phase: quick-261012-pnq
plan: 01
subsystem: ui
tags: [landing, success-page, map, contribution-map]
requires: []
provides:
  - "LetterActivityCard `expandable` opt-in prop (trigger, Vergrößern badge, ContributionMapDialog)"
affects: [landing page, success page, /stimmen]
tech-stack:
  added: []
  patterns: ["opt-in prop for a shared card instead of a wrapper component"]
key-files:
  created: []
  modified:
    - web/src/components/letter-signals/LetterActivityCard.tsx
    - web/src/components/HowItWorksWithExample.tsx
    - web/src/components/FAQ.tsx
    - web/src/components/wizard/LetterSignalCard.tsx
    - web/src/__tests__/contributionMapZoom.test.ts
    - web/src/__tests__/landingPageContent.test.ts
key-decisions:
  - "Dialog header on the landing counts plotted contributions (totalContributions), not letterCount"
duration: ~10min
completed: 2026-10-12
status: complete
commits: 2
plan_head_before: c60e604
plan_head_after: 01282e8
actuals:
  tokens: 6000
  tasks: 2
  commits: 2
---

# Phase quick-261012-pnq Plan 01: Karte vergrößern nur auf der Landing Page Summary

The tap-to-enlarge map now lives only on the landing page (opt-in `expandable` prop on LetterActivityCard); the success page map is a plain display again, and /stimmen stays static.

## Commits

- 7659031: Task 1, landing cards get trigger + dialog via `expandable`; HowItWorksWithExample and FAQ pass it, /stimmen does not
- 01282e8: Task 2, LetterSignalCard restored byte-identical to `97fb5d9^`; test locks in the removal

## Verification

- Full Jest: 123 suites, 1088 tests passed
- tsc: 0 errors in src; 6 errors only from pre-existing Finder duplicate files in `.next/types` (`routes.d 2.ts`, `cache-life.d 2.ts`), untouched
- eslint on the four touched components: clean
- `git diff 97fb5d9^ -- LetterSignalCard.tsx` empty (byte-identical)

## Deviations from Plan

None - plan executed exactly as written. The tracer gate was satisfied by re-running the automated verify (passed).

## Open point for Thomas

On the landing card, the headline counts all letters (`letterCount`), while the dialog header counts map contributions (`totalContributions`). The two numbers differ. Dialog left untouched per D-04.

Manual check (not done): `/` at 390px (HowItWorks map tab) and 1280px (FAQ column) shows the "Vergrößern" badge at the map corner and opens the large view; success page and /stimmen maps are static.

## Known Stubs

None.

## Self-Check: PASSED

- 7659031 and 01282e8 exist on main
- All six files_modified changed; unrelated dirty files (stats, duplicateLetters) and `.claude/worktrees/` not staged

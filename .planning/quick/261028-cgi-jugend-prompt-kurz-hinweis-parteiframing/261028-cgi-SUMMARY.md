---
phase: quick-261028-cgi
plan: 01
subsystem: letter-generation
tags: [prompt, youth, mistral, jest]
requires: []
provides:
  - "Jugend-System-Prompt ohne Partei-Werte-Sprache (YOUTH_PARTEI_HEADER)"
  - "Jugend-Kurzhinweis (YOUTH_SHORT_INPUT_HINWEIS)"
  - "Frei formulierter Unterrichtsprojekt-Satz im Jugend-Block"
affects: [web/src/lib/generation/generateLetter.ts]
key-files:
  modified:
    - web/src/lib/generation/generateLetter.ts
    - web/src/__tests__/generateLetterYouthPrompt.test.ts
    - web/src/__tests__/__snapshots__/generateLetterYouthPrompt.test.ts.snap
decisions:
  - "Jugend-Ersetzung nutzt das bestehende .replace-Muster auf BUND_PARTEI_HEADER/BUND_PARTEI_LIST; auf bereits neutralen Zweigen No-op"
metrics:
  tasks: 2
  completed: 2026-10-28
status: complete
estimate:
  tokens: 30000
actuals:
  tokens: 6000
  tasks: 2
  commits: 2
plan_head_before: 1af62cbf8b76a6ca57118acaad8802d4556cee03
plan_head_after: 8c3780b7acf56ad4c133a6aba8c11a1067c9c912
commits: 2
---

# Phase quick-261028-cgi Plan 01: Jugend-Prompt schärfen Summary

Im Jugendmodus entfällt die Partei-Werte-Sprache im System-Prompt, kurze Eingaben bekommen einen konkreten statt abstrakten Hinweis, und der Unterrichtsprojekt-Satz ist frei formulierbar und ohne "im Rahmen".

## Commits

- 8fce589: feat(quick-261028-cgi): Jugend-System-Prompt ohne Partei-Werte-Sprache
- 8c3780b: feat(quick-261028-cgi): Jugend-Kurzhinweis und freier Unterrichtsprojekt-Satz

## Final prompt text

YOUTH_PARTEI_HEADER:

```
PARTEI-NEUTRALITÄT (Jugendbrief):
Bleibe sachlich und beim Anliegen aus dem <transkript>. Verwende keine parteibezogene Werte-Sprache.
```

YOUTH_SHORT_INPUT_HINWEIS (unter 200 Zeichen, nur mit youth):

```
<hinweis>
Die schreibende Person hat sich kurz gehalten. Bleibe einfach und konkret bei dem, was im <transkript> steht. Erfinde keine Erlebnisse, keine Angaben zur Person und keine Orte dazu.
</hinweis>
```

viaClassLink-Zeile in `<absender_jugend>`:

```
- Erwähne beiläufig und in eigenen Worten, dass ich den Brief in einem Unterrichtsprojekt schreibe. Formuliere diesen Satz frei, damit Briefe aus derselben Klasse an dieselbe Person nicht gleich klingen.
```

## Verification

- `npx jest generateLetterYouthPrompt generateLetterAdultRegression generateLetterLevelPrompt generateLetterVariantPrompt letterEmailYouth youthClient jungEntry --ci`: 7 suites, 90 tests, 12 snapshots passed.
- Adult snapshots (`generateLetterAdultRegression`, `letterEmailAdultSnapshot`) unchanged against 1af62cb.
- `git diff --stat 1af62cb -- web/src/__tests__/__snapshots__/`: only `generateLetterYouthPrompt.test.ts.snap`, 3 insertions, 3 deletions (the three "Klassenlink true" snapshots, Unterrichtsprojekt line only).
- `npx tsc --noEmit`: no errors in `src/`. Errors only in `.next/types/routes.d 3.ts` (iCloud duplicate of a gitignored generated file), pre-existing and unrelated.

## Deviations from Plan

None. The plan was executed as written. `-u` was used only for `generateLetterYouthPrompt`.

## Known Stubs

None.

## Self-Check: PASSED

Commits 8fce589 and 8c3780b exist on main. The three modified files exist. Not pushed.

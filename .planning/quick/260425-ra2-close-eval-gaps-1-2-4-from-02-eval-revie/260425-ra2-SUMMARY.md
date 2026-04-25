---
status: complete
phase: quick-260425-ra2
plan: 01
subsystem: core-engine
tags: [observability, testing, eval, langfuse, jest, word-count]
requirements_closed: [EVAL-GAP-01, EVAL-GAP-02, EVAL-GAP-04]
key_decisions:
  - "jest.config.js over jest.config.ts: ts-jest preset resolution fails inside .ts config due to jest-resolve's findNodeModule not accepting absolute paths; .js config avoids the chicken-and-egg"
  - "langfuse usage cast via `any`: Mistral SDK usage type doesn't structurally match Langfuse's IngestionUsage; cast is safe because the shape is compatible at runtime"
  - ".env.example force-added: project .gitignore has .env* glob; template file with no secrets is safe to track"
  - "Pre-existing lint errors in Step2Issue.tsx and Step3Success.tsx left untouched per deviation scope boundary rule"
metrics:
  duration: "~45 min"
  completed: "2026-04-25"
  tasks_completed: 3
  tasks_total: 3
  commits: 3
key_files:
  created:
    - web/jest.config.js
    - web/jest.setup.ts
    - web/src/__tests__/fixtures/plz-politician-cases.json
    - web/src/__tests__/plzLookup.test.ts
    - web/src/lib/observability/langfuse.ts
    - web/.env.example
  modified:
    - web/package.json
    - web/package-lock.json
    - web/src/lib/types/wizard.ts
    - web/src/lib/generation/generateLetter.ts
    - web/src/lib/actions/submitWizard.ts
---

# Quick Task 260425-ra2: Close Eval Gaps 1, 2, 4 Summary

Closed three observability gaps identified in 02-EVAL-REVIEW.md: word-count logging (EVAL-GAP-01), PLZ lookup regression tests + fallback logging (EVAL-GAP-02), and Langfuse production tracing (EVAL-GAP-04). All changes are additive — no existing behavior was altered.

## Tasks

### T1: Jest setup + 10-case PLZ lookup fixture suite (EVAL-GAP-02 tests)
- Installed jest@29.7.0, ts-jest@29.4.9, @types/jest@29.5.14
- Created `jest.config.js` (`.js` not `.ts` — see deviation below) with ts-jest transform and `@/*` alias resolver
- Created `plz-politician-cases.json` with 10 fixtures verified against `plz-wahlkreis-mapping.json` and `politicians-cache.json`
- Created `plzLookup.test.ts` data-driven suite — all 10 cases pass

Fixture verification run:
```
10858 wks: [61] → Vandre, Scholz         ✓ single-wahlkreis
10910 wks: [95] → Uhlig, Streeck         ✓ single-wahlkreis
12521 wks: [62] → Lübcke, Kotré          ✓ single-wahlkreis
12712 wks: [62] → Lübcke, Kotré          ✓ single-wahlkreis
10026 wks: [74..85] → 24 politicians     ✓ ambiguous-multi-wahlkreis
10082 wks: [74..85] → 24 politicians     ✓ ambiguous-multi-wahlkreis
10083 wks: [74..85] → 24 politicians     ✓ ambiguous-multi-wahlkreis
29216 wks: [44]  → 0 politicians         ✓ silent-fallback-no-politicians
29218 wks: [44]  → 0 politicians         ✓ silent-fallback-no-politicians
00000 wks: []    → 0 politicians         ✓ plz-not-found
```

Commit: `8a1ea43`

### T2: Word-count instrumentation + loud fallback log (EVAL-GAP-01, EVAL-GAP-02 logging)
- Extended `GenerateLetterResult` with `wordCount: number`, `wordCountInRange: boolean`, `fallbackUsed: boolean`
- Added post-parse word counter in `generateLetter.ts` — emits `console.warn` when outside the configured band (letter always ships)
- Replaced silent `politicians[0]` fallback with `console.error` that includes returnedId, availableIds, availableLevels, and issue text preview
- Single return path — no early returns remain
- Updated `submitWizardAction` log call to surface all three new fields

Commit: `87b1942`

### T3: Langfuse no-op-safe wrapper (EVAL-GAP-04)
- Installed langfuse@3.38.20
- Created `web/src/lib/observability/langfuse.ts` — exports `traceLetterGeneration()` and `isLangfuseEnabled()`
- No-op path: when `LANGFUSE_PUBLIC_KEY`/`LANGFUSE_SECRET_KEY` are unset, emits exactly one `console.info` on first call and returns an `end: async () => {}` stub
- Live path: opens `trace` + `generation`, closes in both success and error paths, flush is fire-and-forget (`void flushAsync()`)
- DSGVO: only 500-char issue preview and 300-char letter preview sent to Langfuse
- Wired into `generateLetter.ts` before the Mistral call with try/catch/finally semantics
- Created `web/.env.example` documenting all env vars including the three new Langfuse ones

Commit: `2b17fa1`

## Verification Results

```
npm test       → 10/10 PASS (0.3s)
tsc --noEmit   → EXIT 0
eslint (modified files only) → EXIT 0
```

Pre-existing lint errors in `Step2Issue.tsx` (setState-in-effect) and `Step3Success.tsx` (no-html-link) were present before this task and are out of scope.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Corrupted npm install producing incomplete packages**
- **Found during:** Task 1 install
- **Issue:** First `npm install` left `has-flag` and `es-errors` packages missing their `index.js` files, causing jest to fail at startup
- **Fix:** Deleted `node_modules/` entirely and ran a clean `npm install` — subsequent install was complete
- **Files modified:** `web/package-lock.json`

**2. [Rule 3 - Blocking] jest.config.ts cannot bootstrap ts-jest preset**
- **Found during:** Task 1 — jest.config.ts failed with "Preset ts-jest not found"
- **Issue:** `jest-config`'s `findNodeModule` only resolves package names, not absolute paths. A `.ts` config requires ts-jest to be loaded before jest-config can load the config — chicken-and-egg. `require.resolve('ts-jest')` returns an absolute path that `findNodeModule` returns `null` for.
- **Fix:** Switched from `jest.config.ts` to `jest.config.js` (plain CommonJS). Removed the `jest.config.ts` file.
- **Files modified:** Deleted `jest.config.ts`, created `jest.config.js`

**3. [Rule 1 - Bug] Langfuse `generation.end()` usage type mismatch**
- **Found during:** Task 3 — `tsc --noEmit` errored on line 67 of `langfuse.ts`
- **Issue:** Mistral SDK's `usage` type doesn't match Langfuse's `IngestionUsage` TypeScript type even though the runtime shape is compatible
- **Fix:** Cast via `any` with a code comment explaining the runtime compatibility and why the strict type can't be satisfied without importing Mistral SDK types into the observability layer
- **Files modified:** `web/src/lib/observability/langfuse.ts`

## Langfuse SDK Version

Installed: **langfuse@3.38.20**

API adaptations vs. plan:
- Plan specified `trace.generation({ ... })` and `generation.end({ ... })` — both present and matching in 3.38.20
- `flushAsync()` present and working
- `flushAt: 1` (serverless flush) supported
- No other adaptations needed

## Known Stubs

None. All new fields (`wordCount`, `wordCountInRange`, `fallbackUsed`) are computed from real data and logged. The Langfuse wrapper is a real integration, not a stub.

## Deferred Items

- Step3Success word-count display (EVAL-REVIEW item #9) — explicitly out of scope for this task
- Pre-existing lint errors in `Step2Issue.tsx` (react-hooks/set-state-in-effect) and `Step3Success.tsx` (no-html-link-for-pages) — logged, not fixed

## Self-Check: PASSED

All 6 created files present. All 3 task commits found (8a1ea43, 87b1942, 2b17fa1).

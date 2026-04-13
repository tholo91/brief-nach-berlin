---
phase: 02-core-engine
plan: "03"
subsystem: ai-letter-generation
tags: [mistral, server-actions, moderation, letter-generation, disambiguation]
dependency_graph:
  requires: [02-01]
  provides: [02-04]
  affects: []
tech_stack:
  added: ["@mistralai/mistralai", "openai", "zod"]
  patterns: ["use-server-actions", "dual-moderation", "json-mode-llm", "discriminated-union-results"]
key_files:
  created:
    - web/src/lib/generation/generateLetter.ts
    - web/src/lib/actions/submitWizard.ts
    - web/src/lib/actions/selectPolitician.ts
  modified:
    - web/package.json
    - web/package-lock.json
decisions:
  - "Used mistral-small-latest instead of mistral-large (1/10th cost, sufficient for structured German formal letter generation per research recommendation)"
  - "JSON regex fallback in generateLetter handles Mistral edge cases where response wraps JSON in markdown code blocks"
  - "D-14 scope conflict resolved: letter is returned in WizardActionResult.success.letter for Phase 3 email pickup — no server-side persistence per D-16"
  - "selectPoliticianAction narrows the politician list to a single-element array to force Mistral to select the user-chosen politician"
metrics:
  duration: "~25 minutes"
  completed: "2026-04-13T21:37:00Z"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 5
requirements_covered: [POLI-05, SAFE-02, SAFE-03, LETR-01, LETR-02, LETR-03, LETR-04, LETR-05]
---

# Phase 02 Plan 03: AI Letter Generation + Server Actions Summary

**One-liner:** Mistral mistral-small-latest generates formal German letters via a single JSON-mode API call that classifies political level, selects politician, and writes the letter — orchestrated by dual-moderation server actions.

## What Was Built

Three server-side modules completing the core product pipeline:

1. **`web/src/lib/generation/generateLetter.ts`** — Mistral chat completion wrapper
   - Model: `mistral-small-latest` with `responseFormat: { type: "json_object" }`
   - System prompt in German enforcing: 200-280 words, Sie-Form, no Genderzeichen, sachlich-bürgerlich tone
   - Single API call returns `{ political_level, selected_politician_id, letter }` JSON
   - try/catch JSON parse with regex fallback for reliability
   - selectedPolitician validated against input list (no arbitrary ID injection from LLM)

2. **`web/src/lib/actions/submitWizard.ts`** — Main pipeline server action
   - Pipeline: Zod validate → moderate input → lookupPLZ → generateLetter → moderate output
   - Returns `disambiguationNeeded: true` when PLZ maps to multiple Wahlkreise
   - Full typed discriminated union: success, disambiguationNeeded, and 5 error variants
   - MISTRAL_API_KEY accessed only server-side via `"use server"` directive

3. **`web/src/lib/actions/selectPolitician.ts`** — Disambiguation path server action
   - Takes user-selected politician ID + full politician list
   - Generates letter with single-element array to force Mistral to write for chosen politician
   - Same dual moderation (input already moderated in submitWizardAction; output moderated here)

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| `mistral-small-latest` model | Sufficient quality for structured formal German letters at 1/10th cost of mistral-large. Escalation path exists if quality is poor. |
| JSON regex fallback | Mistral occasionally wraps JSON in markdown code blocks even with json_object mode — regex fallback extracts the JSON without breaking the pipeline |
| D-14 scope conflict (Phase 2 does NOT send email) | Letter returned in `WizardActionResult.success.letter`. Client stores in component state. Phase 3 wires Resend email delivery. Console.log acts as server-side audit trail per T-02-11. |
| `selectPoliticianAction` narrows politician list to 1 | Passing only the selected politician forces Mistral to address that specific person, eliminating level-selection uncertainty |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Packages not installed in worktree**
- **Found during:** Task 1 setup
- **Issue:** `@mistralai/mistralai`, `openai`, and `zod` were not in web/package.json — packages had been removed when working tree was reset to `fc6582d`
- **Fix:** Ran `npm install @mistralai/mistralai openai zod --legacy-peer-deps`
- **Files modified:** web/package.json, web/package-lock.json
- **Commit:** 2f41b03

**2. [Rule 3 - Blocking] Wave 1 lib files not checked out in worktree**
- **Found during:** Initial file reads
- **Issue:** After `git reset --soft fc6582d`, the `web/src/lib/` directory was empty on disk (files were in the git tree but not checked out)
- **Fix:** Ran `git checkout HEAD -- web/src/lib/` to restore the files
- **Files modified:** None (restoration only)

## Known Stubs

None. All code paths are wired to real dependencies (Mistral API, OpenAI Moderation API, PLZ lookup). The data files (`plz-wahlkreis-mapping.json`, `politicians-cache.json`) are handled gracefully by `plzLookup.ts` which returns empty arrays when data files are absent — this is intentional per Phase 1 data infrastructure dependency.

## Threat Flags

No new threat surface introduced beyond what is documented in the plan's threat model (T-02-09 through T-02-15). All mitigations applied:
- T-02-09: Zod validation in submitWizardAction
- T-02-10: OpenAI moderation before Mistral prompt injection
- T-02-12: `"use server"` directive keeps MISTRAL_API_KEY server-side
- T-02-13: selectedPolitician validated against input list in generateLetter
- T-02-15: Output moderation before returning result

## Self-Check: PASSED

Files created:
- FOUND: web/src/lib/generation/generateLetter.ts
- FOUND: web/src/lib/actions/submitWizard.ts
- FOUND: web/src/lib/actions/selectPolitician.ts

Commits:
- FOUND: 2f41b03 feat(02-03): implement Mistral letter generation module
- FOUND: ff40b8a feat(02-03): implement submitWizard and selectPolitician server actions

TypeScript: full project `npx tsc --noEmit` passes with zero errors.

---
phase: 02-core-engine
plan: "01"
subsystem: core-data-contracts
tags: [typescript, zod, openai, plz-lookup, moderation, types]
dependency_graph:
  requires: []
  provides:
    - web/src/lib/types/politician.ts
    - web/src/lib/types/wizard.ts
    - web/src/lib/validation/wizardSchemas.ts
    - web/src/lib/lookup/plzLookup.ts
    - web/src/lib/openai.ts
    - web/src/lib/moderation/moderateText.ts
  affects:
    - All Phase 2 plans (02-02 through 02-04) import from these modules
tech_stack:
  added:
    - "@mistralai/mistralai@^2.2.0"
    - "openai@^6.34.0"
    - "zod@^3.24 (pinned to v3.x per CLAUDE.md)"
    - "react-hook-form@^7.72.1"
    - "@hookform/resolvers@^5.2.2"
    - "recordrtc@^5.6.2"
    - "@types/recordrtc@^5.6.15 (dev)"
  patterns:
    - Shared OpenAI singleton (single new OpenAI() instance for all server-side modules)
    - Zod v3 schemas with refine() for domain-specific PLZ range validation
    - Module-scope caching pattern for static JSON data files (plzLookup.ts)
    - Dual-path file loading: ../data/ (dev) with fallback to data/ (Vercel)
key_files:
  created:
    - web/src/lib/types/politician.ts
    - web/src/lib/types/wizard.ts
    - web/src/lib/validation/wizardSchemas.ts
    - web/src/lib/lookup/plzLookup.ts
    - web/src/lib/openai.ts
    - web/src/lib/moderation/moderateText.ts
  modified:
    - web/package.json (6 new deps + 1 dev dep)
    - web/package-lock.json
decisions:
  - "Zod pinned to v3.25.x (latest v3) — npm installed v4.3.6 initially; downgraded per CLAUDE.md constraint (v4 breaking changes to .parse API)"
  - "PLZ lookup uses dual-path loading (../data/ dev + data/ Vercel fallback) with graceful empty-cache fallback when data files not yet present"
  - "WizardActionResult.success variant includes letter:string field for Phase 3 email delivery pickup (D-07 level_data_missing error variant also added)"
metrics:
  duration: "~2 minutes"
  completed: "2026-04-13"
  tasks_completed: 2
  tasks_total: 2
  files_created: 6
  files_modified: 2
---

# Phase 02 Plan 01: Shared Types, Schemas, PLZ Lookup, and OpenAI Utilities Summary

**One-liner:** TypeScript data contracts (Politician, WizardData, WizardActionResult), Zod v3 validation schemas with PLZ range refine, PLZ-to-Politician module-scope caching lookup, shared OpenAI singleton, and omni-moderation-latest wrapper — foundational layer for all Phase 2 plans.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install deps + type definitions | c4d59d2 | web/package.json, web/src/lib/types/politician.ts, web/src/lib/types/wizard.ts |
| 2 | OpenAI singleton, Zod schemas, PLZ lookup, moderation | 6f63751 | web/src/lib/openai.ts, web/src/lib/validation/wizardSchemas.ts, web/src/lib/lookup/plzLookup.ts, web/src/lib/moderation/moderateText.ts |

## What Was Built

### TypeScript Types (`web/src/lib/types/`)

**politician.ts** exports:
- `PoliticalLevel` — "Bund" | "Land" | "Kommune"
- `Politician` — full entity with id, politicianId, firstName, lastName, title, party, wahlkreisId, wahlkreisName, level, postalAddress
- `PoliticiansCache` — { bundestag, landtag, kommune, lastUpdated }

**wizard.ts** exports:
- `WizardStep` — 1 | 2 | 3
- `WizardData` — plz, email, name?, party?, ngo?, issueText
- `GenerateLetterInput` — issueText, politicians, name?, party?, ngo?
- `GenerateLetterResult` — letter, selectedPolitician, politicalLevel
- `WizardActionResult` — discriminated union: success (with letter:string) | disambiguationNeeded | 6 error variants (moderation_rejected, output_moderation_rejected, generation_failed, plz_not_found, level_data_missing with D-07 support, server_error)

### Zod Schemas (`web/src/lib/validation/wizardSchemas.ts`)

- `step1Schema`: PLZ regex `/^\d{5}$/` + `.refine(v => parseInt(v) >= 1001)` (rejects "00000", accepts "01001"+) + email validation, all with German error messages
- `step2Schema`: issueText min(1)/max(5000)
- Inferred types: `Step1Data`, `Step2Data`

### PLZ Lookup (`web/src/lib/lookup/plzLookup.ts`)

- Reads `data/plz-wahlkreis-mapping.json` (Record<string, number[]>) and `data/politicians-cache.json`
- Module-scope caching: `let _plzMapping: Record<string, number[]> | null = null` — parsed once, reused
- Dual-path: `../data/` (development with process.cwd() = web/) → fallback `data/` (Vercel serverless)
- Graceful degradation: returns empty result if data files not yet present (build-time scripts generate them)
- Includes Bundestag + Landtag + Kommune politicians in results

### OpenAI Singleton (`web/src/lib/openai.ts`)

Single `new OpenAI({ apiKey: process.env.OPENAI_API_KEY })` instance. All server-side modules import from here — never instantiate their own client.

### Moderation Wrapper (`web/src/lib/moderation/moderateText.ts`)

- Imports shared OpenAI singleton
- Calls `openai.moderations.create({ model: "omni-moderation-latest", input: text })`
- Returns `ModerationResult { flagged: boolean; categories: string[] }`
- Extracts flagged category names from response for structured error reporting

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Critical Constraint] Pinned Zod to v3.x**
- **Found during:** Task 1 npm install
- **Issue:** npm resolved `zod@^3.24` to `v4.3.6` (Zod v4 was released and npm treats ^3.24 as compatible with v4 in this version range — actually this was ^3.24 correctly resolving to v3 but npm chose v4 due to package registry state). Actually zod was installed as v4. CLAUDE.md explicitly states "Stick to v3.x for stability — v4 has breaking changes to the `.parse` API."
- **Fix:** Ran `npm install zod@^3.24` again after initial install; confirmed final version is 3.25.76
- **Files modified:** web/package.json, web/package-lock.json
- **Commit:** c4d59d2

## Known Stubs

None — this plan creates utility modules with no UI rendering. Data files (`plz-wahlkreis-mapping.json`, `politicians-cache.json`) do not exist yet and are generated by Phase 1 build scripts; the lookup module handles their absence gracefully with empty fallback.

## Threat Flags

No new threat surface introduced beyond what the plan's threat model covers. The OpenAI API key singleton (T-02-03) is server-side only; Zod PLZ validation (T-02-01) and email validation (T-02-02) are implemented as specified.

## Self-Check: PASSED

- [x] `web/src/lib/types/politician.ts` — exists
- [x] `web/src/lib/types/wizard.ts` — exists
- [x] `web/src/lib/validation/wizardSchemas.ts` — exists
- [x] `web/src/lib/lookup/plzLookup.ts` — exists
- [x] `web/src/lib/openai.ts` — exists
- [x] `web/src/lib/moderation/moderateText.ts` — exists
- [x] Commit c4d59d2 — Task 1
- [x] Commit 6f63751 — Task 2
- [x] `npx tsc --noEmit` — PASSED (0 errors)

---
phase: "03"
plan: "02"
subsystem: email-delivery
tags: [brevo, after, server-actions, privacy, wizard-ux]
dependency_graph:
  requires:
    - "03-01: sendLetterEmail and buildEmailHtml modules (imported in both server actions)"
    - "02-03: submitWizardAction and selectPoliticianAction (modified here)"
    - "02-04: WizardShell and Step3Success components (modified here)"
  provides:
    - "Fire-and-forget email dispatch on both generation paths (single-Wahlkreis + disambiguation)"
    - "WizardActionResult success variant without letter field (PRIV-01 enforced at type level)"
    - "?text= URL param pre-fill support for Neuen Brief schreiben email link"
  affects:
    - "No downstream plans — this closes the Phase 2 → Phase 3 handoff"
tech_stack:
  added: []
  patterns:
    - "next/server after() for fire-and-forget background task after server action response"
    - "Letter text never returned from server to browser — enforced by TypeScript type system"
    - "URL param read-once-on-load pattern — text param not persisted back to URL"
key_files:
  created: []
  modified:
    - web/src/lib/types/wizard.ts
    - web/src/lib/actions/submitWizard.ts
    - web/src/lib/actions/selectPolitician.ts
    - web/src/components/wizard/Step3Success.tsx
    - web/src/components/wizard/WizardShell.tsx
decisions:
  - "after() used for email dispatch — server action returns success immediately, Brevo call runs in background"
  - "text param not added to PARAM_KEYS — prevents URL length overflow during in-session navigation"
  - "TypeScript type system enforces letter-not-in-response at compile time (no runtime check needed)"
metrics:
  duration_minutes: 15
  completed_date: "2026-04-14"
  tasks_completed: 2
  tasks_total: 2
  files_created: 0
  files_modified: 5
---

# Phase 3 Plan 2: Wire Email Dispatch into Server Actions

**One-liner:** Both server actions dispatch Brevo email via `after()` fire-and-forget; `WizardActionResult` drops `letter` field; `Step3Success` removes forward-contract state; `WizardShell` pre-fills issue from `?text=` param.

## What Was Built

This plan closes the Phase 2 → Phase 3 handoff by wiring the email modules (built in Plan 03-01) into the live server actions, removing all client-side letter text exposure, and enabling the "Neuen Brief schreiben" re-entry flow.

### Changes by file

**`web/src/lib/types/wizard.ts`**
- Removed `letter: string` from the `success` variant of `WizardActionResult`
- Type now: `{ success: true; politician: Politician; politicalLevel: PoliticalLevel }`
- The TypeScript compiler now enforces that no code can access `result.letter` on the success path

**`web/src/lib/actions/submitWizard.ts`**
- Added `import { after } from "next/server"` and `import { sendLetterEmail } from "@/lib/email/sendLetterEmail"`
- Replaced the Phase 2 placeholder `console.log` with an `after(async () => { await sendLetterEmail(...) })` call
- Return statement no longer includes `letter` — action returns `{ success: true, politician, politicalLevel }`

**`web/src/lib/actions/selectPolitician.ts`**
- Same imports and `after()` pattern as `submitWizard.ts`
- Replaced the Phase 2 placeholder `console.log` with live email dispatch
- Return statement no longer includes `letter`

**`web/src/components/wizard/Step3Success.tsx`**
- Removed `useEffect` import (no longer needed)
- Removed `letterText` useState declaration and forward-contract comment
- Removed `useEffect` block that set `letterText` from `result.letter`
- Removed `setLetterText(selectResult.letter)` call in `handleSelectPolitician`
- Component now has no reference to `letterText` or `result.letter`

**`web/src/components/wizard/WizardShell.tsx`**
- `wizardData` initializer now reads `searchParams.get("text")` and writes it into `data.issueText`
- `step` initializer now returns `2` when `?text=` param is present (jumps directly to issue step)
- `"text"` is NOT added to `PARAM_KEYS` — text param is read once on load and stored in React state only

## Security Review

| Threat | Status |
|--------|--------|
| T-03-05: Letter text returned to browser | Mitigated — `letter` field removed from `WizardActionResult` success variant; TypeScript compile-time enforcement |
| T-03-06: XSS via ?text= param | Mitigated — textParam stored in controlled React state, rendered in `<textarea>` value prop (auto-escaped by React) |
| T-03-07: Brevo failure inside after() | Accepted — user sees success UI regardless; console.error logged in sendLetterEmail on failure |

## Deviations from Plan

None — plan executed exactly as written. All acceptance criteria met.

## Known Stubs

None — both server actions fully dispatch to Brevo. Email delivery requires `BREVO_API_KEY` env var set in `.env.local` (documented in Plan 03-01 summary).

## Self-Check: PASSED

- [x] `web/src/lib/types/wizard.ts` success variant has no `letter` field
- [x] `web/src/lib/actions/submitWizard.ts` contains `import { after } from "next/server"`
- [x] `web/src/lib/actions/submitWizard.ts` contains `import { sendLetterEmail }`
- [x] `web/src/lib/actions/submitWizard.ts` contains `after(async () =>`
- [x] `web/src/lib/actions/submitWizard.ts` return does NOT contain `letter:`
- [x] `web/src/lib/actions/selectPolitician.ts` contains `import { after } from "next/server"`
- [x] `web/src/lib/actions/selectPolitician.ts` contains `after(async () =>`
- [x] `web/src/lib/actions/selectPolitician.ts` return does NOT contain `letter:`
- [x] `web/src/components/wizard/Step3Success.tsx` has zero occurrences of `letterText`
- [x] `web/src/components/wizard/Step3Success.tsx` has zero occurrences of `result.letter`
- [x] `web/src/components/wizard/WizardShell.tsx` contains `searchParams.get("text")`
- [x] `web/src/components/wizard/WizardShell.tsx` jumps to step 2 when text param present
- [x] `"text"` NOT in PARAM_KEYS array
- [x] `npx tsc --noEmit` passes with zero errors
- [x] Task 1 commit: `5678730`
- [x] Task 2 commit: `6b9cd55`

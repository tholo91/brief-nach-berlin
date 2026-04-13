---
phase: 02-core-engine
plan: 04
status: complete
---

# Plan 02-04: Multi-Step Wizard UI

## What was built

Complete multi-step wizard at `/app` implementing the full citizen-to-politician-to-letter pipeline:

- **Step 1 (Kontaktdaten):** PLZ + email with Zod validation, errors shown only after blur
- **Step 1b (Zusätzliche Infos):** Optional name, party, NGO with skip button and context description
- **Step 2 (Dein Anliegen):** Voice-first input (VoiceRecorder above textarea), "oder schreib es selbst" divider, full-width "Brief erstellen" button with envelope icon
- **Step 3 (Ergebnis):** Processing animation, politician disambiguation cards, level-data-missing fallback
- **WizardShell:** State machine with URL param sync for session restoration, 3-step labeled progress indicator (hover tooltips), back navigation

## Key files

- `web/src/app/app/page.tsx` — App route with Suspense wrapper
- `web/src/components/wizard/WizardShell.tsx` — State machine, URL params, progress indicator
- `web/src/components/wizard/Step1Form.tsx` — Mandatory inputs with onTouched validation
- `web/src/components/wizard/Step1bOptional.tsx` — Optional fields with skip
- `web/src/components/wizard/Step2Issue.tsx` — Voice-first + textarea, fade-out after transcription
- `web/src/components/wizard/Step3Success.tsx` — Results, disambiguation, fallback states

## Deviations from plan

- Split Step 1 into mandatory (Step 1) and optional (Step 1b) per user feedback
- Voice recorder moved above textarea as primary input method
- Added URL parameter sync for session restoration
- Added back navigation on steps 1b and 2
- Voice recorder is one-shot with fade-out animation after transcription
- Validation errors show on blur, not on keystroke

## Self-Check: PASSED

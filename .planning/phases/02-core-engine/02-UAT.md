---
status: testing
phase: 02-core-engine
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md]
started: 2026-04-14T12:00:00Z
updated: 2026-04-14T12:00:00Z
---

## Current Test

number: 1
name: Cold Start Smoke Test
expected: |
  Kill any running dev server. Run `npm run dev` from web/. The app boots without errors.
  Open http://localhost:3000/app — the wizard page loads with Step 1 visible (PLZ + Email fields).
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running dev server. Run `npm run dev` from web/. The app boots without errors. Open http://localhost:3000/app — the wizard page loads with Step 1 visible (PLZ + Email fields).
result: [pending]

### 2. Step 1 — PLZ + Email Validation
expected: On http://localhost:3000/app, enter an invalid PLZ like "123" and tab out — a German validation error appears. Enter "00000" — rejected. Enter a valid 5-digit PLZ (e.g. "10115") — no error. Leave email blank and try to proceed — validation error. Enter a valid email — you can proceed to the next step.
result: [pending]

### 3. Step 1b — Optional Fields + Skip
expected: After completing Step 1, you see optional fields (Name, Partei, NGO/Verein) with a description of why they help. A "Überspringen" or skip button is visible. You can either fill in fields and proceed, or skip directly to Step 2.
result: [pending]

### 4. Step 2 — Voice Recording
expected: Step 2 shows a microphone button labeled "Sprachaufnahme starten" in waldgruen color ABOVE a textarea. Clicking the mic button requests microphone permission. While recording: a pulsing red dot and MM:SS timer appear. Stop recording: shows "Transkription läuft..." spinner, then the transcribed text appears in the textarea. The voice recorder fades out after transcription.
result: [pending]

### 5. Step 2 — Text Input Fallback
expected: On Step 2, below the voice recorder there's an "oder schreib es selbst" divider. You can type directly into the textarea without using voice. A full-width "Brief erstellen" button with an envelope icon is visible at the bottom. Clicking it with text entered proceeds to Step 3.
result: [pending]

### 6. Step 3 — Letter Generation Result
expected: After submitting your issue, a processing animation appears. Then the generated letter is displayed — it's in formal German (Sie-Form), approximately 200-280 words, addressed to a specific politician. The politician's name, party, and level are shown.
result: [pending]

### 7. Politician Disambiguation
expected: If your PLZ maps to multiple Wahlkreise, Step 3 shows disambiguation cards letting you choose which politician to write to. Selecting one generates a letter addressed to that specific politician.
result: [pending]

### 8. Progress Indicator + Back Navigation
expected: A 3-step labeled progress indicator is visible at the top (e.g. Kontaktdaten, Anliegen, Ergebnis). The current step is highlighted. On Steps 1b and 2, a back button/arrow lets you return to the previous step. Hovering over step labels shows tooltips.
result: [pending]

## Summary

total: 8
passed: 0
issues: 0
pending: 8
skipped: 0
blocked: 0

## Gaps

[none yet]

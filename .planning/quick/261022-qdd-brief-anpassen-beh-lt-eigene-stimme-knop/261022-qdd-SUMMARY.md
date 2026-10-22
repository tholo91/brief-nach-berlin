---
phase: quick-261022-qdd
plan: 01
subsystem: brief-anpassen
tags: [prompt, variant-flow, presets, jest]
requires: []
provides:
  - "Chip 'Einfache Worte' on /brief/anpassen"
  - "VARIANT_SYSTEM_PROMPT block 'Eigene Stimme bleibt' with Du/Sie precedence over tone level"
affects:
  - web/src/app/(site)/brief/anpassen/VariantForm.tsx
  - web/src/lib/generation/generateLetterVariant.ts
  - web/src/__tests__/generateLetterVariantPrompt.test.ts
key-files:
  modified:
    - web/src/app/(site)/brief/anpassen/VariantForm.tsx
    - web/src/lib/generation/generateLetterVariant.ts
    - web/src/__tests__/generateLetterVariantPrompt.test.ts
decisions:
  - "Own-voice rule applies to every variant request, not via a chip (D-03)"
  - "Address-form precedence resolved in the variant system prompt only; generateLetter.ts untouched (D-05)"
status: complete
commits: 4
plan_head_before: 6b894de4aed02229b2a025ed1cbf5d9c8fbd6114
plan_head_after: 847635c2afec6516922b559a669162bdac034b85
actuals:
  tokens: 3500
  tasks: 2
  commits: 4
completed: 2026-10-22
---

# Phase quick-261022-qdd Plan 01: Brief anpassen behält eigene Stimme Summary

Variant prompt now keeps own opinions, gendering, own closing sentences and Du/Sie form (precedence over tone level), and the preset row offers "Einfache Worte" instead of "Eigene Worte behalten".

## Chip list (order)

Klingt nach mir, Anliegen im Zentrum, Einfache Worte, Nur sichere Fakten, Klarer roter Faden.
"Einfache Worte" text: "Bitte Alltagssprache und kurze Sätze, Fachwörter und Fremdwörter durch einfache Wörter ersetzen." (shorter label than the old one, so the chip row fits as before; markup and styling untouched).

## Prompt as shipped

New bullet after "Verändere nur Tonalität ...":
"Wenn <aenderungswunsch> Alltagssprache oder einfache Wörter verlangt, ersetze Fachwörter und Fremdwörter durch einfache Wörter und teile lange Sätze. Die Sachverhalte bleiben dieselben."

"70 bis 90 Prozent" bullet, second sentence now: "Überarbeite die Sprache im Rahmen von <tonalitaet> und <aenderungswunsch>, die Substanz bleibt dieselbe."
Removed: "Der Brief bleibt ein formeller Brief in Sie-Form."

```
Eigene Stimme bleibt:
Der Brief gehört der Person, die ihn abschreibt und unterschreibt. Die Variante klingt weiter nach ihr.
- Persönliche Meinungen und Wertungen bleiben inhaltlich und möglichst wörtlich stehen, auch Wertungen über die Empfängerin oder den Empfänger.
- Gendergerechte Formen wie "Autofahrende" oder "Bürger*innen" bleiben genau so geschrieben.
- Erkennbar bewusst gesetzte Sätze, zum Beispiel ein eigener Schlusssatz, bleiben wörtlich stehen. Sie ändern sich nur, wenn <aenderungswunsch> das verlangt.
- Die Variante übernimmt die Anredeform des bestehenden Briefs: Du-Form bleibt Du-Form, Sie-Form bleibt Sie-Form. Ist keine Anredeform erkennbar, schreibe in Sie-Form.
- Die Anredeform des bestehenden Briefs hat Vorrang vor <tonalitaet>, auch wenn die Tonstufe die Du-Form ausschließt.
- Was <aenderungswunsch> ausdrücklich ändern will, setzt du um, auch wenn es diese Punkte betrifft.
```

preservation_check hint: "<ein Satz, dass Fakten, Forderung, Anrede, Anredeform, eigene Wertungen und Grußformel erhalten blieben>".

## D-06 reference check

`grep` for "Eigene Worte behalten" and "Gute eigene Formulierungen" over web/src and web/scripts: only hits are the negative assertions in the new test. No other test, analytics label or copy referenced them.

## Verification

- `cd web && npx jest generateLetterVariant`: 2 suites, 13 tests passed.
- `cd web && npx jest` (full): 148 suites, 1415 tests passed.
- `npx eslint` on VariantForm.tsx: clean.
- `cd web && npx tsc --noEmit -p .`: one error, in `.next/types/routes.d 2.ts` (duplicate identifier 'LayoutProps', an iCloud conflict copy inside the ignored `.next` build folder). No error in src. Pre-existing, not caused by this plan.
- `npm run lint`: 1 error, 7 warnings, all pre-existing and outside the touched files (error: `require()` import in `src/__tests__/lastcallSender.test.ts:58`). Not fixed (scope boundary).
- `generateLetter.ts`, `package.json`, `package-lock.json`: no diff against the plan base commit 6b894de (`git diff --stat 6b894de HEAD` lists only the 3 planned files). `origin/main` is stale locally, so the base commit was used for the comparison instead.

## Verification gap

No real Mistral run was done (D-02). All tests mock `@/lib/mistral`. It is unverified whether the model actually keeps Du-Form, gendering and own opinions. The todo's first "Fertig, wenn" item (real run with 3 letters) stays open by decision; observe HeySpeak feedback after the push.

## Push status

Not pushed. Thomas pushes manually (push to main = production). Commits are on main (trunk-based, branching_strategy none).

## Deviations from Plan

None - plan executed as written. Test B (preset text lands in `<aenderungswunsch>`) passed already in the RED run because that wiring existed; it stays as a regression guard.

## Follow-up options (not done)

1. `web/src/app/(site)/brief-verbessern/page.tsx` still tells external chatbots "durchgehend Sie-Form".
2. `extractSalutation` in generateLetterVariant.ts only restores "Sehr geehrte"/"Guten Tag" salutations; a dropped Du salutation like "Lieber ..." is not restored by code.
3. The "70 bis 90 Prozent" rule still allows dropping own additions (feedback 09.10.).
4. Pre-existing: lint error in lastcallSender.test.ts and iCloud duplicate `.next/types/routes.d 2.ts` breaking `tsc`.

## Self-Check: PASSED

Files exist, commits cc4146d, 5c1114a, 19e0452, 847635c are on main.

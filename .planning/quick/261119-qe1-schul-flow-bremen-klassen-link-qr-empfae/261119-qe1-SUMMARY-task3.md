---
quick_id: 261119-qe1
task: 3
status: complete
scope: UI (A1, A3-UI, A4-UI)
commits: 0
note: no commits by design (Thomas commits after OK); STATE.md/ROADMAP.md untouched; no dev server started
verification:
  tsc: clean
  jest: 199 suites, 1946 tests, all passing
  eslint: 0 errors on touched files (9 pre-existing warnings, none new)
---

# Task 3: UI Schul-Flow (Bremen)

## What changed

- **A1 Klassen-Link überlebt Reiter und Remount**
  - `lib/schule/classLinkStorage.ts` (new): sessionStorage key `schule-class-link:v1` holds `{token, klasse, plz, delivery, expiresAt}`. `expiresAt` is the real token expiry (issuedAt + 14 days), computed server-side in `jungEntry.ts` (`expiresAt` is a new optional field of the valid entry). Expired or broken entries are removed on read.
  - `components/jung/classLinkPersistence.ts` (new): `planClassLinkSync` + hook, used in `JungExperience`. Valid link: save. Invalid link: clear (so no redirect loop). No `?k` but stored link: `router.replace("/schule?k=<token>")`, so the server re-verifies. The page gives `JungExperience` a `key` per token so the form restarts with Klasse/PLZ after that redirect.
  - `AppHeader.tsx`: the "Für Schüler:innen" tab links to `/schule?k=<token>` when a link is remembered (hook `components/schule/useStoredClassToken.ts`, hydration safe). The `/unterricht` and `/eltern` tabs and the `/unterricht` link on the schule page are unchanged on purpose (storage restores everything when coming back to Schule).
  - `WizardShell.tsx`: with no handoff (reload/remount) it restores youth audience, Klasse, classToken, PLZ and PDF flag from the stored link. A jung handoff without token also gets the stored link. Adult, campaign or already tokened handoffs are never changed (`schoolFieldsFromStoredLink` in `lib/wizard-handoff.ts`).
- **A3 PLZ und Klasse gesperrt**
  - `JungExperience`: no "ändern" button; fixed line "Klasse X, PLZ Y (vom Klassenlink festgelegt)". Under the button: "Das Tool sucht die passende Person für dein Thema." (only with link).
  - `entryStepForHandoff`: PDF + token + PLZ returns `"2b"` (skips contact/PLZ step). Wizard: back from Ton goes to the issue step, progress shows 2 dots, routing prefetch is started on entry to "2b".
  - Mail mode: `Step1Form` gets `plzLocked` (read-only PLZ, grey, hint "Die PLZ kommt aus deinem Klassenlink.").
- **A4 Empfänger**
  - `ClassLinkGenerator`: new fieldset "Empfänger" (Automatisch (empfohlen) default, Land, Bund) with hints and the line "Eine feste Ebene passt am besten, wenn die ganze Klasse zu einem Thema schreibt." Sends `level` to `createClassLinkAction`; result text names the choice (`levelSummary`). Option list lives in `classLinkHelpers.ts`.
  - Wizard school mode: when `submitWizardAction` returns `schoolRecipient` (and no campaign), `StepLevelSelect` is skipped (straight to step 3), `Step3Success` shows one fixed card (`lib/schule/schoolRecipientView.ts`: badge, name, office, address) plus "Warum diese Person?" with `reason`. `selection` is `schoolRecipient.selection`, `routingToken` unchanged, no campaign slug. "Ebene ändern" and "PLZ ändern" are hidden in school mode. Adult/campaign JSX untouched (the picker blocks are wrapped in `{!schoolView && ...}` without re-indenting).

## Deviations from Plan

- **[Rule 2] Link storage holds Klasse/PLZ/delivery, not only the token**: the client cannot decode the signed token, so WizardShell needs them to restore school mode.
- The `/unterricht` link on the schule page does not carry `?k` (the `/unterricht` page ignores it; nothing to restore there).
- `jungEntry.test.ts` updated: `expiresAt` in expected entries; the "ändern" assertion now asserts the button is gone.

## Tests added or changed

New: `classLinkStorage.test.ts` (storage round trip, expiry, broken data, `schuleHref`, `planClassLinkSync`), `appHeaderClassLink.test.ts`, `schoolRecipientView.test.ts`, `classLinkGenerator.test.ts`. Changed: `wizardHandoff.test.ts` (PDF skip, mail keeps step, stored-link restore rules), `jungEntry.test.ts`. Mistral mocked or untouched everywhere.

## How to test in browser

1. `/unterricht` -> Klasse 7, PLZ 28195 (Bremen), "Als PDF, ohne E-Mail", Empfänger "Automatisch (empfohlen)" -> "Link erstellen". Check the hint texts and the sentence under the link. Repeat once with "Land".
2. Open the link (`/schule?k=...`). Type a topic text ("Unsere Schultoiletten sind kaputt."). Expect the fixed line "Klasse 7, PLZ 28195 (vom Klassenlink festgelegt)", no "ändern".
3. Tab "Für Lehrkräfte", then tab "Für Schüler:innen": URL is `/schule?k=...` and Klasse/PLZ are still shown. Also test: open plain `/schule` in the same tab, it jumps to `/schule?k=...`.
4. "Brief entwerfen": the wizard goes to Ton directly (2 dots, no PLZ step; back goes to the issue). Reload (F5) in the wizard: school mode stays (issue step, then Ton).
5. Continue: no Ebenen-Schritt. The last step shows one fixed card (Bremer Bildungssenatorin for the toilet topic, or Regierungschef:in as fallback) and "Warum diese Person?". Then "Brief erstellen".
6. Mail link (choose "Per E-Mail"): the PLZ field in the wizard is grey and read-only.
7. Adult check: open `/` in a new tab, write a normal letter: PLZ step, Ebenen-Schritt and person list as before.

## Not done / notes

- No browser run by me (orchestrator verifies). Real Mistral letters not generated.
- Ressort routing quality and Bremen minister data come from Task 2 and the data file, not checked again here.

## Self-Check: PASSED

`cd web && npx tsc --noEmit` clean; `npx jest` 199 suites / 1946 tests pass; eslint 0 errors.

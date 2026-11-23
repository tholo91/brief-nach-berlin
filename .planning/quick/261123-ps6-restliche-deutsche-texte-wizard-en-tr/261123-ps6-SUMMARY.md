---
phase: quick-261123-ps6
plan: 01
subsystem: i18n
tags: [i18n, wizard, en, tr]
status: complete
requirements: [QUICK-261123-ps6]
key-files:
  created:
    - web/src/lib/i18n/wizardCopy.ts
  modified:
    - web/src/lib/i18n/uiCatalog.ts
    - web/src/components/AppHeader.tsx
    - web/src/components/wizard/WizardShell.tsx
    - web/src/components/wizard/Step3Success.tsx
    - web/src/components/wizard/AlternativeRecipientPicker.tsx
    - web/src/components/wizard/RathausAdresseButton.tsx
    - web/src/components/wizard/RathausHinweise.tsx
    - web/src/__tests__/elternYouthGermanSnapshot.test.ts
    - web/src/__tests__/__snapshots__/elternYouthGermanSnapshot.test.ts.snap
    - web/src/__tests__/elternYouthLocalized.test.ts
    - web/src/__tests__/successPageExperience.test.ts
    - web/src/__tests__/rathausAdresseButton.test.ts
decisions:
  - "Strings live in a sibling module wizardCopy.ts (success, picker, alternative, rathaus); consumers still use the one useUiCopy() API."
  - "Reused status.* and progress.back; their unused DE values were aligned to the live literals."
  - "Institution names in templates use an {institution} token with separate case keys, so no DE sentence is built from two pieces."
commits: 3
plan_head_before: 9612a4cc3149714cdaf9bf4c4bbc2a2d4d2701d0
plan_head_after: 08634af17ebe07144248f587e429e89654fb2f40
actuals:
  tokens: 34000
  tasks: 3
  commits: 3
---

# Phase quick-261123-ps6 Plan 01: Remaining German wizard texts in EN/TR Summary

EN and TR users now get the school header tabs, the wizard back button and step label, the whole adult success and generating state, all recipient pickers, the free search and the Rathaus address box in their language; German output stays byte-identical.

## Commits

| Task | Commit | Content |
| ---- | ------ | ------- |
| 1 (tracer) | cedb2e9 | DE baseline snapshots (written before any source edit), `wizardCopy.ts` with success top, headline via `status.letterReady` |
| 2 | 7e0a981 | `schoolNav`, `progress.stepOf`, back button, rest of success/resend/steps/report/generating state |
| 3 | 08634af | `picker`, `alternative`, `rathaus` groups, `AlternativeRecipientPicker`, `RathausAdresseButton`, `RathausHinweise` |

## Verification

- `npx tsc --noEmit` clean.
- `npx jest --ci`: 209 suites, 2755 tests, 43 snapshots, all green (24 DE snapshots: 9 old, 15 new; the .snap diff only adds entries).
- `npx eslint` on all touched files: 0 errors (one pre-existing warning in `Step1Form.tsx`, not touched).
- Throwaway `check-de-literals.ts`: 185 DE leaves (all `WIZARD_COPY.de` plus the reused `status.*`, `progress.*`, `schoolNav.*` keys) found verbatim in the sources at 5fa1f11, 0 misses. Script deleted, not committed.
- Invariants: no change under `web/src/lib/generation`, `web/src/app/api`, `web/src/lib/email` since 9612a4c; none of the unrelated dirty files were staged (`buildEmailHtml.ts`, `mailLocale.ts`, `buildEmailHtmlRecipients.test.ts`, ROADMAP, STATE, 261117-r86 summary are still dirty/untracked).

## Footer finding

No work needed: `/app` uses `WizardFooter` and `/eltern` uses `Footer` leading to `LocalizedFooter`; both already read `useUiCopy`.

## Left German on purpose

Server texts (`data.error`, `result.message`, `resendLimitMessage` from the server, `schoolRecipient.reason`), recipient names, labels, articles and addresses from data, page metadata/OG/JSON-LD, the /schule, /unterricht and /datenschutz page bodies and their header CTAs, /jung, the letter, all mails, `LetterSignalCard`, `DonationCard`/`SUPPORT_CONTENT`, the schreib-merz illustration alt text and caption, the campaign box in `WizardShell`, the `/app` Suspense fallback, values in server-action payloads and `track()` events. Also still German: the `/nutzungsbedingungen` target page (only the link text is translated) and the recipient-name part inside translated sentences (for example "Senat der Freien Hansestadt Bremen").

## Snapshot targets

All planned targets were captured. `WizardShell` rendered with the mocks, so the back button and step label are covered by a snapshot plus an EN/TR aria-label test. The back button itself only shows on steps 2 to level, which a static render cannot reach; its DE literal is covered by the literal check (`progress.back` = "zurück").

## Literal-check allowlist

None needed. Sentences that were built from two source pieces (the Land intro with Senat/Landesregierung) use an `{institution}` token with separate case keys instead.

## Deviations from Plan

- **[Rule 3 - Blocking] `successPageExperience.test.ts` import of the catalog:** added `jest.mock("@/lib/mistral")` as required by the repo rule; assertions re-pointed to `wizardCopy.ts` source or `UI_CATALOG.de`, intent unchanged, class-name and logic assertions untouched.
- **[Rule 3 - Blocking] `useLocale` throws outside the provider:** `rathausAdresseButton.test.ts` wraps the renders in `LocaleProvider`; no assertion changed.
- **Dependency arrays:** `handleSelectPolitician` and the WizardShell submit callback now list `wizardCopy.success.genericError` to satisfy `react-hooks/exhaustive-deps`.
- **Fit check (frontend-design skill, no redesign):** the school nav keeps `overflow-x-auto`, `shrink-0` and `whitespace-nowrap`, so longer TR labels ("Öğretmenler için") scroll instead of wrapping at 375px. The `w-20` back slot gets shorter words ("Back", "Geri") than the German "zurück". The resend row already stacks on mobile.
- The two identical branches `isYouth ? a : a` for the "Ohne Person fortfahren" hint became one key (same output).

## Known Stubs

None.

## Copy notes

EN/TR strings contain no em or en dash, keep every `{token}` (only `{article}` is dropped), keep "Brief-nach-Berlin" untranslated, use I / "ben" forms for Thomas and formal "siz" in Turkish. German institution names (Senat, Landesregierung, Landtag, Bundeskanzler) get plain EN/TR words with the German term in brackets in headings and intros. The EN/TR inbox hint quotes the real localized mail subject (checked by test against `emailCopy`).

## Manual check for Thomas

- `/app?lang=en` and `/app?lang=tr` at 375px through a Bund picker and a Land picker (for example 28203) to the success page: no German UI text except the out-of-scope items.
- `/unterricht` with an English browser: the three header tabs and their aria-label are English.
- Turkish tabs on a narrow phone scroll sideways; check that this feels fine.
- Turkish copy was written by me, not by a native speaker: a quick read of the picker intros and the resend/report texts would help.

## Self-Check: PASSED

Commits cedb2e9, 7e0a981, 08634af exist on main; `wizardCopy.ts` exists; nothing pushed.

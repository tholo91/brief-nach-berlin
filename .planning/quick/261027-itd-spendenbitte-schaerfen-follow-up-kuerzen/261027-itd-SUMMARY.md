---
phase: quick-261027-itd
plan: 01
subsystem: email, feedback, support
tags: [donation, followup-mail, feedback-page, refactor]
status: complete
requires: []
provides:
  - Shorter follow-up mail (no feedback paragraph, plain star row, short donation body, new preview)
  - Shared DonationCard component
  - Donation card on /feedback thank-you at 4-5 stars (no auto redirect)
affects: [web/src/lib/email, web/src/components/support, web/src/app/(site)/feedback]
key-files:
  created:
    - web/src/components/support/DonationCard.tsx
    - web/src/__tests__/donationCard.test.ts
    - web/src/__tests__/feedbackThankYouDonation.test.ts
  modified:
    - web/src/lib/email/buildEmailHtml.ts
    - web/src/lib/email/buildFollowupHtml.ts
    - web/src/lib/email/mailLocale.ts
    - web/src/lib/support-content.ts
    - web/src/components/wizard/Step3Success.tsx
    - web/src/app/(site)/feedback/FeedbackForm.tsx
    - web/src/__tests__/followupDonationCta.test.ts
    - web/src/__tests__/successPageExperience.test.ts
decisions:
  - "buildStarBarHtml got an optional showQuestion option instead of a copy; default output is byte-identical (letter mail snapshot unchanged)"
  - "feedbackPreview changed in place (only the follow-up uses it)"
  - "ThankYouCard exported for render tests; autoRedirect = rating <= 3 gates timer, hint text and progress bar"
metrics:
  tasks: 3
  completed: 2026-10-27
commits: 3
plan_head_before: 8a3d3fb346b8a50aad861cfc54239aed1e0dca59
plan_head_after: 64502b0
actuals:
  tasks: 3
  commits: 3
---

# Phase quick-261027-itd Plan 01: Spendenbitte schärfen, Follow-up kürzen Summary

Follow-up mail now drops the feedback paragraph and star box, the donation body is one short sentence, and the /feedback thank-you page shows a shared DonationCard (no redirect, "Jetzt spenden" as the only filled green button) at 4-5 stars.

## Commits

- 03ef2a0 feat(quick-261027-itd): Follow-up-Mail kürzer, Sterne ohne Box, neue Spendenzeile
- 5fec341 refactor(quick-261027-itd): Spendenkarte als gemeinsame DonationCard
- 64502b0 feat(quick-261027-itd): Spendenkarte auf der Danke-Seite bei 4-5 Sternen, kein Auto-Redirect

## Verification

- `npx jest` full: 170 suites, 1574 tests, 18 snapshots green, no `-u`; letterEmailAdultSnapshot unchanged.
- eslint on all touched files: clean.
- `tsc --noEmit`: no errors in `src/`. Only pre-existing errors in the gitignored iCloud duplicate `.next/types/routes.d 3.ts` (unrelated).

## Deviations from Plan

None. Plan executed as written. Notes: the Task 1 tracer gate was satisfied by re-running the full Task 1 verify suite (green) before expanding.

## Known Stubs

None.

## Threat Flags

None. The donate link keeps `rel="noopener noreferrer"` (asserted in two tests); star URL builder unchanged.

## Self-Check: PASSED

Created files exist; commits 03ef2a0, 5fec341, 64502b0 are ancestors of HEAD.

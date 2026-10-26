---
phase: quick-261026-tca
plan: 01
subsystem: email
tags: [followup-mail, donation, brevo-templates, banner]
status: complete
commits: 2
plan_head_before: a060b7f9ab535756cce7a2504f4e89cc4280a255
plan_head_after: 292928c9d74fd8f07e35ca92a7f7f4f15f8b3384
requires: []
provides:
  - "Follow-up mail with full-width stars and donation section (banner, 5-euro anchor, heart button), de/en/tr"
  - "Letter mail and resend without donation ask"
  - "web/public/images/spenden-banner-thomas.jpg (reusable)"
key-files:
  created:
    - web/public/images/spenden-banner-thomas.jpg
    - .planning/todos/pending/2026-10-26-spendenkarte-mit-banner-auf-rueckmeldung-danke-seite.md
  modified:
    - web/src/lib/support-content.ts
    - web/src/lib/email/mailLocale.ts
    - web/src/lib/email/buildFollowupHtml.ts
    - web/src/lib/email/buildEmailHtml.ts
    - web/src/__tests__/followupDonationCta.test.ts
    - web/src/__tests__/emailVariantCta.test.ts
    - web/src/__tests__/financingNotice.test.ts
    - .planning/todos/pending/2026-10-09-spendenbereitschaft-touchpoints-optimieren.md
actuals:
  tokens: 60000
  tasks: 3
  commits: 2
---

# Phase quick-261026-tca Plan 01: Spendenbitte aus Brief-Mail in Follow-up-Mail Summary

Donation ask moved from the letter mail to the follow-up mail: full-width stars, then heading, 5-euro text, WE AID-linked banner, green heart button and provider line (de/en/tr, HTML and text); letter mail and resends carry no ask anymore.

## Commits

- e745129 feat(followup-mail): Spendenbitte mit Banner unter den Sternen
- 292928c feat(brief-mail): Spendenbitte aus der Brief-Mail entfernt
- Task 3 todo files are NOT committed (orchestrator handles the docs commit): see "Uncommitted docs artifacts".

## Banner

- `web/public/images/spenden-banner-thomas.jpg`, 1283 px wide, JPEG quality 60 via sips, 166,239 bytes. Quality 80 gave 247,940 bytes and 70 gave 213,860 bytes, both over 200 KB.
- mdls shows no GPS, latitude or longitude keys.
- Mail uses `width="536"`, `height="198"`, `max-width:100%`, linked to the WE AID URL.

## SUPPORT_EMAIL_COPY

- Added `followup` (heading, body, providerLabel, bannerAlt) for de/en/tr.
- Removed keys with zero remaining references: `prefix`, `compactHeading`, `learnMore`, `providerLabel` (top-level), in all three locales.
- Kept: heading, body, status, button, compactButton, infoButton (financingNotice, Step3Success, tests).

## Test results

- Task 1 suites (followupDonationCta, followupMeetMdb, followupShareButtons, emailLocalization, privacyEmail, emailSocialFollow): 6 suites passed, 57 tests passed, 0 failed.
- Task 2 suites (emailVariantCta, financingNotice, supportContent, lastcallEmail, followupDonationCta, followupMeetMdb, emailLocalization, privacyEmail): 8 suites passed, 76 tests passed, 0 failed.
- Full run `npx jest`: 149 suites passed, 1429 tests passed, 0 failed.
- eslint clean on all touched files. tsc: no errors in touched files; only 5 pre-existing errors in `.next/types/routes.d 2.ts` (iCloud duplicate file, out of scope).
- Unchanged verified via git diff: buildLastcallHtml, financingNotice, buildCampaignCreatorEmailHtml, sendLetterEmail, Step3Success.

## Screenshots (scratchpad, not in repo)

Directory: `/private/tmp/claude-501/-Users-thomas-Documents-Git-Repos-brief-nach-berlin/1a016a62-6209-4ab1-8a86-30b212f1f31f/scratchpad/`

- `followup-375.png` (375 px, rendered via iframe so layout width is really 375)
- `followup-desktop.png`
- `letter-375.png`
- `letter-desktop.png`
- `followup-375-banner-crop.png` (banner zoom at 375)

Findings: follow-up stars span full width, donation section sits between stars and sign-off, button and provider line centered, banner not cropped or distorted. Letter mail shows no donation box. At 375 px the banner displays at about 311 px width: polaroid, "Moin, ich bin Thomas" and the star rows are recognizable, but the review quote text is too small to read.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Headless Chrome min window width**
- **Found during:** Task 3
- **Issue:** `--window-size=375` clipped the page (Chrome headless enforces a wider layout), so the first 375 screenshot was cropped.
- **Fix:** Rendered the saved preview HTML inside a 375 px iframe wrapper (file based, no extra server). A local python http.server attempt was denied by the permission system and not used.
- **Files modified:** none (scratchpad only)

**2. [Out of scope side effect] web/AGENTS.md**
- `next dev` rewrote `web/AGENTS.md`; restored with `git checkout -- web/AGENTS.md`, nothing committed.

**3. Task 3 commit skipped by instruction**
- The plan said to commit the two todo files; the orchestrator constraint says docs artifacts are committed by the orchestrator. Both todo files are written but uncommitted.

## Uncommitted docs artifacts (for the orchestrator docs commit)

- `.planning/todos/pending/2026-10-09-spendenbereitschaft-touchpoints-optimieren.md` (modified)
- `.planning/todos/pending/2026-10-26-spendenkarte-mit-banner-auf-rueckmeldung-danke-seite.md` (new)
- this SUMMARY.md

## Open issues

- Banner review quotes are not legible on 375 px phones (asset is the approved v8). Option: a mobile-cropped variant or larger text in a later banner version. Not changed, decision was closed in the approved plan.
- Frontend-design skill was invoked; the design stays within the existing email palette (banner as the single focal element, no new fonts or colors).

## Known Stubs

None.

## Self-Check: PASSED

- web/public/images/spenden-banner-thomas.jpg: FOUND
- e745129: FOUND
- 292928c: FOUND
- No Brevo call, no push.

---
phase: 05-creator-paid-brief-templates-shareable-prefilled-pages
plan: 02
subsystem: campaigns
tags: [nextjs, supabase, brevo, moderation, campaigns, tokens]

requires:
  - phase: 05-creator-paid-brief-templates-shareable-prefilled-pages
    provides: Campaign repository, lifecycle transitions, and revocable creator tokens from 05-01
provides:
  - No-login creator campaign setup form
  - Moderated draft creation with reserved campaign slug
  - Creator email verification route and activation action
  - Creator verification and management emails through Brevo
affects: [phase-05-public-campaign-pages, phase-05-creator-management]

tech-stack:
  added: []
  patterns:
    - server-action campaign creation with moderation before public activation
    - one-time verify_email token consumption before activation
    - creator lifecycle emails with no-login management token

key-files:
  created:
    - web/src/app/(site)/kampagne/starten/page.tsx
    - web/src/app/(site)/kampagne/verifizieren/page.tsx
    - web/src/components/campaigns/CreatorCampaignForm.tsx
    - web/src/lib/actions/createCampaignDraft.ts
    - web/src/lib/actions/verifyCampaignEmail.ts
    - web/src/lib/email/sendCampaignCreatorEmail.ts
    - web/src/lib/email/buildCampaignCreatorEmailHtml.ts
  modified: []

key-decisions:
  - "05-02 keeps Stripe/payment out of the creator flow; draft creation advances directly to email verification using the 05-01 lifecycle hook."
  - "Verification links are one-time tokens; reused or expired links return a useful status and do not resend management emails."
  - "Management token creation and email delivery are implemented here, while the actual management UI remains for the later creator-management plan."

patterns-established:
  - "Creator-authored public campaign text is moderated on submit and re-moderated immediately before activation."
  - "Creator emails distinguish verification from management and explain no-login access."

requirements-completed: [ENGM-03, SAFE-03, PRIV-01]

duration: 12min
completed: 2026-06-28
---

# Phase 5 Plan 2: Creator Publish Pipeline Summary

**No-login creator campaign setup with moderated draft creation, one-time email verification, activation, and creator lifecycle emails**

## Performance

- **Duration:** 12 min
- **Started:** 2026-06-28T14:20:00Z
- **Completed:** 2026-06-28T14:32:20Z
- **Tasks:** 3 automated tasks complete; 1 human-verification checkpoint recorded as pending
- **Files modified:** 7

## Accomplishments

- Added `/kampagne/starten` with a German creator setup form for email, title, issue text, optional attribution, optional description, optional external link, and chosen slug.
- Added `createCampaignDraftAction` to validate fields, normalize slugs, moderate public text, create the campaign draft, advance it to email verification, create a `verify_email` token, and send the verification email.
- Added `/kampagne/verifizieren` and `verifyCampaignEmailAction` to consume verification tokens, mark the creator email verified, re-run moderation, activate only approved text, rotate/create a `manage` token, and send the management email.
- Added creator email delivery and HTML copy for verification and management, including campaign URL, activation status, edit/pause instructions, and no-login explanation.

## Task Commits

Each task was committed atomically:

1. **Task 1: Build the creator setup form and draft creation action** - `3853bd8` (feat)
2. **Task 2: Add email verification and campaign activation** - `918303d` (feat)
3. **Task 3: Add creator email delivery and post-activation copy** - `4adcd84` (feat)

**Plan metadata:** final docs commit

## Files Created/Modified

- `web/src/app/(site)/kampagne/starten/page.tsx` - Public creator campaign start route.
- `web/src/app/(site)/kampagne/verifizieren/page.tsx` - Verification-link route that renders activation, invalid, reused, blocked, or error status.
- `web/src/components/campaigns/CreatorCampaignForm.tsx` - Client form for campaign draft submission and German validation feedback.
- `web/src/lib/actions/createCampaignDraft.ts` - Server action for validation, moderation, draft creation, verify token creation, and verification email send.
- `web/src/lib/actions/verifyCampaignEmail.ts` - Server action for token consumption, email verification, moderation re-check, activation, management-token rotation, and management email send.
- `web/src/lib/email/sendCampaignCreatorEmail.ts` - Brevo delivery helper for creator campaign lifecycle emails.
- `web/src/lib/email/buildCampaignCreatorEmailHtml.ts` - Email-safe HTML builder for verification and management copy.

## Decisions Made

- Kept the first validation slice payment-free, matching Phase 5 decision D-14 and the user's explicit no-Stripe constraint.
- Treated reused or expired verification links as a non-destructive status instead of trying to infer or resend from a consumed raw token.
- Did not add `/kampagne/verwalten` in this plan because it is outside the approved 05-02 scope; the management token and email are ready for the later management plan.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed generated duplicate Next type files before TypeScript verification**
- **Found during:** Task 1 verification
- **Issue:** `cd web && npx tsc --noEmit` failed on duplicate generated `.next/types/* 2.ts` definitions, the same generated-artifact issue documented in 05-01.
- **Fix:** Removed only `web/.next/types/routes.d 2.ts`, `web/.next/types/cache-life.d 2.ts`, and `web/.next/types/validator 2.ts`.
- **Files modified:** none tracked
- **Verification:** `cd web && npx tsc --noEmit` passed afterward.
- **Committed in:** not committed; generated build artifacts were untracked.

**2. [Rule 3 - Blocking] Re-ran production build with network access for Google Fonts**
- **Found during:** Overall verification
- **Issue:** Sandboxed `npm run build` failed because `next/font` could not fetch Google Fonts.
- **Fix:** Re-ran `cd web && npm run build` with network access.
- **Files modified:** none tracked
- **Verification:** Production build passed.
- **Committed in:** not committed; no source change.

---

**Total deviations:** 2 auto-fixed (both Rule 3 blocking verification issues).
**Impact on plan:** Verification was unblocked without expanding application scope or changing tracked unrelated files.

## Issues Encountered

- Browser/email inbox end-to-end verification remains pending for the orchestrator/user. I did not create a live campaign through the browser or inspect a real inbox, so I do not claim actual Brevo delivery or link-click verification.
- The management email points at the future `/kampagne/verwalten?token=...` route because this plan creates/rotates the manage token and email, while the management UI is planned separately.

## Known Stubs

None. Stub scan found only normal form placeholder text and the React `null` initial result state.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: public-content-submit | `web/src/lib/actions/createCampaignDraft.ts` | New public server action stores creator-authored campaign text and email. It validates fields and moderates public text before activation. |
| threat_flag: email-token-activation | `web/src/lib/actions/verifyCampaignEmail.ts` | New public token route can activate campaign content. It consumes one-time `verify_email` tokens, re-runs moderation, and avoids duplicate management emails on reused links. |
| threat_flag: transactional-email | `web/src/lib/email/sendCampaignCreatorEmail.ts` | New Brevo emails send creator access links. Raw tokens are only emailed, while hashes remain stored server-side. |

## Verification

- `cd web && npx tsc --noEmit` - passed.
- `cd web && grep -RIn "creator email\|slug\|moderateText\|verify_email" src` - passed.
- `cd web && grep -RIn "awaiting_email_verification\|email_verified_at\|active\|management" src/app src/lib` - passed.
- `cd web && grep -RIn "verify_email\|active\|management" src/lib/email src/lib/actions src/app` - passed.
- `cd web && npm run build` - passed after network-enabled retry for Google Fonts.

## User Setup Required

None beyond existing environment variables used by the app. Live end-to-end verification still requires valid Supabase, Mistral moderation, and Brevo credentials.

## Next Phase Readiness

- Plan 05-03 can build public campaign landing pages that read active campaigns by slug and hand off the editable issue text into the existing wizard.
- Plan 05-04 can consume the created `manage` tokens for creator editing, pause/archive, and revision behavior.
- Human verification should test browser form submission, moderation behavior, verification email receipt, activation, reused-link status, and management email receipt.

## Self-Check: PASSED

- Created files exist on disk.
- Task commits `3853bd8`, `918303d`, and `4adcd84` exist in git history.

---
*Phase: 05-creator-paid-brief-templates-shareable-prefilled-pages*
*Completed: 2026-06-28*

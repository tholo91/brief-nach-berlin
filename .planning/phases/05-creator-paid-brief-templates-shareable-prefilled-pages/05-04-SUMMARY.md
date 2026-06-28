---
phase: 05-creator-paid-brief-templates-shareable-prefilled-pages
plan: 04
subsystem: campaigns-ui
tags: [nextjs, campaigns, moderation, privacy, server-actions]

requires:
  - phase: 05-creator-paid-brief-templates-shareable-prefilled-pages
    provides: Campaign repository, public campaign route, management tokens, and revision snapshots from 05-01 through 05-03
provides:
  - Token-gated creator management page without accounts
  - Moderated campaign edit action with revision-backed publication
  - Pause and archive actions that remove campaigns from the public route without deleting history
  - Datenschutz disclosures for creator email, public campaign metadata, moderation, revisions, and management tokens
affects: [phase-05-campaign-lifecycle, public-campaign-flow, privacy-copy]

tech-stack:
  added: []
  patterns:
    - cookie-backed management session gate for creator campaign actions
    - moderation-before-public-update for creator edits
    - status-only lifecycle actions for pause/archive

key-files:
  created:
    - web/src/app/(site)/kampagne/verwalten/page.tsx
    - web/src/components/campaigns/CampaignManager.tsx
    - web/src/lib/actions/updateCampaign.ts
    - web/src/lib/actions/pauseCampaign.ts
    - web/src/lib/actions/archiveCampaign.ts
  modified:
    - web/src/app/(site)/datenschutz/page.tsx
    - web/src/lib/email/sendCampaignCreatorEmail.ts

key-decisions:
  - "Creator management remains a single no-account page gated by emailed manage tokens and the existing short-lived management cookie."
  - "Campaign edits are moderated before replacing the public campaign fields; rejected edits return a recoverable message and leave active public text unchanged."
  - "Pause and archive are status transitions only; public campaign routes already serve active campaigns only."

patterns-established:
  - "Server actions read the management session server-side and reject mismatched campaign IDs."
  - "Successful edit actions call repository publication so campaign_revisions receives an edited snapshot."

requirements-completed: [ENGM-03, SAFE-03, PRIV-01, PRIV-04]

duration: 6min
completed: 2026-06-28
---

# Phase 5 Plan 4: Creator Management Summary

**Token-gated creator campaign management with safe public edits, pause/archive controls, revision snapshots, and matching privacy disclosures**

## Performance

- **Duration:** 6 min
- **Started:** 2026-06-28T14:48:25Z
- **Completed:** 2026-06-28T14:54:33Z
- **Tasks:** 3 automated tasks complete; 1 human-verification checkpoint recorded as pending
- **Files modified:** 7

## Accomplishments

- Added `/kampagne/verwalten` with management-token exchange, existing management-session support, campaign status display, edit form, pause action, and archive action.
- Added server actions for update, pause, and archive; each action checks the server-side management session and rejects campaign-ID mismatches.
- Made edits publish-safe by moderating the proposed public text before changing campaign fields. Failed moderation does not replace the active public text.
- Successful edits update public campaign fields, mark moderation approved, create an `edited` revision snapshot through the repository publication helper, and revalidate the public slug.
- Extended Datenschutz copy for creator email processing, public campaign metadata, moderation/publication handling, campaign revisions, management tokens, and the no-account cookie flow.
- Adjusted the creator management email subject so it says campaign management, not account access.

## Task Commits

1. **Task 1 + 2: Creator management surface and safe revision-backed edits** - `53f335b` (feat)
2. **Task 3: Datenschutz and creator email wording** - `bb2863f` (docs)

**Plan metadata:** final docs commit

## Files Created/Modified

- `web/src/app/(site)/kampagne/verwalten/page.tsx` - Token/session-gated creator management page.
- `web/src/components/campaigns/CampaignManager.tsx` - German management UI for status, public fields, pause, and archive controls.
- `web/src/lib/actions/updateCampaign.ts` - Moderates proposed edits before updating public campaign fields and publishing an edited revision snapshot.
- `web/src/lib/actions/pauseCampaign.ts` - Pauses active campaigns through the repository after validating the management session.
- `web/src/lib/actions/archiveCampaign.ts` - Archives campaigns through the repository after validating the management session.
- `web/src/app/(site)/datenschutz/page.tsx` - Adds explicit campaign lifecycle, creator email, public metadata, moderation, revisions, token, and cookie disclosures.
- `web/src/lib/email/sendCampaignCreatorEmail.ts` - Updates management email subject wording.

## Decisions Made

- Combined Task 1 and Task 2 into one code commit because the management page, edit form, and safe edit action compile as one feature surface.
- Did not add analytics, accounts, a dashboard, multi-campaign admin navigation, or Stripe/payment handling.
- Did not modify the email HTML helper because the existing body copy already says no account, management link, creator-side storage only, and no visitor-brief storage.

## Deviations from Plan

None - plan behavior executed as written. Commit granularity for Task 1 and Task 2 was combined because separating the management UI from the edit action would leave the first task in a non-compiling state.

## Issues Encountered

- Human verification remains pending by design. I did not perform browser or live database verification, and this summary does not claim those checks.

## Known Stubs

None. Stub scan found only the local `campaign = null` branch used for the access-denied render path.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: public-content-management | `web/src/lib/actions/updateCampaign.ts` | New server action can replace public campaign content. It validates the management session and moderates proposed text before updating. |
| threat_flag: campaign-lifecycle-control | `web/src/lib/actions/pauseCampaign.ts`, `web/src/lib/actions/archiveCampaign.ts` | New server actions change public campaign availability. They require a valid management session and use repository status transitions. |
| threat_flag: management-token-route | `web/src/app/(site)/kampagne/verwalten/page.tsx` | New route exchanges manage tokens for short-lived management sessions and loads campaign data server-side. |

## Verification

- `cd web && npx tsc --noEmit` - passed.
- `cd web && rg -n "pause|archive|status|manage|pausieren|archivieren|Status|verwalten" src/app src/components src/lib/actions` - passed.
- `cd web && rg -n "campaign_revisions|moderation|snapshot|publishCampaignRevision|moderateText" src/lib/actions src/lib/campaigns` - passed.
- `cd web && grep -q "Kampagne" "src/app/(site)/datenschutz/page.tsx" && grep -q "E-Mail" "src/app/(site)/datenschutz/page.tsx"` - passed.

## Human Verification Pending

The plan checkpoint still needs product verification:

1. Open a real creator management link.
2. Change campaign title, issue text, description, creator name, and external link.
3. Confirm the public slug updates directly after a successful edit.
4. Confirm a new `campaign_revisions` snapshot exists in the database.
5. Submit text that fails moderation and confirm the previous public text remains active.
6. Pause the campaign and confirm the public route disappears.
7. Archive the campaign and confirm history remains intact.
8. Read the Datenschutz additions and confirm they match the actual creator flow.

## User Setup Required

None for code. Live verification still requires valid Supabase, Mistral moderation, and Brevo credentials plus a real management token.

## Next Phase Readiness

Phase 5 is now operational in code for the no-account creator campaign lifecycle. Remaining work is human/browser/database verification, not additional feature scope.

## Self-Check: PASSED

- Summary file exists on disk.
- Task commits `53f335b` and `bb2863f` exist in git history.

---
*Phase: 05-creator-paid-brief-templates-shareable-prefilled-pages*
*Completed: 2026-06-28*

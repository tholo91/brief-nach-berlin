---
phase: quick-261021-ot3
plan: 01
subsystem: campaigns
tags: [server-action, rate-limit, session, brevo]
status: complete
requirements: [QUICK-261021-ot3]
key-files:
  created:
    - web/src/lib/actions/requestCampaignManageLink.ts
    - web/src/components/campaigns/ManageLinkRequestForm.tsx
    - web/src/__tests__/requestCampaignManageLinkAction.test.ts
  modified:
    - web/src/lib/campaigns/repository.ts
    - web/src/lib/rateLimit.ts
    - web/src/app/(site)/kampagne/verwalten/page.tsx
    - web/src/lib/campaigns/session.ts
    - web/src/app/(site)/kampagne/verwalten/zugang/route.ts
    - web/src/lib/actions/acceptCampaignTransfer.ts
    - web/src/__tests__/campaignTransferAccess.test.ts
    - web/src/__tests__/campaignManagementSession.test.ts
decisions:
  - "Self-service manage-link mail covers only verified, running campaigns in status awaiting_approval, active, paused"
  - "No admin BCC on self-service mails"
  - "Older manage tokens stay valid; only the token of a failed send is revoked"
  - "Single exported 7-day SESSION_TTL_SECONDS in session.ts"
commits: 3
plan_head_before: 46f217da8f10fc3b49b8b60f44583ad82a65e3ca
plan_head_after: 687282b
actuals:
  tasks: 3
  commits: 3
---

# Phase quick-261021-ot3 Plan 01: Kampagne verwalten, Link anfordern Summary

Creators without a valid session can request a fresh management link by e-mail on /kampagne/verwalten, and the management session now lasts 7 days from one shared constant.

## Commits

- 3b3109d feat: requestCampaignManageLinkAction, getManageableCampaignsByCreatorEmail, LIMITS.MANAGE_LINK_PER_IP (5/h) and MANAGE_LINK_PER_EMAIL (2/h), 9 tests
- 6143247 feat: ManageLinkRequestForm and redesigned AccessNotice (MailIcon extracted, PlusIcon added)
- 687282b feat: SESSION_TTL_SECONDS = 7 days exported from session.ts, used by zugang route and acceptCampaignTransfer (third duplicate removed)

## Verification

- jest (5 suites: requestCampaignManageLinkAction, campaignManagementSession, campaignCreatorEmail, campaignTransferAccess, acceptCampaignTransferAction): 49/49 passed
- eslint on all touched files: clean
- tsc --noEmit: no errors in src. Only pre-existing errors in iCloud duplicate files `.next/types/*d 4.ts` (unrelated)
- Visual check not done by the executor (orchestrator does the browser check)

## Deviations from Plan

None - plan executed as written. Minor implementation notes:
- RED/GREEN for Task 3 was one pass (tests and change written together, no separate failing run).
- The action also tries to revoke the fresh token if a later step throws after the token was created.

## Deliberate limits

- Ended, archived, blocked, draft and unverified campaigns are not covered by the self-service mail (the "management" mail copy would say "aktiv"). Those creators keep the "Thomas schreiben" path.
- No admin BCC is sent on self-service mails (usage visible via Brevo tag campaign-management).

## Known Stubs

None.

## Threat Flags

None beyond the plan's threat model.

## Self-Check: PASSED

Files exist, commits 3b3109d, 6143247, 687282b are on HEAD.

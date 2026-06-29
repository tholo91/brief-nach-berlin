---
status: blocked
phase: 05-creator-paid-brief-templates-shareable-prefilled-pages
source:
  - 05-VERIFICATION.md
started: 2026-06-28T15:08:44Z
updated: 2026-06-28T19:55:38Z
---

# Phase 05 Human UAT

## Current Test

Live UAT re-run against `http://127.0.0.1:3000` on 2026-06-28 after `web/supabase/migrations/008_campaigns.sql` was applied.

Test campaign:

- slug: `uat-phase5-1782673591619`
- final DB status before archive fix: `paused`
- public route after pause before archive fix: `404`
- revisions written: `created`, `activated`, `edited`

Code update after live UAT:

- Archive bug fixed in `web/src/components/campaigns/CampaignManager.tsx`.
- Lifecycle buttons now stay disabled while pause/archive server actions are in flight.
- Successful pause/archive actions refresh the management page from server state before the next lifecycle action.

Blocking bugs found and fixed during UAT:

1. Verification consumed the token before successful activation. The first activation attempt left `email_verified_at` set, `status = awaiting_email_verification`, and the verify token used.
   - affected: `web/src/lib/actions/verifyCampaignEmail.ts`, `web/src/lib/campaigns/repository.ts`, `web/src/lib/campaigns/tokens.ts`
2. Management links tried to set cookies from a Server Component. Next.js rejected this with `Cookies can only be modified in a Server Action or Route Handler`.
   - affected: `web/src/app/(site)/kampagne/verwalten/page.tsx`, `web/src/app/(site)/kampagne/verwalten/zugang/route.ts`
3. Archive from the management UI could leave the campaign in `paused` because lifecycle actions did not keep the UI locked/refreshed around async mutations.
   - affected: `web/src/components/campaigns/CampaignManager.tsx`

Remaining external retest:

1. The test recipient `uat-phase5-1782673591619@brief-nach-berlin.de` hard-bounced / was blocked by Brevo, so real inbox usability was not proven.

Verification commands:

- `cd web && npm run build`: passed after archive fix.
- `cd web && ./node_modules/.bin/tsc --noEmit --incremental false`: passed.

## Tests

### 1. Creator activation flow end to end
expected: Draft is not public before email verification; verification email arrives; opening it activates the campaign; management email arrives with a working access link.
result: [failed]
actual: Draft creation worked, draft public route returned `404`, verification email was generated, opening the verification link activated the campaign after the token/activation fix, and a management email was generated. The UAT still fails the real-inbox part because Brevo logged `hard_bounce` for the verification email and `blocked` for the management email to the generated test address.
repro: Create a campaign with a non-existent `@brief-nach-berlin.de` test recipient. Brevo transactional logs show the emails, but events include `hard_bounce` / `blocked`.
affected: test setup / live email deliverability, `web/src/lib/email/sendCampaignCreatorEmail.ts`

### 2. Public campaign browser flow
expected: Active `/kampagne/[slug]` renders the campaign page; edited issue text opens `/app` prefilled; issue text is not present in the URL; browser-back draft restore works.
result: [passed]
actual: Active `/kampagne/uat-phase5-1782673591619` rendered. Edited issue text opened `/app?step=1`; the edited text appeared in the wizard textarea; the URL contained no issue text; browser-back restored the edited campaign draft on the public page.

### 3. Creator management lifecycle
expected: Management link opens the editor; edit publishes to the same public slug; failed moderation preserves old public text; pause/archive remove the public route.
result: [pending]
actual: Management link opened the editor after the route-handler cookie fix. Safe edit published to the same slug. A moderation-rejected edit showed the expected rejection and preserved the previous public text. Pause changed DB status to `paused` and public route returned `404`. Archive was fixed after UAT by locking lifecycle buttons during async mutations and refreshing server state after successful pause/archive actions.
repro: Pre-fix: open management for `uat-phase5-1782673591619`, pause it, reload management, click `Kampagne archivieren`; DB remains `status = paused`, `archived_at = null`.
affected: `web/src/components/campaigns/CampaignManager.tsx`

### 4. Revision history in live Supabase
expected: Create/activate/edit write `campaign_revisions` rows, `last_published_revision_id` points at the latest published snapshot, and history remains after pause/archive.
result: [pending]
actual: `campaign_revisions` contains `created`, `activated`, and `edited`; `last_published_revision_id` points to the `edited` revision; history remained after pause. Archive fix is implemented; history after archive should be verified in the final real-inbox retest with a fresh campaign.
repro: Use the final real-inbox campaign, archive it from management, then inspect `campaign_revisions` and `campaigns.archived_at`.
affected: `web/src/components/campaigns/CampaignManager.tsx`

### 5. Email client/link-scanner behavior
expected: Verification and management links are usable from the creator inbox and are not burned by previews/scanners before the creator acts.
result: [failed]
actual: Real inbox behavior was not proven because the generated test address bounced/blocked. A token-burn bug was found and fixed for verification. A management-token burn bug was found and fixed by moving cookie creation into a route handler. Because the test address was not deliverable, the final end-user email-client path still needs a real inbox retest.
repro: Use generated test address, inspect Brevo events. Then use a real mailbox to retest link preview/scanner behavior.
affected: test setup / live email deliverability, `web/src/lib/campaigns/tokens.ts`, `web/src/app/(site)/kampagne/verwalten/zugang/route.ts`

## Summary

total: 5
passed: 1
issues: 1
pending: 2
skipped: 0
blocked: 1

## Gaps

1. Re-run the email parts with a real inbox address, not a generated non-existent recipient.
2. Use a single fresh campaign after the fixes so the management link tested is the actual emailed link, not a replacement token created after the pre-fix token was burned.
3. In that same fresh campaign, verify archive changes DB status to `archived`, sets `archived_at`, keeps the public route at `404`, and preserves `campaign_revisions`.

---
phase: 05
source_review: 05-REVIEW.md
status: fixed
fixed: 2026-06-28
---

# Phase 05 Review Fixes

## Fixed

- CR-01: `externalUrl` is now validated centrally through `campaignExternalUrlSchema` and only accepts `http:` or `https:` URLs before storage or later edits.
- WR-02: campaign edits now publish through `publishCampaignEdits`, which creates the edited revision before updating the public campaign row and `last_published_revision_id`.
- WR-01 mitigation: successful verification and management token exchanges now redirect to token-free URLs after consumption.

## Verification

- `cd web && npx tsc --noEmit` - passed.
- `cd web && npm run build` - passed.

## Remaining Manual Checks

- Browser/inbox/live Supabase verification is still pending: real creator email receipt, token click flow, management edit, moderation rejection, revision row inspection, pause/archive public-route disappearance.

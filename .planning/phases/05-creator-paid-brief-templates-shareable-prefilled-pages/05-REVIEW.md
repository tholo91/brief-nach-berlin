---
status: issues_found
phase: 05
depth: standard
reviewed: 2026-06-28T15:00:56Z
reviewed_files: 24
files_reviewed_list:
  - web/src/app/(site)/datenschutz/page.tsx
  - web/src/app/(site)/kampagne/[slug]/page.tsx
  - web/src/app/(site)/kampagne/starten/page.tsx
  - web/src/app/(site)/kampagne/verifizieren/page.tsx
  - web/src/app/(site)/kampagne/verwalten/page.tsx
  - web/src/components/campaigns/CampaignHero.tsx
  - web/src/components/campaigns/CampaignIssueStarter.tsx
  - web/src/components/campaigns/CampaignManager.tsx
  - web/src/components/campaigns/CreatorCampaignForm.tsx
  - web/src/components/wizard/WizardShell.tsx
  - web/src/lib/actions/archiveCampaign.ts
  - web/src/lib/actions/createCampaignDraft.ts
  - web/src/lib/actions/pauseCampaign.ts
  - web/src/lib/actions/updateCampaign.ts
  - web/src/lib/actions/verifyCampaignEmail.ts
  - web/src/lib/campaigns/repository.ts
  - web/src/lib/campaigns/schema.ts
  - web/src/lib/campaigns/session.ts
  - web/src/lib/campaigns/tokens.ts
  - web/src/lib/email/buildCampaignCreatorEmailHtml.ts
  - web/src/lib/email/sendCampaignCreatorEmail.ts
  - web/src/lib/landing-draft.ts
  - web/src/lib/wizard-handoff.ts
  - web/supabase/migrations/008_campaigns.sql
findings:
  critical: 1
  warning: 2
  info: 0
  total: 3
---

# Phase 05: Code Review Report

**Reviewed:** 2026-06-28T15:00:56Z  
**Depth:** standard  
**Files Reviewed:** 24  
**Status:** issues_found

## Summary

Reviewed the Phase 05 campaign creation, public campaign page, token/session management, creator management actions, email links, privacy copy, and Supabase migration. The service-role-only storage and RLS baseline are directionally sound, but three issues need fixes before live validation: unsafe external URL schemes, single-use token consumption on GET page render, and non-atomic campaign publication updates.

## Critical Issues

### CR-01: Stored unsafe external links can execute script URLs

**File:** `web/src/lib/campaigns/schema.ts:65`, `web/src/components/campaigns/CampaignHero.tsx:31`  
**Issue:** Campaign `externalUrl` is validated only with `z.string().url()`. Zod/URL-style validation can accept non-HTTP schemes such as `javascript:`. The public campaign page then renders that creator-controlled value directly as an `<a href>` around the attribution link. A malicious campaign creator can publish a link that executes script when a visitor clicks the attribution.
**Fix:** Restrict campaign external URLs to `https:` and optionally `http:` before storing or rendering.

```ts
const publicExternalUrlSchema = z
  .string()
  .trim()
  .url()
  .max(500)
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "https:" || protocol === "http:";
  }, "Bitte gib eine http(s)-Adresse ein.");
```

Use this schema in both create/update campaign validation paths, or move it into `campaignPublicFieldsSchema` so repository writes enforce it centrally.

## Warnings

### WR-01: Single-use campaign tokens are consumed by GET page render

**File:** `web/src/app/(site)/kampagne/verifizieren/page.tsx:17`, `web/src/app/(site)/kampagne/verwalten/page.tsx:47`  
**Issue:** Visiting `/kampagne/verifizieren?token=...` immediately consumes the verification token and activates the campaign during server render. Visiting `/kampagne/verwalten?token=...` immediately consumes the manage token and sets a session. Email security scanners, browser/link previews, or accidental prefetches can burn these one-time links before the creator opens them. For manage links, that can lock the creator out because there is no resend/recovery path in this phase.
**Fix:** Add an explicit confirmation step before consuming tokens, or make the token exchange idempotent/recoverable. At minimum, redirect after successful exchange to strip `token` from the URL and add a resend/reissue path for failed/expired manage links.

### WR-02: Campaign edits become public before the revision publication step is guaranteed

**File:** `web/src/lib/actions/updateCampaign.ts:96`, `web/src/lib/actions/updateCampaign.ts:103`, `web/src/lib/actions/updateCampaign.ts:104`, `web/src/lib/campaigns/repository.ts:235`  
**Issue:** `updateCampaignAction` first writes the new public campaign fields, then separately sets moderation status, then separately creates/publishes the revision. Because public campaign pages read the current `campaigns` row, a failure between these steps can leave changed public text visible without the promised `campaign_revisions` snapshot. This violates the phase intent that successful edits are revision-backed and that failed publication leaves the current public state unchanged.
**Fix:** Move edit publication into a single repository function or database transaction: validate status, write moderated fields and moderation status, create the revision, set `last_published_revision_id`, then commit. If any step fails, rollback so the active public row remains unchanged.

## Residual Risks / Test Gaps

Browser/inbox/live Supabase verification pending: form submission, Brevo delivery, verification link handling, management link handling, moderation rejection behavior, revision snapshot creation, pause/archive public-route disappearance, and live RLS/migration application were not verified in this review.

## Review Complete

_Reviewed: 2026-06-28T15:00:56Z_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: standard_

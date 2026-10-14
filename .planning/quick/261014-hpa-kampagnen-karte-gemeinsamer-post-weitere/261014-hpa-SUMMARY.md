---
phase: quick-261014-hpa
plan: 01
subsystem: campaigns
tags: [copy, referral-card, share]
status: complete
commits: 0
requirements: [QUICK-261014-hpa]
---

# Quick 261014-hpa: Kampagnen-Karte, gemeinsamer Post statt "Thomas vorstellen"

CampaignReferralCard on /kampagne/verwalten now asks for a joint post (filled mailto button with `Gemeinsamer Post: <slug>` subject) and a recommendation (outline share button), with the approved copy verbatim and hyphenated brand.

## Changes (all uncommitted, per user hard rule)

- `web/src/components/campaigns/CampaignReferralCard.tsx`: `slug` prop, `jointPostHref` (encodeURIComponent subject), new H2/paragraph/donation line, button order swapped, old introduce link removed.
- `web/src/components/campaigns/CampaignReferralShareButton.tsx`: label "Brief-nach-Berlin weiterempfehlen", outline classes plus `gap-2 whitespace-normal text-balance` so it can wrap on narrow phones.
- `web/src/lib/share.ts`: `buildCampaignStartShare` subject/text per approved plan, imports `BRIEF_EMAIL` from `@/lib/contact`.
- `web/src/app/(site)/kampagne/verwalten/page.tsx`: `<CampaignReferralCard slug={authorizedCampaign.slug} />`.
- `web/src/__tests__/campaignCreatorStats.test.ts`: CampaignReferralCard block updated (slug render, locked copy, joint-post mailto + order, shared text, brand spelling, no dashes).

## Verification

- Jest (campaignCreatorStats, campaignMilestoneEmail, shareRecipients, campaignManagerLayout): 4/4 suites, 128/128 tests pass. RED confirmed first (3 failing) before implementation.
- ESLint on the 5 files: clean.
- tsc --noEmit (excluding .next/): 0 errors in files of this task. 30 errors exist, all in `src/__tests__/creatorSurvey.test.ts`, caused by a parallel uncommitted task (quick 261014-hhs, `creatorSurvey.ts` is in flux). Not touched here.
- No "Brief nach Berlin" (spaced) or em/en dashes in the three changed source files.
- No git add/commit/stash/push run.

## Deviations from Plan

None. Tasks 1 and 2 were executed together (one RED run, one GREEN pass); the end state matches both tasks.

## Open gaps

- Mobile 375px visual check not performed (needs a valid manage token). The wrap fallback is applied; risk is cosmetic only. OPEN for Thomas.
- `npm run lint` (full) was not run, only eslint on the 5 files.
- Working tree also contains uncommitted changes from other work (`creatorSurvey.test.ts`, `creatorSurvey.ts`, `MIGRATION_STATUS.md`, migration 034); not part of this task.

## Self-Check: PASSED

---
phase: quick-261021-oy6
plan: 01
subsystem: letter-pipeline, mail-paths, campaigns
tags: [hardening, rate-limit, generation-proof, retry-safety]
requires: []
provides:
  - generic 500 from /api/generate-letter with retrySafe true
  - no mismatch hint for running campaigns
  - resendLetterAction requires verified generation proof for every recipient kind
  - LIMITS.CAMPAIGN_DRAFTS (IP + e-mail bucket) on createCampaignDraftAction
affects: [Step3Success retry flow, resend, campaign creation]
key-files:
  modified:
    - web/src/app/api/generate-letter/route.ts
    - web/src/lib/actions/resendLetter.ts
    - web/src/lib/actions/createCampaignDraft.ts
    - web/src/lib/rateLimit.ts
    - web/src/__tests__/generateLetterRouteHardening.test.ts
    - web/src/__tests__/recipientSelectionHardening.test.ts
    - web/src/__tests__/schreibMerzResend.test.ts
    - web/src/__tests__/campaignModeration.test.ts
decisions:
  - Legacy numeric selection in resendLetterAction removed (no caller)
  - Rate-limit message for campaign drafts uses informal du, one shared bucket config for IP and e-mail
status: complete
commits: 3
plan_head_before: 1cbd376
plan_head_after: 8cd4b974a6950232c49ce24cce1c17fe71c654a3
actuals:
  tokens: 5600
  tasks: 3
  commits: 3
completed: 2026-10-21
---

# Phase quick-261021-oy6 Plan 01: Briefseite und Mailschutz Summary

Three hardening fixes, one commit each: generic generate-letter 500 is retry-safe, running-campaign letters lose the Zuständigkeits-Hinweis, resend needs a verified generation proof for all recipient kinds, campaign draft creation is rate-limited per IP and e-mail before any costly side effect.

## Commits

| Task | Hash | Subject |
| ---- | ---- | ------- |
| 1 | fee29ae | fix(generate-letter): 500er retry-sicher, kein Zuständigkeits-Hinweis bei Kampagnen |
| 2 | 4c6d2e2 | fix(resend): erneut senden nur mit Generierungsnachweis |
| 3 | 8cd4b97 | fix(kampagnen): Rate-Limit für Kampagnenanlage |

## What changed

1. route.ts: generic 500 returns `retrySafe: true`; `mismatchRecommendedLevel` is only set when no campaign is running. Routing telemetry (`routingInfo`) is unchanged. Step3Success.tsx untouched.
2. resendLetter.ts: proof schema required, verified before step validation, limits and mail; `doesGenerationProofMatch` unconditional; numeric legacy selection removed (grep confirmed only caller is Step3Success with a RecipientSelection). Signature keeps `generationProof?` optional so the client needs no change.
3. rateLimit.ts + createCampaignDraft.ts: `CAMPAIGN_DRAFTS` (5 per hour) for `campaign-draft:ip:` and `campaign-draft:email:` buckets (hashed), checked after validation and before logo upload, moderation, DB and mail.

## Tests

Red first for each task, then green. All 8 named suites pass: 92 tests. ESLint clean, no tsc errors in touched files. No unmocked Mistral calls.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

Commits fee29ae, 4c6d2e2, 8cd4b97 exist on main; unrelated dirty files remain unstaged.

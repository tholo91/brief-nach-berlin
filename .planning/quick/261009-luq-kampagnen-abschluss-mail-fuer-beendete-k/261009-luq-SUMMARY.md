---
phase: quick
plan: 261009-luq
subsystem: campaign-emails
tags: [email, campaigns, brevo]
status: complete
commits: 0
key-files:
  modified:
    - web/src/lib/email/buildCampaignCreatorEmailHtml.ts
    - web/src/lib/email/sendCampaignCreatorEmail.ts
    - .planning/todos/pending/2026-10-08-kampagnen-s4-danke-mail-zum-kampagnenende.md
  created:
    - web/scripts/send-campaign-ended-mail.ts
    - web/src/__tests__/campaignEndedEmail.test.ts
---

# Quick 261009-luq: Kampagnen-Abschluss-Mail (kind "ended")

New creator mail kind `ended` (thank-you with final count, share box, stats box, feedback box, small donation hint via button row), plus a one-off script that previews or sends it. Nothing committed, nothing sent, no DB writes, campaign not ended.

## What changed

- Shared helpers extracted from the milestone mail: `outlineButton`, `buildButtonRow`, `buildShareBox`, `buildCampaignImageEmailShell`. Milestone output verified byte-identical (50 and 500 letters, compared against pre-refactor render).
- `buildCampaignEndedEmailHtml` with the German copy taken verbatim from the plan; no financing block, no em/en dashes.
- `sendCampaignCreatorEmail`: `ended?: { count }`, image/download URL via `milestoneImageUrl`, subject `Danke für N Briefe zu „Titel“`, `replyTo` FOUNDER_EMAIL for `report` and `ended`, tag `campaign-ended`.
- `scripts/send-campaign-ended-mail.ts`: preview by default (read-only select), `--send` creates a manage token inline (same table/hash/TTL as `tokens.ts`) and lazily imports the sender. `--send` was NOT run.
- Todo updated with "Stand 2026-10-09".

## Verification

- Jest (milestone, creator, ended): 3 suites, 41 tests passed.
- ESLint on the 4 changed/new code files: clean.
- `tsc --noEmit`: no errors in changed files. Pre-existing errors elsewhere: `.next/dev/types/*3.ts` (iCloud duplicate files) and `src/__tests__/campaignTopicReset.test.ts`.
- Preview rendered to `preview/ended.html`, screenshots `ended-640.png`, `ended-375.png` (same folder).

## Deviations from Plan

None in behavior. Notes:
- Tests went into a new file `campaignEndedEmail.test.ts` (Brevo-mocked send path was not in the existing builder tests).

## Open observations

- The header image (production image route) has "Brief-nach-Berlin · Meilenstein" baked into the picture, so the ended mail shows "Meilenstein" at the top. Fix would be in the image route (not in scope).
- The preview recipient is the real `creator_email` from the DB; `--to` overrides it.

## Self-Check: PASSED

---
phase: quick-261009-j9j
verified: 2026-10-09T00:00:00Z
status: human_needed
score: 9/9 must-haves verified (code level)
covered_files:
  - ".planning/quick/261009-j9j-kampagnen-meilenstein-mails-an-ersteller/261009-j9j-PLAN.md"
  - ".planning/quick/261009-j9j-kampagnen-meilenstein-mails-an-ersteller/261009-j9j-SUMMARY.md"
  - "web/src/lib/campaigns/milestoneNotification.ts"
  - "web/src/lib/campaigns/milestones.ts"
  - "web/src/lib/email/buildCampaignCreatorEmailHtml.ts"
  - "web/supabase/migrations/027_campaign_milestones.sql"
covered_digest: "v3:sha256:0f5734f3001ea485b7df70bfeeabccefda8dcb8c53fbfdba2beff67ed5ae1533"
behavior_unverified: 0
human_verification:
  - test: "Open preview/milestone-50-640.png, milestone-50-375.png, milestone-500-640.png, milestone-500-375.png and management-active-375.png and compare with prompts/meilenstein-mail/assets/vorschau-v4.jpg"
    expected: "Section order, header image with number above the dome, 3 stacked buttons below 500, support box from 500, four share buttons equal height at 375 px"
    why_human: "Visual fidelity; I did not read or re-render the screenshots"
  - test: "After applying migration 027 in Supabase, trigger a letter on a test campaign just below a stufe (not done here)"
    expected: "Exactly one milestone mail to the creator, BCC to Thomas; a concurrent second request sends nothing"
    why_human: "The conditional-update claim is only tested against an in-memory fake client; real PostgREST/Postgres semantics and live Brevo are not exercised. Migration is intentionally not applied."
  - test: "Decide on the support box button labels (SUMMARY open question 1: existing labels vs. 'Ueber WE AID unterstuetzen' / 'Wohin das Geld geht' in the reference)"
    expected: "Thomas picks one"
    why_human: "Copy decision"
---

# Quick 261009-j9j: Meilenstein-Mails Verification Report

**Goal:** Implement the todo "Kampagnen: Meilenstein-Mails an Ersteller" per Solution, Design and Check; preview for 50/500 letters at 640/375 px; migration 027 as file only; no real send; no push.
**Status:** human_needed (no gaps found in code; visual sign-off and live claim behavior need Thomas)

## Test run (own execution)

`npm --prefix web test -- campaignMilestones campaignMilestoneEmail campaignMilestoneImage campaignCreatorEmail`: 4 suites, 70 tests, all passed. I did not run lint, build or the full suite (build failure from untracked " 2" iCloud duplicates reported in SUMMARY is unverified by me).

## Explicitly requested checks

| # | Check | Status | Evidence |
|---|-------|--------|----------|
| 1 | Claim is a conditional update (milestone_notified < M AND milestone_mails_enabled) and only the row-returning request sends | VERIFIED | `milestoneNotification.ts`: `.update({milestone_notified: M}).eq("id").lt("milestone_notified", M).eq("milestone_mails_enabled", true).select("id")`; returns unless `claimed` has a row; token + send only afterwards. Never throws, logs slug/stufe/message only (no creator email). Promise.all idempotency test passes against fake client. |
| 2 | Hook only for active, non-ended campaigns | VERIFIED | `generate-letter/route.ts` diff: first statement in `after()` is `if (campaign && letterNumber !== undefined) await claimAndSendCampaignMilestone(campaign.slug)`; `campaign` is `runningCampaign(...)` per plan; the claim re-checks `status === "active"`, `!isCampaignEnded`, `milestone_mails_enabled !== false` against fresh data. Route tests (campaign / non-campaign / ended) pass. |
| 3 | Spendenbox only at >= 500 | VERIFIED | `buildMilestoneEmailHtml`: `showSupport = milestone.count >= 500`; below 500: three buttons Verwalten / Unterstützen (DONATION_PROVIDER_URL) / Thomas schreiben, no support block; from 500: support block with `milestoneHeading` + two buttons. |
| 4 | Copy matches todo verbatim | VERIFIED | Greeting "Moin {Name}," / "Moin,"; both paragraphs match the todo text character for character; "Fortschritt teilen", "Bild speichern", share text "Schon N Briefe für „<Titel>“. Schreibst du auch einen?", heading "Schön, dass deine Kampagne so wächst 🥳", footer "Meilenstein-Mail", "Du bekommst diese Mail bei {Stufen} Briefen.", "Diese Mails abbestellen", Kampagnenseite/Impressum/Datenschutz/Feedback + social follow. |
| 5 | Unsubscribe link goes to manage link, no GET unsubscribe | VERIFIED | Link is `${actionUrl}#meilenstein-mails` (management access); card `<section id="meilenstein-mails">` in `CampaignManager.tsx` outside the collapsed settings; change happens through `setMilestoneMailsAction` (session, campaignId, creatorEmail, ended checks). No other abbestell/unsubscribe code in `src` besides builder and its test. |
| 6 | Migration 027 defaults match todo | VERIFIED | `milestones integer[] not null default '{50,100,500,1000,2000,5000}'`, `milestone_notified integer not null default 0`, `milestone_mails_enabled boolean not null default true`; file only (commits touch no Supabase; SUMMARY says not applied). |
| 7 | No em/en dashes in new user-facing strings | VERIFIED | grep for U+2013/U+2014 across added lines of all three commits (excluding binaries/OFL): 0 hits. |

## Other must-haves

| Truth | Status | Evidence |
|-------|--------|----------|
| reachedMilestone semantics (49/50/730/6000, custom stufen, empty, unsorted, <=0) | VERIFIED | `milestones.ts` logic reviewed; covered by passing tests. |
| Image route 1200x805, 404 rules, dev-only `vorschau`, download header/caption | VERIFIED (code + tests) | `route.tsx`: slug/stufe validation, approved + active/paused + stufe <= letterCount, `vorschau` only when NODE_ENV development, attachment header only with `download=1`, cache headers on 200. Rendered output not viewed by me. |
| Share buttons 48 px and LinkedIn badge class in both blocks | VERIFIED (code) | Shared `buildShareButtonsTable`/`shareIconHtml`; badge has `bnb-share-icon bnb-share-badge`; media query `.bnb-share-btn { height: 48px; box-sizing: border-box }`. Measured pixel height is a SUMMARY claim, not re-measured. |
| Create/manage switches, default on, rollout-safe insert | VERIFIED | `createCampaignDraft.ts` `!== "off"`; repository insert spreads column only when disabled; action and card as above. |
| Preview 50/500 at 640/375 exists, no send | VERIFIED (existence) | `preview/` holds 3 HTML + 6 PNG. Script builds HTML via the builder only (not re-run). |

## Anti-patterns / notes (non-blocking)

1. Claim runs first inside `after()`, so a slow Brevo call for the milestone mail precedes the letter mail (SUMMARY item 7; easy to move).
2. Image PNGs are 1.24 to 1.29 MB (SUMMARY claim, not re-measured); mail load size is a minor concern.
3. Build in the real working tree fails because of untracked iCloud " 2" duplicates (not part of this task); not re-verified by me.
4. Migration 027 must be applied in Supabase before this reaches deployed main; until then no milestone mails go out and the claim only logs.

## Gaps

None.

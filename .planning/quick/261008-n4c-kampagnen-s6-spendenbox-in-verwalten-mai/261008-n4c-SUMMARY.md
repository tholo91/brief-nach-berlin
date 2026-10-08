---
quick_id: 261008-n4c
phase: quick-261008-n4c
plan: 01
subsystem: email
tags: [email, campaigns, donation, financing-notice]
status: complete
requirements: [kampagnen-s6]
key-files:
  created:
    - web/src/lib/email/financingNotice.ts
    - web/src/__tests__/financingNotice.test.ts
    - web/public/images/thomas-avatar.jpg
  modified:
    - web/src/lib/email/buildEmailHtml.ts
    - web/src/lib/email/buildCampaignCreatorEmailHtml.ts
    - web/src/lib/support-content.ts
    - web/src/__tests__/campaignCreatorEmail.test.ts
decisions:
  - "Financing notice markup moved verbatim into a shared module taking its copy as parameter; Brief-Mail notice unchanged (de/en/tr)"
  - "Support box is the last block of the creator mail content cell, only for management_pending and management (active and paused)"
  - "Follow-up: round photo top right in the box heading row, Kampagne verwalten and Thomas schreiben inside the Verwaltungszugang box (Thomas schreiben replaces Feedback geben), footer links to /petition-starten and /kampagne-starten"
commits: 2
commits_note: "12f70db feat(seo) (the two SEO subpages from quick 261008-mdu, committed together on Thomas's request) and 10e3a71 feat(email) (this task's code). Docs commit follows. No push."
actuals:
  tasks: 2
  commits: 2
---

# Quick 261008-n4c: Kampagnen S6, Spendenbox in der Verwalten-Mail

The Brief-Mail financing notice lives in `financingNotice.ts` (copy and optional portrait as parameters) and is rendered with creator copy at the end of the `management_pending` and `management` creator mails. After Thomas's review the box became a personal invitation with a round photo top right, the action buttons moved into the Verwaltungszugang box, and the footer links to the two new subpages.

## First draft of the copy (superseded, kept as history)

- heading: "Was deine Kampagne kostet"
- body: "Je mehr Menschen über deine Kampagne schreiben, desto mehr kosten Feedback-Datenbank, Mailversand und Hosting. Die Kosten trage ich bisher selbst. Eine Spende über WE AID hilft, Brief-nach-Berlin kostenlos zu halten. Sie ist freiwillig, und es ist völlig ok, wenn du nicht spenden kannst oder willst."

## What changed in the first run

1. `web/src/lib/email/financingNotice.ts` (new): `FinancingNoticeCopy`, `buildFinancingNoticeHtml(copy)`, private `escapeHtml` with the identical five replacements. Markup verbatim from the old private builder.
2. `web/src/lib/email/buildEmailHtml.ts`: private builder removed, import added, call now `buildFinancingNoticeHtml(SUPPORT_EMAIL_COPY[locale])`. Nothing else touched.
3. `web/src/lib/support-content.ts`: `SUPPORT_CAMPAIGN_CREATOR_COPY` appended after `SUPPORT_EMAIL_COPY`.
4. `web/src/lib/email/buildCampaignCreatorEmailHtml.ts`: `hasManagementLink`, `supportBlock` (after `shareBlock`, last block of the content cell), three mobile rules in the 600px media block.
5. Tests: `financingNotice.test.ts` and new cases in `campaignCreatorEmail.test.ts`.

## Deviations from the todo

1. Todo step 3 says "plus eine Zeile in der Text-Version". `sendCampaignCreatorEmail.ts` sends only `htmlContent`; the creator mail has no text version. Nothing added.
2. Todo step 3 says "unter dem Verwalten-Button". Deliberate reading: the box is the last block of the content cell, so it also works for `management_pending` where the share block is empty. Flipping it is a one-line move of `${supportBlock}`.
3. Todo step 2 says "de, en falls die Ersteller-Mail Locales kennt". `buildCampaignCreatorEmailHtml` is German-only, so only one German copy constant exists.

## Follow-up (2026-10-08, Thomas)

Plan: `/Users/thomas/.claude/plans/spenden-div-k-nnen-serene-fountain.md`. Thomas sent his own final copy and photo placement and asked to commit together with the two SEO subpages. Committed: `12f70db` (subpages), `10e3a71` (this task's code). No push, no mail sent.

### Changes
1. `financingNotice.ts`: new `FinancingNoticePortrait { src, alt }` and optional second parameter `portrait`. Without portrait the markup is unchanged (Brief-Mail). With portrait the heading becomes a 2-cell table: heading left (vertically centered), 52x52 round photo right (`valign` top, table cell instead of absolute positioning because mail clients strip it). `src` and `alt` go through the file-private `escapeHtml`. The status line is a plain paragraph again in both cases.
2. `support-content.ts`: `SUPPORT_CONTENT.founder.avatarPath = "/images/thomas-avatar.jpg"`; `SUPPORT_CAMPAIGN_CREATOR_COPY` replaced by Thomas's final copy (below).
3. `buildCampaignCreatorEmailHtml.ts`: local `ctaTable(margin)`. Second button is "Thomas schreiben" with `mailto:${BRIEF_EMAIL}` (no subject) instead of "Feedback geben". For `management_pending` and `management` (active and paused) the table sits at the end of the Verwaltungszugang box; the table above the box is gone. `verify_email` and `transfer` keep the table at the old position, only the second button changed. `supportBlock` passes the portrait `{ src: APP_URL + avatarPath, alt: founder.name }`.
4. Footer of all four mail kinds: new line "Mehr dazu: Petition starten · Kampagne starten" (`/petition-starten`, `/kampagne-starten`) above "Datenschutz · Feedback"; the Feedback link in the footer stays.
5. Tests: assertions for mailto and no "Feedback geben" (all four kinds), footer links (all four), avatar URL only in `management_pending` and `management`, order Verwaltungszugang < action URL < box heading (pending, active, paused), `verify_email` action URL before the "Danach" box, avatar file test (exists, under 30 KB). Copy hygiene test now checks dashes only, because Thomas's heading contains an emoji on purpose. `financingNotice.test.ts`: portrait renders an escaped `<img` in the heading row (order `<h2` < `<img` < body, status after the buttons), no `<img` without portrait.
6. S3 todo line 35 (Spendenkarte) points to `SUPPORT_CAMPAIGN_CREATOR_COPY`, avatarPath and buttons, "nicht neu formulieren". File stays untracked.

### Final copy (SUPPORT_CAMPAIGN_CREATOR_COPY, Thomas's wording)
- heading: "Schön, dass du eine Briefkampagne startest 🥳"
- body: "Wenn du Hilfe brauchst, schreib mir einfach. Je mehr Briefe zu deiner Kampagne entstehen, desto mehr Aufmerksamkeit bekommt das Anliegen. Damit steigen auch die Kosten für Mailversand, Datenbank und Hosting, die ich als Soloprojekt trage. Wenn du magst und kannst, freue ich mich über jede Unterstützung."
- button: "Über WE AID unterstützen"
- infoButton: "Wohin das Geld geht"
- status: `SUPPORT_CONTENT.status` (unchanged)

One edit by me: Thomas's text had "trage trage" (typo), set to "trage".

### Photo asset
`web/public/images/thomas-avatar.jpg`, 160x160 px JPEG, 4080 bytes. Pipeline: `sips` (HEIC to JPEG, sRGB, max 1200 px, output in scratchpad), then PIL (`exif_transpose`, centered square crop, LANCZOS, quality 82, optimize, no exif, no icc_profile). The original `/Users/thomas/Downloads/IMG_7498.HEIC` contains GPS coordinates and was only read. GPS-strip proof: `mdls -name kMDItemLatitude -name kMDItemLongitude` on the output returns `(null)`; PIL shows an empty EXIF dict.

### Evidence
- Jest, 12 email suites: 11 passed, 1 failed; 88 tests passed, 1 failed. The failure is the pre-existing `supportContent.test.ts` (stale expectations).
- Full jest before the commits: 92 of 94 suites, 611 of 613 tests. The two failures are `supportContent.test.ts` and `letterSignalActions.test.ts` (line 152, "stores the signed letter number when generation is recorded"); neither touches files of this work (`letterSignalActions` is also listed as pre-existing in the mdu summary).
- eslint exit 0 on the six S6 files and the five SEO files. tsc: 4 errors, all in `src/__tests__/campaignTopicReset.test.ts`, none in files of this work.
- Brief-Mail de/en/tr vs baseline (`final3`): the only differing line per locale is the "Datenschutz" data policy sentence, caused by a foreign uncommitted edit in `mailLocale.ts` (not part of the commits); 0 differing lines outside it. The notice markup without portrait is unchanged.
- Browser preview (desktop and 375px; pending, active, verify): photo round top right next to the heading, buttons inside the Verwaltungszugang box and stacked on mobile, footer links. `/petition-starten`, `/kampagne-starten` and the avatar returned HTTP 200 on the dev server.
- Not checked: real mail clients (Outlook, Gmail, Apple Mail); only the browser preview.

### Open
1. Push is not done (main is ahead of origin).
2. The mdu planning files (`.planning/quick/261008-mdu-...`) are still untracked; their summary still says "Not committed".

## Self-Check: PASSED

All scope files exist (incl. `web/public/images/thomas-avatar.jpg`); commits `12f70db` and `10e3a71` exist; nothing staged; no mail sent.

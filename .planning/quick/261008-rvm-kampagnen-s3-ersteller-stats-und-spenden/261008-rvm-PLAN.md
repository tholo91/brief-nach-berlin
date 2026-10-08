---
phase: quick-261008-rvm
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - "web/src/lib/campaigns/creatorStats.ts"
  - "web/src/__tests__/campaignCreatorStats.test.ts"
  - "web/src/components/campaigns/CampaignCreatorStats.tsx"
  - "web/src/components/campaigns/CampaignDonationCard.tsx"
  - "web/src/components/campaigns/CampaignManager.tsx"
  - "web/src/app/(site)/kampagne/verwalten/page.tsx"
  - ".planning/todos/completed/2026-10-08-kampagnen-s1-reviews-kennen-ihre-kampagne.md"
  - ".planning/todos/completed/2026-10-08-kampagnen-s2-ablaufdatum-und-beendet-ansichten.md"
  - ".planning/todos/completed/2026-10-08-kampagnen-s3-ersteller-stats-und-spendenkarte.md"
files_deleted:
  - ".planning/todos/pending/2026-10-08-kampagnen-s1-reviews-kennen-ihre-kampagne.md"
  - ".planning/todos/pending/2026-10-08-kampagnen-s2-ablaufdatum-und-beendet-ansichten.md"
  - ".planning/todos/pending/2026-10-08-kampagnen-s3-ersteller-stats-und-spendenkarte.md"
autonomous: true
requirements: [KAMPAGNEN-S3]

estimate:
  tokens: 140000
  raw_tokens: 140000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "D-06: On /kampagne/verwalten for a campaign that went live, the old strip ('Briefe über diese Kampagne' / 'Live seit') is gone. A stats block always shows 'Briefe geschrieben' = campaigns.letter_count (also below the threshold and when feedback cannot be loaded) plus the live-since date."
    - "D-01: With fewer than 10 feedback responses for the campaign, no percent or star value and no comment renders. Instead a friendly placeholder with progress ('Noch N Rückmeldungen bis dahin', singular 'Noch 1 Rückmeldung bis dahin') and one honest sentence that writers get a short question by mail a few days after their letter."
    - "D-01: At 10 or more responses, each KPI (Abschickquote, Ø Bewertung, gefühlte Wirksamkeit) shows its value with 'aus N Rückmeldungen' (its own N) only if its own denominator is at least 10; otherwise that tile shows 'Noch zu wenige Antworten'. Abschickquote denominator = reviews with letter_sent set; Ø Bewertung denominator = reviews with a 1-5 rating; Wirksamkeit denominator = selfEfficacyDirectionalCount (answers without 'unsure')."
    - "D-04: At 10 or more responses, up to 5 newest comments render: consent = true, rating >= 4, trimmed text longer than 10 characters. Each comment exposes only text, rating and a German month/year label (e.g. 'Oktober 2026', Europe/Berlin). No name, PLZ, email or exact date."
    - "D-05: Below the stats, a donation card renders SUPPORT_CAMPAIGN_CREATOR_COPY heading, body, button, infoButton and status verbatim with the founder avatar (SUPPORT_CONTENT.founder.avatarPath). The donate button opens DONATION_PROVIDER_URL in a new tab, the info button goes to DONATION_PATH. The card appears only on the Verwalten page, never on the public campaign page."
    - "D-03: Campaigns that never went live (activatedAt null), campaigns awaiting approval that are not ended, and blocked campaigns show neither stats nor donation card. Active, paused and ended campaigns show both."
    - "D-02: Numbers come only from this campaign's reviews (server-only service-role read of reviews where campaign_slug = campaign.slug, selecting no email, plz, display_name, ip_hash or debug_payload), aggregated by the existing aggregateInternalStats. A failed query (e.g. migration 025 not applied remotely) renders a quiet 'unavailable' line and never crashes the page."
    - "D-07: The presentational components take plain props only. Screenshots at 375 px and desktop for collecting/ready x active/ended exist in the quick task screenshots folder, produced from a fixture preview route that is deleted and never committed."
  artifacts:
    - path: "web/src/lib/campaigns/creatorStats.ts"
      provides: "buildCampaignCreatorStats (pure), getCampaignCreatorStats (server-only fetch), shouldShowCreatorInsights, view-model types, threshold constants"
      contains: "aggregateInternalStats"
    - path: "web/src/__tests__/campaignCreatorStats.test.ts"
      provides: "Fixture tests: threshold 9/10, per-KPI denominators, comment filter, Wirksamkeit without unsure, empty campaign, unavailable, gate, fetch columns, render checks"
    - path: "web/src/components/campaigns/CampaignCreatorStats.tsx"
      provides: "Presentational stats block (props: stats view model)"
    - path: "web/src/components/campaigns/CampaignDonationCard.tsx"
      provides: "Presentational donation card from SUPPORT_CAMPAIGN_CREATOR_COPY"
  key_links:
    - from: "web/src/app/(site)/kampagne/verwalten/page.tsx"
      to: "getCampaignCreatorStats"
      via: "server call for the authorized campaign only, gated by shouldShowCreatorInsights"
      pattern: "getCampaignCreatorStats\\("
    - from: "web/src/app/(site)/kampagne/verwalten/page.tsx"
      to: "web/src/components/campaigns/CampaignManager.tsx"
      via: "insights ReactNode slot rendered directly below the header section"
      pattern: "insights="
    - from: "web/src/lib/campaigns/creatorStats.ts"
      to: "web/src/lib/internalStats/aggregate.ts"
      via: "aggregateInternalStats reused for send breakdown, rating, politicalActivation"
      pattern: "aggregateInternalStats\\("
---

<objective>
Kampagnen S3: show campaign creators on /kampagne/verwalten, in their own words, what their campaign achieves (letters written, how many send them, how satisfied writers are, felt political efficacy, a few consented comments) and add a voluntary donation card below the stats.

Purpose: Creators do not know Brief nach Berlin's feedback survey and cannot see whether letters get sent or land well. Thomas carries the running costs that grow with large campaigns; creators should learn that without pressure.
Output: one new data module (pure builder + server-only fetch), two presentational components, the Verwalten page wired through an `insights` slot in CampaignManager, Jest fixture tests, screenshots, todo files moved to completed.

Decision map (locked, cite these IDs):
- D-01 Threshold per KPI (total < 10 placeholder with progress and source sentence; at >= 10 each tile needs its own denominator >= 10; "aus N Rückmeldungen" with own N; comments only from total >= 10).
- D-02 Reuse, do not duplicate: fetch only this campaign's reviews via `.eq("campaign_slug", slug)` (service-role, server-only, pattern of getInternalStats.ts) and run them through `aggregateInternalStats`. Pure function (rows in, view model out) separate from the fetch.
- D-03 Hide stats AND donation card for campaigns not yet approved; show for active and ended (and paused).
- D-04 Comments: consent true, rating >= 4, trimmed length > 10, max 5 newest, no name/PLZ/email, month/year only. Free-text PII risk accepted.
- D-05 Donation card below stats, Verwalten only, copy/photo/buttons strictly from SUPPORT_CAMPAIGN_CREATOR_COPY, link DONATION_PROVIDER_URL.
- D-06 "Briefe geschrieben" = campaigns.letter_count, always visible; keep "Live seit" as small meta; the new block replaces the old strip.
- D-07 Presentational components take plain view-model props; screenshots via a temporary, uncommitted fixture preview route; production DB is never written.
- Spec items from the todo (S-1 data module, S-2 KPIs, S-3 threshold, S-4 comments, S-5 donation card, S-6 replaces strip incl. ended state) are all covered by the D-IDs above.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@web/AGENTS.md
@.planning/todos/pending/2026-10-08-kampagnen-s3-ersteller-stats-und-spendenkarte.md
@.planning/brand-identity.md
@web/src/lib/internalStats/aggregate.ts
@web/src/lib/internalStats/getInternalStats.ts
@web/src/lib/feedback/politicalActivation.ts
@web/src/components/campaigns/CampaignManager.tsx
@web/src/app/(site)/kampagne/verwalten/page.tsx
@web/src/lib/support-content.ts
@web/src/lib/config.ts

Verified facts (planner, 2026-10-08 on main at fe5e53e):
- `reviews` columns used here: `created_at`, `rating`, `letter_sent`, `political_self_efficacy`, `body` (comment text), `consent`, `campaign_slug` (migration 025). The reviews select in getInternalStats.ts does NOT include `campaign_slug` (line 26 is the letter_signals select); this plan adds its own query.
- Migration 025 exists only as a file per the S1 summary (not applied locally or remotely at that time). Remote state is unverified. Against a DB without the column the reviews query errors, so the error path must degrade gracefully (Task 1).
- `aggregateInternalStats(rows, letterCount, fetchedAt, signalRows, filter, labels)` works as-is for one campaign: pass the campaign rows, no signal rows, DEFAULT_STATS_FILTER. No refactor of aggregate.ts needed. Rating sample size = sum of `ratingDistribution` values; send denominator = `knownSendCount`; Wirksamkeit = `politicalActivation.selfEfficacyPositiveCount / selfEfficacyDirectionalCount`.
- `getServiceRoleClient` initializes lazily, and Jest maps `server-only` to a mock, so a module with `import "server-only"` is importable in tests (see getReviewStats.test.ts for the chainable Supabase mock pattern).
- Components are tested by `createElement` + `renderToStaticMarkup` inside `.test.ts` files (see campaignHero.test.ts). Jest testMatch is `src/__tests__/**/*.test.ts` only.
- `campaign.activatedAt` is set only by `activateVerifiedCampaign` (approval). The Verwalten page renders `PendingApprovalNotice` (with CampaignManager, ended=false) for `status === "awaiting_approval" && !ended`.
- Existing web support card for visual reference: Step3Success.tsx lines ~1093-1137 (`success-support-title`). Email version: web/src/lib/email/financingNotice.ts (donate = DONATION_PROVIDER_URL, info = DONATION_PATH).
- Baseline gates: `npm run test` has 2 PRE-EXISTING failing suites unrelated to this work (`supportContent.test.ts`: founder text lacks "Zeit"; `letterSignalActions.test.ts`: recipient.address undefined): 2 failed / 655 passed. `npx tsc --noEmit` has 4 pre-existing errors, all in `src/__tests__/campaignTopicReset.test.ts`. Lint per S1 summary: 0 errors, 7 warnings. Do not fix these; report them separately.
- Todo convention: finished todos live in `.planning/todos/completed/` (not `done/`) with an added frontmatter line `completed: <ISO timestamp>` after `created:`.
- A parallel session plans S4 (Danke-Mail), whose todo lists `web/src/lib/campaigns/creatorStats.ts` as a consumer. Keep the exported API stable and named as below; touch no S4 files (sendCampaignCreatorEmail.ts, vercel.json). The untracked `.planning/research/2026-10-08-kampagnen-featured-unterstuetzer-steuer.md` belongs to another session: never stage it. Stage explicit paths only, never `git add -A`.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: End-to-end creator stats, campaign reviews to view model to stats block on Verwalten</name>
  <files>web/src/lib/campaigns/creatorStats.ts, web/src/__tests__/campaignCreatorStats.test.ts, web/src/components/campaigns/CampaignCreatorStats.tsx, web/src/components/campaigns/CampaignManager.tsx, web/src/app/(site)/kampagne/verwalten/page.tsx</files>
  <precondition>web/src/lib/campaigns/creatorStats.ts does not exist yet (the parallel S4 session must not have created it); if it exists, stop and report instead of overwriting.</precondition>
  <read_first>
    - web/src/lib/internalStats/aggregate.ts (types InternalReviewRow, aggregateInternalStats lines 424-634)
    - web/src/lib/internalStats/getInternalStats.ts (service-role fetch and error pattern)
    - web/src/lib/feedback/politicalActivation.ts (PoliticalSelfEfficacy values and labels)
    - web/src/components/campaigns/CampaignManager.tsx lines 109-180 and 296-390 (props, derived labels, ended banner, header section, stats strip)
    - web/src/app/(site)/kampagne/verwalten/page.tsx
    - web/src/lib/campaigns/endDate.ts (CAMPAIGN_TIME_ZONE usage, formatCampaignEndDate)
    - web/src/__tests__/internalStats.test.ts (fixture style), web/src/__tests__/getReviewStats.test.ts (Supabase mock), web/src/__tests__/campaignHero.test.ts (render pattern)
    - .planning/brand-identity.md (sections 4 and 6)
  </read_first>
  <behavior>
    Write these in web/src/__tests__/campaignCreatorStats.test.ts first and watch them fail (RED), then implement (GREEN):
    - Threshold: 9 rows -> feedback.status "collecting", responses 9, remaining 1, no KPI or comment data in the output even if eligible comments exist; 10 rows -> status "ready" (D-01).
    - Per-KPI denominators at total >= 10 (D-01): e.g. 12 rows where only 8 have letter_sent set -> sendRate status "too_few" with responses 8; 12 rows where only 9 have a rating -> averageRating "too_few"; a fully answered fixture -> all three "shown" with the right value and own responses count.
    - Values: sendRate value = Math.round(sentCount / knownSendCount * 100); averageRating value = aggregate averageRating (one decimal); selfEfficacy value = Math.round(positive / directional * 100).
    - Wirksamkeit excludes "unsure": e.g. 7 positive (clearly_yes/rather_yes), 3 negative (rather_no/no), 4 unsure among senders -> responses 10, value 70.
    - Comment filter (D-04): consent false excluded, consent null excluded, rating 3 excluded, "Danke" and "  ist gut  " excluded, text of exactly 10 trimmed chars excluded (strictly greater than 10 required), rows without created_at excluded; 7 eligible -> exactly the 5 newest in descending order; text is trimmed; created_at "2026-09-30T22:30:00Z" yields monthLabel "Oktober 2026" (Europe/Berlin); every comment object has exactly the keys monthLabel, rating, text.
    - Campaign without reviews -> "collecting", responses 0, remaining 10, letterCount preserved.
    - rows null -> feedback.status "unavailable", letterCount and liveSinceLabel preserved.
    - liveSinceLabel: activatedAt "2026-08-11T23:30:00Z" -> "12.08.2026"; activatedAt null -> null.
    - shouldShowCreatorInsights (D-03): active + activatedAt -> true; paused + activatedAt -> true; ended (ended=true) + activatedAt -> true; awaiting_approval + activatedAt null -> false; awaiting_approval + activatedAt set + not ended -> false; draft -> false; blocked + activatedAt -> false.
    - getCampaignCreatorStats with mocked getServiceRoleClient: queries table "reviews", calls eq("campaign_slug", slug), the select string contains none of email, plz, display_name, ip_hash, debug_payload; a Supabase error object -> returns status "unavailable" with letterCount intact and does not throw; a thrown error from getServiceRoleClient -> same.
    - Tracer end-to-end check: render CampaignCreatorStats (createElement + renderToStaticMarkup) with the view returned by the mocked getCampaignCreatorStats for 3 rows and letterCount 37 -> markup contains "Briefe geschrieben", "37" and "Noch 7 Rückmeldungen bis dahin"; for 1 remaining -> "Noch 1 Rückmeldung bis dahin"; for a ready fixture -> contains "aus 12 Rückmeldungen" and "Noch zu wenige Antworten" for the too_few tile; for unavailable -> letter count still rendered.
  </behavior>
  <action>
    Before writing UI, load the skills `frontend-design:frontend-design` and `design-taste-frontend` via the Skill tool, read .planning/brand-identity.md, and read the checklist at /Users/thomas/Documents/Git Repos/signs-of-ai-writing.md (outside the repo, absolute path intentional). No new dependencies, no package installs.

    1. Data module web/src/lib/campaigns/creatorStats.ts (per D-02), first line `import "server-only"`. Export:
       a. Constants CREATOR_STATS_MIN_RESPONSES = 10, CREATOR_COMMENT_LIMIT = 5, CREATOR_COMMENT_MIN_LENGTH = 10 (comment text must be strictly longer), and CREATOR_STATS_REVIEW_COLUMNS = the comma list created_at,rating,letter_sent,political_self_efficacy,body,consent (no email, plz, display_name, ip_hash, debug_payload, letter_id).
       b. Types: CampaignFeedbackRow { created_at: string | null; rating: number | null; letter_sent: boolean | null; political_self_efficacy: PoliticalSelfEfficacy | null; body: string | null; consent: boolean | null }. CreatorStatsKpi = { status: "shown"; value: number; responses: number } | { status: "too_few"; responses: number }. CreatorStatsComment = { text: string; rating: number; monthLabel: string }. CampaignCreatorStatsView = { letterCount: number; liveSinceLabel: string | null; ended: boolean; feedback: { status: "unavailable" } | { status: "collecting"; responses: number; remaining: number; threshold: number } | { status: "ready"; responses: number; sendRate: CreatorStatsKpi; averageRating: CreatorStatsKpi; selfEfficacy: CreatorStatsKpi; comments: CreatorStatsComment[] } }.
       c. Pure `buildCampaignCreatorStats({ rows, letterCount, activatedAt, ended })` where rows is CampaignFeedbackRow[] or null. Map rows to InternalReviewRow (fill full_feedback_submitted, feedback_tags, political_powerlessness_frequency, debug_payload, letter_id with null) and call aggregateInternalStats(mapped, letterCount, undefined, [], DEFAULT_STATS_FILTER). Do not modify aggregate.ts. Threshold and per-KPI rules exactly as in the behavior list (D-01). Comments per D-04: filter, sort by created_at descending, take 5, trim text, monthLabel via Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric", timeZone: "Europe/Berlin" }). liveSinceLabel via Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" }) (server-side formatting avoids hydration drift). rows null -> feedback "unavailable".
       d. `shouldShowCreatorInsights(campaign: Pick<Campaign, "status" | "activatedAt">, ended: boolean)`: true only if activatedAt is not null, status is not "blocked", and (ended or status is not "awaiting_approval") (per D-03).
       e. `async getCampaignCreatorStats(campaign: Pick<Campaign, "slug" | "letterCount" | "activatedAt">, ended: boolean): Promise<CampaignCreatorStatsView>`: inside try/catch, getServiceRoleClient().from("reviews").select(CREATOR_STATS_REVIEW_COLUMNS).eq("campaign_slug", campaign.slug).order("created_at", { ascending: false }). On error or exception, console.error with a fixed prefix and only the error message (never row data), then return the builder result with rows null. Note in the SUMMARY that PostgREST caps a response at 1000 rows by default (accepted limit for now). The slug always comes from the server-loaded campaign, never from request input.
    2. Presentational web/src/components/campaigns/CampaignCreatorStats.tsx (per D-07): no "use client", no hooks, no fetching; single prop `stats: CampaignCreatorStatsView` imported with `import type`. Root element gets id="creator-stats" and aria-labelledby on its heading. Content, mobile-first and compact, matching CampaignManager's language (rounded-md cards, border-warmgrau/12, bg-white/75, font-typewriter eyebrows/headings, font-body text, waldgruen/creme/warmgrau tokens; airmail accents only sparingly):
       a. Heading: active "So kommt deine Kampagne an", ended "Endstand deiner Kampagne" (ended comes from stats.ended).
       b. Always: "Briefe geschrieben" with letterCount (de-DE number format) and, if liveSinceLabel, a small "Live seit {liveSinceLabel}" meta (per D-06).
       c. collecting: "Hier siehst du bald, wie viele ihren Brief abschicken und wie zufrieden sie sind." plus "Noch {remaining} Rückmeldungen bis dahin." (singular "Noch 1 Rückmeldung bis dahin.") plus an accessible progress indicator (responses of threshold), plus the source sentence, e.g. "Woher die Zahlen kommen: Wer über deine Kampagne einen Brief schreibt, bekommt ein paar Tage später eine kurze Frage von uns per Mail." (per D-01).
       d. ready: three tiles (a dl/dt/dd structure is fine). Abschickquote, e.g. "68 %" + "schicken ihren Brief ab"; Ø Bewertung, e.g. "4,6 von 5 Sternen" framed as "So zufrieden sind Schreibende mit ihrem Brief"; Wirksamkeit, e.g. "71 %" + "fühlen sich danach eher in der Lage, sich politisch einzubringen". Every shown value carries "aus {responses} Rückmeldungen" with its own N. A too_few tile keeps its label and shows "Noch zu wenige Antworten" quietly. Keep the source sentence as a small footnote. Percent with a non-breaking space before %, rating with German decimal comma.
       e. ready with comments: a short list (heading e.g. "Was Schreibende dazu sagen"), each item quote text, star rating with an aria-label, monthLabel. Hide the block when there are no comments.
       f. unavailable: a quiet line such as "Die Rückmeldungen lassen sich gerade nicht laden. Schau später noch einmal vorbei." while the letter count stays visible.
       Copy rules: German, du-Form toward creators, no em dash or en dash characters (U+2014, U+2013) anywhere in the new files, checked against the AI-writing checklist; you may tighten wording but keep every D-01 element.
    3. web/src/components/campaigns/CampaignManager.tsx (per D-06): add optional prop `insights?: ReactNode` (ReactNode is already imported) and render `{insights}` directly after the header section (the one with "Deine Kampagne"), before the edit form. Delete the old stats strip (the bordered grid with "Briefe über diese Kampagne" and "Live seit") and remove only the derived values that become unused (formattedLetterCount, letterCountLabel, liveSinceLabel, and numberFormatter/dateFormatter only if nothing else uses them). Change nothing else in this 900-line file.
    4. web/src/app/(site)/kampagne/verwalten/page.tsx: in the non-pending branch, compute `shouldShowCreatorInsights(authorizedCampaign, ended)`; if true, await `getCampaignCreatorStats(authorizedCampaign, ended)` and pass `insights={<CampaignCreatorStats stats={...} />}` to CampaignManager; otherwise pass nothing. The PendingApprovalNotice branch stays unchanged (no insights, per D-03). Do not fetch for pending or unauthorized requests.
    Commit as feat(quick-261008-rvm) with explicit file paths.
  </action>
  <verify>
    <automated>npm --prefix web run test -- campaignCreatorStats internalStats && (cd web && ! npx tsc --noEmit -p . 2>&1 | grep -E "creatorStats|CampaignCreatorStats|CampaignManager|kampagne/verwalten")</automated>
  </verify>
  <done>All behavior tests in campaignCreatorStats.test.ts pass, existing internalStats tests still pass, no TypeScript errors in touched files. The Verwalten page for a live campaign renders the new stats block (letter count always, collecting or ready or unavailable state) in place of the old strip; pending, draft and blocked campaigns render no stats.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Donation card below the stats on Verwalten only</name>
  <files>web/src/components/campaigns/CampaignDonationCard.tsx, web/src/app/(site)/kampagne/verwalten/page.tsx, web/src/__tests__/campaignCreatorStats.test.ts</files>
  <read_first>
    - web/src/lib/support-content.ts lines 128-138 (SUPPORT_CAMPAIGN_CREATOR_COPY) and lines 15-30 (SUPPORT_CONTENT.founder)
    - web/src/lib/config.ts lines 84-85 (DONATION_PATH, DONATION_PROVIDER_URL)
    - web/src/lib/email/financingNotice.ts (which link each button uses)
    - web/src/components/wizard/Step3Success.tsx lines 1093-1137 (existing web support card styling)
  </read_first>
  <behavior>
    Add to web/src/__tests__/campaignCreatorStats.test.ts (mock "next/image" to a plain img element via jest.mock, since no test mocks it yet):
    - Rendered CampaignDonationCard markup contains SUPPORT_CAMPAIGN_CREATOR_COPY.heading, .body, .button, .infoButton and .status verbatim (per D-05).
    - The donate link has href DONATION_PROVIDER_URL, target="_blank" and rel containing noopener; the info link has href DONATION_PATH.
    - The image src is SUPPORT_CONTENT.founder.avatarPath with alt SUPPORT_CONTENT.founder.name.
  </behavior>
  <action>
    1. Create web/src/components/campaigns/CampaignDonationCard.tsx (per D-05, D-07): no "use client", no props, no hooks. Every visible string comes from SUPPORT_CAMPAIGN_CREATOR_COPY (heading, body, button, infoButton, status); write no new wording. Founder avatar via next/image from SUPPORT_CONTENT.founder.avatarPath (small round, e.g. 52-56 px, alt SUPPORT_CONTENT.founder.name). Primary button: anchor to DONATION_PROVIDER_URL, target _blank, rel "noopener noreferrer". Secondary button: next/link to DONATION_PATH with prefetch false. Status as small muted text. Visual language like the Step3Success support card and the CampaignManager cards, compact on 375 px (buttons stack below ~440 px), min-h-11 touch targets, focus-visible outlines. Use an aria-labelledby heading id.
    2. web/src/app/(site)/kampagne/verwalten/page.tsx: when shouldShowCreatorInsights is true, the insights slot becomes a fragment with CampaignCreatorStats followed by CampaignDonationCard (both direct children of CampaignManager's gap-8 grid). Same gate as Task 1, so pending, draft and blocked campaigns get no card (D-03). Do not add the card to the public campaign page or any other route.
    3. Note for the SUMMARY (do not change the copy): the S6 heading "Schön, dass du eine Briefkampagne startest" reads oddly on an ended or long-running campaign; flag it for Thomas as an open copy question.
    Commit as feat(quick-261008-rvm) with explicit file paths.
  </action>
  <verify>
    <automated>npm --prefix web run test -- campaignCreatorStats && (cd web && ! npx tsc --noEmit -p . 2>&1 | grep -E "creatorStats|CampaignCreatorStats|CampaignDonationCard|kampagne/verwalten") && grep -rl "CampaignDonationCard" web/src/app | grep -v "kampagne/verwalten/page.tsx" | wc -l | grep -qx " *0"</automated>
  </verify>
  <done>Donation card tests pass; the card renders below the stats only on /kampagne/verwalten for campaigns that pass the gate, with S6 copy verbatim, founder avatar, donate link to WE AID in a new tab and info link to /spenden; no other route imports it.</done>
</task>

<task type="auto">
  <name>Task 3: Fixture preview, screenshots, copy check, cleanup, final gates, todo moves</name>
  <files>web/src/app/(site)/kampagne/verwalten/vorschau/page.tsx (temporary, deleted again in this task), .planning/quick/261008-rvm-kampagnen-s3-ersteller-stats-und-spenden/screenshots/, .planning/todos/completed/2026-10-08-kampagnen-s1-reviews-kennen-ihre-kampagne.md, .planning/todos/completed/2026-10-08-kampagnen-s2-ablaufdatum-und-beendet-ansichten.md, .planning/todos/completed/2026-10-08-kampagnen-s3-ersteller-stats-und-spendenkarte.md</files>
  <read_first>
    - .claude/launch.json (web dev server entry: npm --prefix web run dev, port 3000, autoPort)
    - .planning/todos/completed/2026-07-10-kommune-briefe-an-buergermeisteramt-statt-stadtverwaltung.md (frontmatter with completed: line)
  </read_first>
  <action>
    1. Temporary preview route (per D-07, never committed): create web/src/app/(site)/kampagne/verwalten/vorschau/page.tsx, a server page reading searchParams `variant` with four values: collecting-active, ready-active, collecting-ended, ready-ended. It builds fixture CampaignFeedbackRow arrays in the file (invented, PII-free German comment texts) and runs them through the real buildCampaignCreatorStats (no DB access, no getCampaignCreatorStats call). collecting variants: 3 responses, letterCount 37. ready-active: about 24 responses with all three KPIs shown and 5+ eligible comments. ready-ended: at least 10 responses but fewer than 10 directional Wirksamkeit answers, so that tile shows "Noch zu wenige Antworten". Render inside CampaignBackground and a section like the real page: CampaignManager with a fully typed fixture Campaign (status active, activatedAt set; ended variants with endsAt in the past and ended true) and insights = CampaignCreatorStats + CampaignDonationCard.
    2. Start the dev server in the background from the repo root (e.g. npm --prefix web run dev -- -p 3107, matching the .claude/launch.json web entry) and poll until the preview URL returns 200. Take screenshots for every variant at 375x812 and 1280x900, viewport tall enough or full-page so header, stats and donation card are visible. Use the Claude Preview tool if available; otherwise use the existing Playwright devDependency with the installed Chrome: from web/, npx playwright screenshot --channel chrome --viewport-size "375,812" --full-page --wait-for-selector "#creator-stats" URL OUTFILE. Never run npx playwright install or any npm install. Save as .planning/quick/261008-rvm-kampagnen-s3-ersteller-stats-und-spenden/screenshots/{variant}-{mobile|desktop}.png (8 files).
    3. Open each PNG with the Read tool and review it like a designer (spacing, hierarchy, wrapping at 375 px, contrast, tile alignment, no overflow, the donation card not dominating the stats). Fix issues in CampaignCreatorStats.tsx or CampaignDonationCard.tsx and re-shoot. Re-run the AI-writing checklist on all new copy.
    4. Stop the dev server (it must not run during next build), then delete the whole web/src/app/(site)/kampagne/verwalten/vorschau directory. Leave the PNGs untracked (no screenshots are committed in .planning/quick historically); list their paths in the SUMMARY.
    5. Final gates from the repo root: npm --prefix web run test (expect only the 2 known pre-existing failures, supportContent.test.ts and letterSignalActions.test.ts; any other failure blocks), npm --prefix web run lint (0 errors), npm --prefix web run build (green, without the preview route). Report pre-existing failures separately as not caused by this change.
    6. Todos: git mv the three files 2026-10-08-kampagnen-s1-reviews-kennen-ihre-kampagne.md, 2026-10-08-kampagnen-s2-ablaufdatum-und-beendet-ansichten.md, 2026-10-08-kampagnen-s3-ersteller-stats-und-spendenkarte.md from .planning/todos/pending/ to .planning/todos/completed/ (repo convention, not done/) and add a line completed: 2026-10-08T00:00:00.000Z after the created: line in each. Leave the S4, S5 and S6 todos where they are; mention in the SUMMARY that the S6 todo is still in pending/ although S6 is merged. Commit the moves as docs(quick-261008-rvm) with explicit paths.
    7. SUMMARY must state: exported API of creatorStats.ts for S4 (names and signatures), the 1000-row PostgREST cap, migration 025 remote state as unverified (the page degrades to "unavailable" until it is applied), the S6 heading copy question, and the pre-existing test/tsc failures.
  </action>
  <verify>
    <automated>npm --prefix web run test -- campaignCreatorStats && npm --prefix web run lint && npm --prefix web run build && test ! -e "web/src/app/(site)/kampagne/verwalten/vorschau" && test -z "$(git ls-files -- 'web/src/app/(site)/kampagne/verwalten/vorschau')" && test "$(ls .planning/quick/261008-rvm-kampagnen-s3-ersteller-stats-und-spenden/screenshots/*.png | wc -l | tr -d ' ')" -ge 8 && ! grep -nE $'\xe2\x80\x94|\xe2\x80\x93' web/src/components/campaigns/CampaignCreatorStats.tsx web/src/components/campaigns/CampaignDonationCard.tsx web/src/lib/campaigns/creatorStats.ts && test -f .planning/todos/completed/2026-10-08-kampagnen-s3-ersteller-stats-und-spendenkarte.md && test ! -f .planning/todos/pending/2026-10-08-kampagnen-s3-ersteller-stats-und-spendenkarte.md && test -f .planning/todos/completed/2026-10-08-kampagnen-s1-reviews-kennen-ihre-kampagne.md && test -f .planning/todos/completed/2026-10-08-kampagnen-s2-ablaufdatum-und-beendet-ansichten.md</automated>
    <human-check>Thomas reviews the 8 screenshots (collecting/ready x active/ended, mobile and desktop) for layout and copy tone.</human-check>
  </verify>
  <done>8 screenshots exist and were visually reviewed; the preview route is gone and was never committed; new files contain no em or en dashes; full test suite shows no failures beyond the 2 known pre-existing ones; lint has 0 errors; build is green; S1, S2 and S3 todos live in .planning/todos/completed/ with a completed: line.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Supabase reviews (service role) -> Verwalten page | Server reads sensitive feedback rows; only aggregated numbers and filtered comments may leave the server |
| Management session cookie -> Verwalten page | Only the authorized creator of one campaign may see that campaign's stats |
| Consented free-text comments -> creator | Reviewer text is shown to a third party (the campaign initiative) |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-rvm-01 | Information disclosure | getCampaignCreatorStats query | high | mitigate | Column whitelist CREATOR_STATS_REVIEW_COLUMNS without email, plz, display_name, ip_hash, debug_payload, letter_id; Jest asserts the select string (Task 1) |
| T-rvm-02 | Information disclosure | comment filter in buildCampaignCreatorStats | high | mitigate | Only consent === true, rating >= 4, trimmed length > 10, max 5; output objects carry only text, rating, monthLabel; Jest asserts filter and exact keys (Task 1, D-04) |
| T-rvm-03 | Elevation of privilege | kampagne/verwalten/page.tsx | medium | mitigate | Stats fetched only for authorizedCampaign (existing session + creator email check); slug taken from the server-loaded campaign, never from query params; gate shouldShowCreatorInsights (Task 1, D-03) |
| T-rvm-04 | Information disclosure | consented comment free text | low | accept | Per D-04 free-text PII is accepted; FeedbackForm consent wording explicitly allows showing anonymized reviews to the initiative behind a campaign |
| T-rvm-05 | Denial of service | Verwalten page when reviews query fails (migration 025 not applied remotely, Supabase outage, missing env) | medium | mitigate | try/catch in getCampaignCreatorStats returns feedback "unavailable"; letter count stays visible; Jest covers error object and thrown error (Task 1) |
| T-rvm-06 | Information disclosure | server logs | low | mitigate | Error log contains a fixed prefix plus the Supabase error message only, never rows, comment text or slug-linked personal data |
| T-rvm-07 | Information disclosure | temporary fixture preview route | low | mitigate | Fixtures are invented and PII-free; route deleted before build and commit; verify checks the path is absent and untracked (Task 3) |
| T-rvm-SC | Tampering | npm/pip/cargo installs | high | mitigate | No install tasks in this plan; executor must not run npm install or npx playwright install; screenshots use the already-declared playwright devDependency with the installed Chrome channel |
</threat_model>

<verification>
- npm --prefix web run test -- campaignCreatorStats internalStats (new suite green, existing internalStats green)
- npm --prefix web run test (only the 2 known pre-existing failures)
- npm --prefix web run lint (0 errors), npm --prefix web run build (green)
- tsc filter: no TypeScript errors in creatorStats.ts, CampaignCreatorStats.tsx, CampaignDonationCard.tsx, CampaignManager.tsx, kampagne/verwalten/page.tsx
- 8 screenshots in .planning/quick/261008-rvm-kampagnen-s3-ersteller-stats-und-spenden/screenshots/
- Preview route absent and untracked; no em/en dash characters in new files
- Remote DB: nothing written; migration 025 remote state reported as unverified
</verification>

<success_criteria>
- A creator of a live or ended campaign sees on /kampagne/verwalten: letters written (always), a progress placeholder below 10 responses, and at 10+ responses Abschickquote, Ø Bewertung and gefühlte Wirksamkeit each with "aus N Rückmeldungen" or "Noch zu wenige Antworten", plus up to 5 consented comments with month/year only.
- A donation card with the exact S6 copy, founder avatar and WE AID link sits below the stats on the Verwalten page only.
- Pending, draft and blocked campaigns show neither.
- The page never crashes because of the feedback query.
- All D-01 to D-07 decisions are implemented and covered by Jest fixtures and screenshots.
</success_criteria>

<output>
Create `.planning/quick/261008-rvm-kampagnen-s3-ersteller-stats-und-spenden/261008-rvm-SUMMARY.md` when done
</output>

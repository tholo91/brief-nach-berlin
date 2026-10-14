---
phase: quick-261014-iuq
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/lib/rueckmeldung/cohort.ts
  - web/src/lib/internalStats/outcomes.ts
  - web/src/lib/internalStats/getInternalStats.ts
  - web/src/lib/internalStats/view.ts
  - web/src/components/internalStats/Briefweg.tsx
  - web/src/app/stats/page.tsx
  - web/src/__tests__/internalStatsOutcomes.test.ts
autonomous: true
requirements: [QUICK-261014-iuq]

estimate:
  tokens: 95000
  raw_tokens: 95000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "On /stats a section 'Nach dem Brief' (anchor #nach-dem-brief) sits between 'Wie kommt der Brief an?' and 'Wirkung', has its own SectionNav link, and says that the filters do not apply to it (D-01)"
    - "The Briefweg graphic shows 322 zugestellt → geantwortet → abgeschickt (von Hand / getippt) → Reaktion (Kanal), with 'davon konkret eingegangen' below; it is an ordered list, horizontal on desktop and stacked on a 375px phone; bars from stage 2 on use the respondents as base (D-02)"
    - "Counting follows the review rule: the mail click decides the main question unless a completed form says otherwise; every detail number comes only from completed forms; test addresses never reach the page because the query itself excludes them (D-03)"
    - "Every share in the section reads '2 von 8' while its base is below 30 and '25,0 % (n = 60)' from 30 on; blocks with a base below 30 carry the 'kleine Basis' badge (D-04)"
    - "A daily return chart since the send day plus a round frame line (Runde Oktober 2026, Mail am 14.10.2026, 335 verschickt, 322 zugestellt, Briefe April bis 12.08.2026) is shown; data is grouped per round so a January round only needs one new constant entry; no join between outcomes and reviews by address (D-05)"
    - "Self-efficacy is shown as a group comparison: completed outcome forms next to reviews created before 13.08.2026, labelled as different groups, with no person linked (D-06)"
    - "Four detail blocks are visible without clicking: von Hand vs getippt (reaction rate), Kanal + wie konkret, wieder schreiben + Handlungsfähigkeit, Gründe fürs Nichtabschicken + Erwartung vs Ergebnis (D-07)"
    - "All free texts live only inside the default-closed Collapsible 'Alle Antworten'; texts with publication consent are marked with their display name; the count 'offen für ein Gespräch' is shown; no email address is selected, returned or rendered; the two privacy notes and a new Definition 'Rückmeldungen' describe this accurately (D-08)"
    - "npm run lint, npm run test and npm run build pass from web/"
  artifacts:
    - path: "web/src/lib/rueckmeldung/cohort.ts"
      provides: "LASTCALL_SENT_AT, LASTCALL_SENT_COUNT, LASTCALL_DELIVERED_COUNT, LASTCALL_LETTER_WINDOW_LABEL, OutcomeRound type, OUTCOME_ROUNDS, testEmailExclusionList()"
      contains: "OUTCOME_ROUNDS"
    - path: "web/src/lib/internalStats/outcomes.ts"
      provides: "InternalOutcomeRow, OutcomeRoundStats, OUTCOME_LABELS, pure aggregateOutcomes(rows, reviewRows, round, fetchedAt)"
      exports: ["aggregateOutcomes", "OUTCOME_LABELS", "InternalOutcomeRow", "OutcomeRoundStats"]
    - path: "web/src/lib/internalStats/getInternalStats.ts"
      provides: "Fifth Promise.all query on letter_outcomes; getInternalStatsWithBaseline returns { stats, baseline, outcomes }"
      contains: "letter_outcomes"
    - path: "web/src/lib/internalStats/view.ts"
      provides: "SHARE_PERCENT_MIN_BASE = 30 and formatShare(count, base)"
      exports: ["formatShare", "SHARE_PERCENT_MIN_BASE"]
    - path: "web/src/components/internalStats/Briefweg.tsx"
      provides: "Airmail-style ordered-list funnel component"
      exports: ["Briefweg"]
    - path: "web/src/app/stats/page.tsx"
      provides: "Section nach-dem-brief, SECTION_LINKS entry, Definition 'Rückmeldungen', updated privacy notes"
      contains: "nach-dem-brief"
    - path: "web/src/__tests__/internalStatsOutcomes.test.ts"
      provides: "Jest coverage for counting rules, test-address exclusion, formatShare threshold, return buckets, review cutoff, Briefweg render"
  key_links:
    - from: "web/src/lib/internalStats/getInternalStats.ts"
      to: "letter_outcomes table (service role)"
      via: "fifth query in the existing Promise.all, filtered by cohort and testEmailExclusionList(), email column never selected"
      pattern: "from\\(\"letter_outcomes\"\\)"
    - from: "web/src/lib/internalStats/getInternalStats.ts"
      to: "web/src/lib/internalStats/outcomes.ts"
      via: "OUTCOME_ROUNDS.map(round => aggregateOutcomes(rows.outcomes, rows.reviews, round, fetchedAt))"
      pattern: "aggregateOutcomes\\("
    - from: "web/src/app/stats/page.tsx"
      to: "getInternalStatsWithBaseline"
      via: "destructure outcomes next to stats and baseline in the existing try block (~line 850)"
      pattern: "outcomes \\} = await getInternalStatsWithBaseline"
    - from: "web/src/app/stats/page.tsx"
      to: "web/src/components/internalStats/Briefweg.tsx"
      via: "<Briefweg round={round} /> inside Section nach-dem-brief"
      pattern: "<Briefweg round="
    - from: "web/src/components/internalStats/Briefweg.tsx"
      to: "web/src/lib/internalStats/view.ts"
      via: "formatShare for every stage share"
      pattern: "formatShare\\("
---

<objective>
Add the internal /stats section "Nach dem Brief" that shows what happened after the letter, based on the answers to the last-call mail stored in `letter_outcomes` (round `lastcall_2026_10`, sent 14.10.2026 09:07, 335 sent, 322 delivered per Brevo). Converts the user-approved plan `/Users/thomas/.claude/plans/1-a-2-a-shimmying-starfish.md` into executable tasks. All eight decisions in that plan were locked by Thomas in a grilling session; they are referenced here as D-01 to D-08 in the order of its "Entscheidungen" list. Do not revisit or re-scope them.

Purpose: Thomas needs an honest, screenshot-ready answer to "Was passiert nach dem Brief?" for Prototype Fund, LinkedIn and press, without exposing email addresses and without overstating a small basis.
Output: 1 new data module, 1 new component, 1 new test file, 4 edited files; lint, test and build green.

HARD RULES for the executor:
1. Every path below is repo-root-relative. Run npm/npx commands from `web/` (`cd web && ...`).
2. Preserve any pre-existing dirty worktree changes. Touch only the files listed in `files_modified`. Do not push. Commit handling follows the quick-workflow orchestrator; never stage unrelated files.
3. Never select, return, log or render an email address. Never run Brevo/send/mark-contacted scripts. Never print row data to the console.
4. User-facing copy: German, first person singular only (ich/mein), no first-person plural pronouns, no em dash or en dash used as Gedankenstrich (U+2014/U+2013; use colon, comma, period or "·" instead), no AI-sounding phrasing, brand spelled "Brief-nach-Berlin".
5. Browser visual verification is done by the orchestrator afterwards. Do not start a dev server.
6. Decomposition (data, UI, gates) is prescribed by the orchestrator; tracer-first is intentionally not applied here.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/thomas/.claude/plans/1-a-2-a-shimmying-starfish.md
@.planning/STATE.md
@CLAUDE.md
@web/AGENTS.md
@.planning/brand-identity.md
@web/src/lib/rueckmeldung/cohort.ts
@web/src/lib/rueckmeldung/schema.ts
@web/supabase/migrations/033_letter_outcomes.sql
@web/src/lib/internalStats/getInternalStats.ts
@web/src/lib/internalStats/view.ts

Verified anchors (read only the ranges you need):
- `web/src/lib/internalStats/aggregate.ts`: `InternalReviewRow` type at line 12 (political_self_efficacy, created_at); empty-factory / type-guard / counter pattern at 411-491 (`emptySendBreakdown`, `emptyPoliticalActivationStats`, `isPoliticalSelfEfficacy`, `roundOne`).
- `web/src/lib/internalStats/view.ts`: `shareParts` at 146 (one-decimal share), `bucketTimeline(dayCounts, granularity)` at 180, `isSmallBasis(value, threshold = 10)` at 385. Imports `formatDecimal, formatNumber` from `@/lib/formatNumber` (de-DE, formatDecimal always one decimal).
- `web/src/lib/feedback/politicalActivation.ts`: `POLITICAL_SELF_EFFICACY_VALUES`, `POLITICAL_SELF_EFFICACY_LABELS`.
- German option labels for outcome values exist only inline in the client component `web/src/app/(site)/rueckmeldung/RueckmeldungForm.tsx` lines 193-216. Do not import from it and do not edit it.
- `web/src/app/stats/page.tsx` (1616 lines): `formatDate` 82, `StatCard` 104, `SectionHeading` 147, `EmptyState` 161, `BasisNote` 165, `BasisBadge` 173, `SECTION_LINKS` 181-188, `Section` 190 (accent neutral|rot|gruen), `SubHeading` 215, `Collapsible` 227 (renders `<details>` without `open`, so default closed), `ShareStat` 283, `SurveyDistributionBars` 454, `selfEfficacyOptions` 503, data load try block ~848-854, filter-does-not-apply note pattern ~1090, `<Section id="feedback">` 1322 (closes ~1418), `<Section id="wirkung">` 1420, `<Section id="definitionen">` 1541, Datenschutz Definition body ~1579, footer privacy line ~1590, `MiniStat` 1598, `Definition` 1608.
- `web/src/components/internalStats/ColumnChart.tsx`: props `{ data: ColumnPoint[]; unit; axisLabel?; color?; emphasisColor?; emphasizePeak?; tableSummary? }`, returns null on empty data.
- Supabase mock pattern for server code: `web/src/__tests__/campaignCreatorStats.test.ts` lines 21-44 and 719-737 (`jest.mock("@/lib/supabase/server", () => ({ getServiceRoleClient: jest.fn() }))`). Server-only is mapped in `web/jest.config.js`. Component render pattern: `renderToStaticMarkup(createElement(...))` in the same file.
- Outcome semantics: `entry_choice` yes = got a reply, no = no reply yet (so: sent), not_sent = letter not sent. Progress-mode writes answers into rows with `completed = false`; those answers must be ignored.
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Data layer: round constants, letter_outcomes query, pure aggregateOutcomes, formatShare, tests</name>
  <files>web/src/lib/rueckmeldung/cohort.ts, web/src/lib/internalStats/outcomes.ts, web/src/lib/internalStats/getInternalStats.ts, web/src/lib/internalStats/view.ts, web/src/__tests__/internalStatsOutcomes.test.ts</files>
  <read_first>
    - /Users/thomas/.claude/plans/1-a-2-a-shimmying-starfish.md (sections Entscheidungen, Umsetzung 1-4, Verifikation 1)
    - web/src/lib/rueckmeldung/cohort.ts, web/src/lib/rueckmeldung/schema.ts, web/supabase/migrations/033_letter_outcomes.sql (column names and CHECK constraints)
    - web/src/lib/internalStats/getInternalStats.ts (whole file, 113 lines)
    - web/src/lib/internalStats/aggregate.ts lines 12-22 and 411-491
    - web/src/lib/internalStats/view.ts lines 1-8, 146-200, 385-386
    - "web/src/app/(site)/rueckmeldung/RueckmeldungForm.tsx" lines 193-216 (label wording only)
    - web/src/__tests__/campaignCreatorStats.test.ts lines 21-44 and 719-737 (Supabase mock pattern)
  </read_first>
  <behavior>
    - formatShare(2, 8) returns "2 von 8"; formatShare(5, 29) returns "5 von 29"; formatShare(9, 30) returns "30,0 % (n = 30)"; formatShare(15, 60) returns "25,0 % (n = 60)"; formatShare(12, 322) returns "3,7 % (n = 322)"; formatShare(0, 0) returns "0 von 0" (D-04)
    - Click-only rows (completed false): entry_choice yes counts as responded + sent + replied with unknown method; no counts as responded + sent, not replied; not_sent counts as responded + notSent (D-03)
    - Completed form overrides the click: entry_choice yes with letter_sent not_sent counts as notSent and not replied; entry_choice no with completed reply_channels ["email"] counts as replied; entry_choice yes with completed reply_channels ["none"] counts as sent, not replied (D-03)
    - A completed form with reply_channels ["acknowledgement"] counts as a reaction (channel present, not "none")
    - Details only from completed forms: an incomplete row that carries letter_sent, write_again, expectation, political_self_efficacy, reply_channels or body (progress mode) adds nothing to any detail count, free-text list or call_ok count, but still counts as a respondent via its click (D-03)
    - Rows of another cohort and rows with an invalid entry_choice that are not completed are ignored
    - returnDayCounts holds one key per UTC day from the round's sentAt day to the fetchedAt day inclusive (zero-filled), plus the click count per created_at day (D-05)
    - Self-efficacy comparison counts reviews with a valid political_self_efficacy and created_at strictly before reviewCutoffUtc, compared via Date.parse so "2026-08-12T22:00:00+00:00" is excluded and "2026-08-12T21:59:59.999+00:00" is included; outcome side counts completed forms only (D-06)
    - freeTexts contains only completed rows with a non-blank body, trimmed, newest completed_at first; displayName is set only when consent is true and display_name is non-blank; callOkCount counts completed rows with call_ok true (D-08)
    - JSON.stringify of an aggregateOutcomes result never contains "@" even when fixture bodies are clean, and the result type has no email field
    - getInternalStatsWithBaseline (mocked service-role client): the letter_outcomes select string does not match /\bemail\b/; the query calls not("email", "in", list) where the list contains every LASTCALL_TEST_EMAILS entry in double quotes; it filters cohort via in("cohort", [...]); the result carries outcomes with one entry per OUTCOME_ROUNDS; a letter_outcomes error makes the call reject (page then shows DataError) (D-03, D-08)
  </behavior>
  <action>
Write the tests from the behavior list first in the new file web/src/__tests__/internalStatsOutcomes.test.ts (mock server-only like other server tests, mock getServiceRoleClient with a chainable query object whose select/eq/in/not/maybeSingle return the object and whose then resolves the per-table result; counters returns data { value: 5 }). Run them red, then implement:

1. web/src/lib/rueckmeldung/cohort.ts (per D-05, plan step Umsetzung 1). Keep every existing export unchanged (scripts/export-lastcall-cohort.ts uses buildLastcallCohort and LASTCALL_CUTOFF_UTC). Add: LASTCALL_SENT_AT = "2026-10-14T07:07:00.000Z" with a short comment that this is 09:07 Europe/Berlin; LASTCALL_SENT_COUNT = 335; LASTCALL_DELIVERED_COUNT = 322 with a one-line comment that the value is fixed from the Brevo report and not read from the database; LASTCALL_LETTER_WINDOW_LABEL = "April bis 12.08.2026". Export type OutcomeRound with fields cohort, label, sentAt, sentCount, deliveredCount, letterWindowLabel, reviewCutoffUtc, and export OUTCOME_ROUNDS as a readonly array with exactly one entry for LASTCALL_COHORT labelled "Runde Oktober 2026" using the constants above and LASTCALL_CUTOFF_UTC. A future round (lastcall_2027_01) must only need one more entry. Export testEmailExclusionList(): string that returns a PostgREST in-list built from LASTCALL_TEST_EMAILS, sorted, each address wrapped in double quotes, comma-joined, wrapped in parentheses.

2. New web/src/lib/internalStats/outcomes.ts, pure module (no server-only, no Supabase import), modelled on the empty-factory / type-guard / counter style of aggregate.ts 411-491 (per D-03, D-05, D-06, D-07, D-08, plan step Umsetzung 3):
   a. Export type InternalOutcomeRow with exactly the selected columns, all nullable: cohort, created_at, completed, completed_at, entry_choice, letter_sent, not_sent_reason, reply_channels (string[] | null), reply_addressed, expectation, political_self_efficacy, write_again, body, consent, display_name, call_ok. No email field.
   b. Export OUTCOME_LABELS with Records keyed by the schema value types (letterSent, notSentReason, replyChannel, replyAddressed, expectation, writeAgain), each typed as Record over (typeof X_VALUES)[number] so TypeScript fails on drift. Copy the German wording verbatim from RueckmeldungForm.tsx lines 193-216. Self-efficacy labels are not duplicated: consumers use POLITICAL_SELF_EFFICACY_LABELS.
   c. A generic guard isOneOf(values, value) for the value arrays from web/src/lib/rueckmeldung/schema.ts and POLITICAL_SELF_EFFICACY_VALUES.
   d. Export type OutcomeRoundStats: round fields (cohort, label, sentAt, sentCount, deliveredCount, letterWindowLabel, reviewCutoffUtc); respondentCount; completedCount; path { delivered, responded, sent, sentHandwritten, sentTyped, sentMethodUnknown, notSent, replied, concrete, addressedBase }; returnDayCounts (Record day to count); replyRateByMethod { handwritten { sent, replied }, typed { sent, replied } }; channelCounts + channelBase; addressedCounts + addressedBase; notSentReasonCounts + notSentReasonBase; expectationVsResult (Record expectation to { total, replied }) + expectationBase; writeAgainCounts + writeAgainBase; selfEfficacy { outcomes, outcomesBase, reviews, reviewsBase } with Records over POLITICAL_SELF_EFFICACY_VALUES; freeTexts Array of { text, consent, displayName, day }; callOkCount.
   e. Export aggregateOutcomes(rows, reviewRows, round, fetchedAt). The fetchedAt parameter is a planner addition to the approved signature so the zero-filled timeline is deterministic in tests. Rules: keep only rows with cohort === round.cohort. Effective state per row: if completed is true and letter_sent is a valid value, the form decides (handwritten/typed = sent with known method, replied = reply_channels contains any valid channel other than "none"; not_sent = notSent, not replied). Otherwise the click decides (yes = sent + replied, no = sent, not_sent = notSent; method unknown); a non-completed row with an invalid entry_choice is skipped entirely. path.delivered = round.deliveredCount, path.responded = respondentCount. path.concrete counts completed sent rows with reply_addressed "concrete"; addressedBase counts completed rows with a valid reply_addressed. replyRateByMethod, channelCounts (distinct valid channels per completed sent row, "none" included; channelBase = completed sent rows with at least one valid channel), addressedCounts, notSentReasonCounts (completed not_sent rows), expectationVsResult (completed rows with valid expectation; replied uses the effective state), writeAgainCounts and selfEfficacy.outcomes all read completed rows only. selfEfficacy.reviews counts reviewRows with a valid political_self_efficacy and Date.parse(created_at) strictly below Date.parse(round.reviewCutoffUtc). returnDayCounts: zero-fill every UTC day (YYYY-MM-DD) from round.sentAt to fetchedAt inclusive, then add one per kept row on created_at.slice(0, 10) (validated with the same day-key regex as aggregate.ts). freeTexts and callOkCount as in the behavior list. No email matching between outcomes and reviews anywhere (D-05).

3. web/src/lib/internalStats/getInternalStats.ts (per D-03, D-08, plan step Umsetzung 2): add a fifth query to the existing Promise.all: client.from("letter_outcomes").select of exactly the 16 InternalOutcomeRow columns comma-joined, then .in("cohort", OUTCOME_ROUNDS.map(r => r.cohort)), then .not("email", "in", testEmailExclusionList()). The email column is filtered on but never selected. On error throw new Error with the prefix "Internal outcome stats failed: " like the other four checks. Add outcomes: InternalOutcomeRow[] to InternalStatsRows. Change getInternalStatsWithBaseline to return { stats, baseline, outcomes } where outcomes = OUTCOME_ROUNDS.map(round => aggregateOutcomes(rows.outcomes, rows.reviews, round, fetchedAt)), computed outside aggregateInternalStats and unaffected by the filter. Leave getInternalStats(filter) returning InternalStats as today. Do not add pagination: the existing 1000-row default on reviews stays a separate known risk (note it in the SUMMARY).

4. web/src/lib/internalStats/view.ts (per D-04, plan step Umsetzung 4): export SHARE_PERCENT_MIN_BASE = 30 and formatShare(count, base): string. Below the threshold return formatNumber(count) + " von " + formatNumber(base); from the threshold on return formatDecimal(share) + " % (n = " + formatNumber(base) + ")", where share comes from shareParts (one decimal). Do not change shareParts or isSmallBasis.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/internalStatsOutcomes.test.ts src/__tests__/internalStats.test.ts src/__tests__/internalStatsView.test.ts src/__tests__/internalStatsTimeline.test.ts && ! (npx tsc --noEmit -p . 2>&1 | grep "error TS" | grep -v "^\.next/") && grep -q 'from("letter_outcomes")' src/lib/internalStats/getInternalStats.ts && grep -q "export const OUTCOME_ROUNDS" src/lib/rueckmeldung/cohort.ts && grep -q "export function formatShare" src/lib/internalStats/view.ts</automated>
  </verify>
  <done>New test file green together with the three existing internalStats suites; tsc clean; getInternalStatsWithBaseline returns { stats, baseline, outcomes } with one OutcomeRoundStats per round; the letter_outcomes query excludes test addresses itself and never selects email; formatShare switches from "x von y" to "z % (n = y)" exactly at base 30.</done>
</task>

<task type="auto">
  <name>Task 2: UI: Briefweg component and section "Nach dem Brief" on /stats</name>
  <files>web/src/components/internalStats/Briefweg.tsx, web/src/app/stats/page.tsx, web/src/__tests__/internalStatsOutcomes.test.ts</files>
  <read_first>
    - .planning/brand-identity.md (Tonalität, Sprachregeln, Farben)
    - /Users/thomas/.claude/plans/1-a-2-a-shimmying-starfish.md (Entscheidungen 1, 2, 4-8; Umsetzung 5-6)
    - web/src/lib/internalStats/outcomes.ts (from Task 1: OutcomeRoundStats, OUTCOME_LABELS)
    - web/src/app/stats/page.tsx lines 1-60, 82-260, 283-313, 454-512, 834-860, 1083-1092, 1322-1330, 1410-1425, 1541-1616
    - web/src/components/internalStats/ColumnChart.tsx lines 1-40
    - web/src/app/globals.css lines 1-25 (brand tokens) and 296-309 (airmail stripe gradient)
  </read_first>
  <action>
First invoke the frontend-design skill (Skill tool, skill "frontend-design:frontend-design") and read .planning/brand-identity.md, as required by the approved plan (Umsetzung, first paragraph) and web/AGENTS.md. Keep the existing airmail/paper/green language of /stats; this is an internal page meant to look good in screenshots, not a marketing section.

1. New web/src/components/internalStats/Briefweg.tsx (per D-02, D-04, plan step Umsetzung 5). Server component (no "use client"), export function Briefweg({ round }: { round: OutcomeRoundStats }). Top edge: airmail stripe in red/blue/creme built from the brand CSS variables (var(--color-airmail-rot), var(--color-airmail-blau), var(--color-creme)) like the gradient in globals.css 296-309. Body: an ordered list with four stages, each glyph aria-hidden: "✉" zugestellt (round.path.delivered big, small line with "von {sentCount} verschickt"); "✎" geantwortet (path.responded big, share formatShare(responded, delivered)); "📮" abgeschickt (path.sent big, share formatShare(sent, responded), small line "{n} von Hand · {n} getippt · {n} ohne Angabe" using sentHandwritten/sentTyped/sentMethodUnknown); "↩" Reaktion (path.replied big, share formatShare(replied, responded), small line listing channelCounts without "none", sorted by count, labelled via OUTCOME_LABELS.replyChannel). Under the list one line "davon konkret eingegangen: " + formatShare(path.concrete, path.addressedBase). Bars from stage 2 on use responded as 100 % base (stage 2 bar full, stage 3 sent/responded, stage 4 replied/responded); stage 1 has no bar. Bars are decorative divs (aria-hidden) because every number is in text. Big numbers in font-typewriter, tabular-nums, large size. Layout: horizontal four columns with aria-hidden "→" connectors from lg up; stacked with vertical connectors below lg so it reads cleanly at 375px. Add an sr-only sentence summarising the path in plain German. No animation; if a transition is added use motion-safe: utilities only. Text colors from existing tokens with readable contrast (no lighter than text-warmgrau/60 for body text). Guard against division by zero (base 0 renders "0 von 0" via formatShare and empty bars).

2. web/src/app/stats/page.tsx:
   a. Imports: Briefweg; OUTCOME_LABELS and type OutcomeRoundStats from "@/lib/internalStats/outcomes"; formatShare and SHARE_PERCENT_MIN_BASE from view.ts (extend the existing import); the value arrays REPLY_CHANNEL_VALUES, REPLY_ADDRESSED_VALUES, NOT_SENT_REASON_VALUES, EXPECTATION_VALUES, WRITE_AGAIN_VALUES from "@/lib/rueckmeldung/schema".
   b. SECTION_LINKS (line 181-188): insert { id: "nach-dem-brief", label: "Nach dem Brief" } between the feedback and wirkung entries (D-01).
   c. Data (~line 848-854): declare let outcomes: OutcomeRoundStats[] and destructure it in the same try block as ({ stats, baseline, outcomes } = await getInternalStatsWithBaseline(filter)); the existing catch keeps rendering DataError.
   d. SurveyDistributionBars (line 454): add an optional prop valueLabel?: (count: number, total: number) => string. When set, render that string (font-typewriter text-sm font-bold tabular-nums text-waldgruen-dark) in place of ShareStat and skip the per-row BasisBadge (the block heading carries the badge). Existing callers stay unchanged.
   e. New section directly after the closing tag of the feedback Section (~line 1418) and before the wirkung Section, opening with exactly <Section id="nach-dem-brief" accent="rot">. Render one block per entry of outcomes in reverse order (newest round first; today one block). Per round:
      - SectionHeading eyebrow "Rückmeldungen nach dem Versand", title "Was passiert nach dem Brief?", detail containing the sentence "Die Filter oben wirken hier nicht." (D-01, same idea as the note at ~line 1090).
      - Round frame line (D-05) in font-typewriter small text: "{label} · Mail am {formatDate(sentAt)} an {sentCount} Leute, {deliveredCount} zugestellt · Briefe aus {letterWindowLabel}". Use formatDate only (no time of day, server timezone is UTC).
      - SubHeading "Briefweg" plus BasisBadge when respondentCount is below SHARE_PERCENT_MIN_BASE, then <Briefweg round={round} /> (D-02).
      - SubHeading "Rücklauf pro Tag seit dem Versand" and ColumnChart with data bucketTimeline(round.returnDayCounts, "day"), unit "Rückmeldungen", axisLabel "Tag"; EmptyState "Noch keine Rückmeldungen zu dieser Runde." when respondentCount is 0 (D-05).
      - Four detail blocks in a grid (one column on mobile, two from lg), each with a SubHeading and BasisBadge when its base is below SHARE_PERCENT_MIN_BASE, all shares via formatShare (D-04, D-07). If completedCount is 0, show one EmptyState "Noch keine fertigen Formulare." instead of the four blocks.
        Block 1 "Von Hand oder getippt": two MiniStat tiles labelled OUTCOME_LABELS.letterSent.handwritten and .typed, value formatShare(replied, sent) from replyRateByMethod, detail "mit Reaktion".
        Block 2 "Reaktion und wie konkret": SurveyDistributionBars for channels (options from REPLY_CHANNEL_VALUES with OUTCOME_LABELS.replyChannel, total channelBase, valueLabel formatShare, note "Mehrfachnennung möglich") and for reply_addressed (REPLY_ADDRESSED_VALUES, total addressedBase).
        Block 3 "Wieder schreiben und Handlungsfähigkeit": SurveyDistributionBars for write_again (WRITE_AGAIN_VALUES, total writeAgainBase), then the self-efficacy group comparison (D-06): two columns side by side from md up, "Rückmeldungen (Wochen nach dem Brief)" with selfEfficacy.outcomes / outcomesBase and "Reviews bis 12.08.2026 (direkt nach dem Brief)" with selfEfficacy.reviews / reviewsBase, both using selfEfficacyOptions (line 503) and valueLabel formatShare, plus the note "Verschiedene Gruppen, keine Person ist verknüpft."
        Block 4 "Nicht abgeschickt und Erwartung": SurveyDistributionBars for not_sent_reason (NOT_SENT_REASON_VALUES, total notSentReasonBase), then for each EXPECTATION_VALUES entry with total above 0 a row "{label}: {total} · davon mit Reaktion {formatShare(replied, total)}".
      - A small MiniStat row: "Fertige Formulare" (completedCount) and "Offen für ein Gespräch" (callOkCount) (D-08).
      - Collapsible with summary "Alle Antworten ({freeTexts.length})" and detail "Freitexte aus fertigen Formularen, ohne E-Mail-Adressen. Texte mit Freigabe sind markiert." (D-08). Do not add an open attribute: it must stay closed by default. Inside: a list of blockquotes, body rendered as plain React text children with whitespace-pre-line (never as raw injected HTML), the day formatted dd.mm.yyyy, and for consent true a small marker "Freigabe zur Veröffentlichung" plus the displayName when present. EmptyState "Noch keine Freitexte." when the list is empty.
      - BasisNote: "Basis: {respondentCount} Rückmeldungen per Klick, {completedCount} fertige Formulare · Testadressen ausgeschlossen · 322 zugestellt laut Brevo · Details nur aus fertigen Formularen" (numbers from round fields, not hard-coded).
   f. Definitions block (~line 1541): add Definition title "Rückmeldungen" (plan step Umsetzung 6), body built from the round constants: the click in the mail counts for the main question, a completed form takes precedence, all details come only from completed forms, test addresses are excluded in the query, below 30 answers absolute numbers are shown and from 30 percentages with n, the delivered count comes from Brevo, and the filters on the page do not apply.
   g. Privacy wording (D-08): the Datenschutz Definition body (~line 1579) and the footer line (~line 1590) currently claim that single rows are never shown, which is no longer true. Replace the Definition body with: "Aggregate · keine Brieftexte · keine E-Mail-Adressen · keine vollständigen PLZ. Einzige Ausnahme sind die Freitexte aus den Rückmeldungen, eingeklappt unter „Alle Antworten“ und ohne E-Mail-Adresse. Die Seite ist passwortgeschützt und für Suchmaschinen gesperrt (noindex)." Replace the footer line with: "Aggregate · Freitexte aus Rückmeldungen nur eingeklappt · keine Anliegen · keine E-Mail-Adressen".
   h. Read every new string once against rule 4 of the objective and the anti-AI checklist before finishing.

3. Append describe("Briefweg") to web/src/__tests__/internalStatsOutcomes.test.ts: build a round via aggregateOutcomes from a small fixture and renderToStaticMarkup(createElement(Briefweg, { round })). Assert the markup contains "<ol", "322", the formatShare text for responded vs delivered, "davon konkret eingegangen", and does not contain "@".
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/internalStatsOutcomes.test.ts && npx eslint src/app/stats/page.tsx src/components/internalStats/Briefweg.tsx src/__tests__/internalStatsOutcomes.test.ts && ! (npx tsc --noEmit -p . 2>&1 | grep "error TS" | grep -v "^\.next/") && grep -q '{ id: "nach-dem-brief", label: "Nach dem Brief" }' src/app/stats/page.tsx && awk '/<Section id="feedback"/{f=NR} /<Section id="nach-dem-brief"/{n=NR} /<Section id="wirkung"/{w=NR} END{exit !(f && f<n && n<w)}' src/app/stats/page.tsx && grep -q "<Briefweg round=" src/app/stats/page.tsx && grep -q "Alle Antworten" src/app/stats/page.tsx && grep -q 'title="Rückmeldungen"' src/app/stats/page.tsx && ! grep -q "keine Einzelzeilen" src/app/stats/page.tsx && ! grep -q "dangerouslySetInnerHTML" src/components/internalStats/Briefweg.tsx && awk '/<Section id="nach-dem-brief"/,/<Section id="wirkung"/' src/app/stats/page.tsx | cat - src/components/internalStats/Briefweg.tsx | perl -CSD -ne 'exit 1 if /[\x{2013}\x{2014}]|\b(?:wir|uns|unser)\b/i'</automated>
  </verify>
  <done>Section "Nach dem Brief" renders between Feedback and Wirkung with its nav link, filter note, round frame, Briefweg, daily return chart, four open detail blocks, MiniStats and a closed "Alle Antworten" collapsible; Definition "Rückmeldungen" exists; both privacy notes describe the free-text exception; new copy has no Gedankenstrich and no plural first person; Briefweg render test green; tsc and eslint clean for the touched files.</done>
</task>

<task type="auto">
  <name>Task 3: Gates: lint, full test suite, production build</name>
  <files>web/src/lib/rueckmeldung/cohort.ts, web/src/lib/internalStats/outcomes.ts, web/src/lib/internalStats/getInternalStats.ts, web/src/lib/internalStats/view.ts, web/src/components/internalStats/Briefweg.tsx, web/src/app/stats/page.tsx, web/src/__tests__/internalStatsOutcomes.test.ts</files>
  <read_first>
    - Output of the three commands below
  </read_first>
  <action>
From web/ run npm run lint, npm run test and npm run build (plan section Verifikation 2). Fix only failures caused by files of this plan (the files listed above). If a failure comes from a file outside this plan, do not fix it: record the exact command, file and error line in the SUMMARY as pre-existing. If the build fails because a Next.js 16 server/client boundary rule is hit (for example Briefweg importing something client-only), read the relevant guide in web/node_modules/next/dist/docs/ before changing code, per web/AGENTS.md. After the gates, run git status and confirm that only files from files_modified changed (plus the SUMMARY) and that any pre-existing dirty changes are untouched. In the SUMMARY also note: the reviews query still has no pagination (silent 1000-row default) and was intentionally left unchanged; the 322 is a fixed Brevo value; migration 033 read-only verification is still open per MIGRATION_STATUS.md; browser verification at 375px and desktop is pending with the orchestrator.
  </action>
  <verify>
    <automated>cd web && npm run lint && npm run test && npm run build</automated>
  </verify>
  <done>All three commands exit 0, or every remaining failure is documented in the SUMMARY as pre-existing and outside this plan's files; no unrelated files changed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Supabase letter_outcomes (service role) → /stats server render | Rows contain email addresses and personal free texts; the service role bypasses RLS |
| Browser → /stats | Page is protected only by the INTERNAL_STATS_PASSWORD cookie; rendered HTML must not carry data beyond what the decision allows |
| Respondent free text → rendered HTML | Untrusted user text rendered on an internal page |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261014iuq-01 | Information disclosure | getInternalStats letter_outcomes query | high | mitigate | Select lists the 16 non-email columns explicitly; InternalOutcomeRow has no email field; Jest asserts the select string does not match /\bemail\b/ and that aggregateOutcomes output contains no "@"; Briefweg render test asserts no "@". |
| T-261014iuq-02 | Tampering (data integrity) | Test addresses in outcome counts | medium | mitigate | Exclusion happens in the query via .not("email", "in", testEmailExclusionList()) built from LASTCALL_TEST_EMAILS; Jest asserts every test address is in the list. |
| T-261014iuq-03 | Information disclosure | Free texts on /stats | medium | mitigate | Free texts only from completed forms, only inside the default-closed Collapsible "Alle Antworten", display names only with consent; covered by the processing consent ("Thomas wertet aus") per D-08; page stays password-gated and noindex; privacy notes updated to say so. |
| T-261014iuq-04 | Tampering (XSS) | Free-text rendering | medium | mitigate | Body rendered as React text children only, no dangerouslySetInnerHTML (verify gate greps Briefweg; page uses blockquote with plain text). |
| T-261014iuq-05 | Information disclosure | Error path | low | mitigate | letter_outcomes errors throw a message without row data into the existing catch that logs "[internal-stats] read failed" and renders DataError; no row content is logged. |
| T-261014iuq-06 | Repudiation / misreading | Small-basis shares | low | mitigate | formatShare shows absolute "x von y" below 30 and percent with n above; BasisBadge on blocks under 30; group comparison labelled as different groups (D-04, D-06). |
| T-261014iuq-SC | Tampering | npm/pip/cargo installs | high | mitigate | No package installs in this plan; executor must not add dependencies. |
</threat_model>

<verification>
1. Task 1 automated gate: new outcomes tests plus existing internalStats suites green, tsc clean.
2. Task 2 automated gate: Briefweg render test, eslint on touched files, tsc, section order, nav link, Definition, privacy wording, copy rules (no Gedankenstrich, no plural first person) in the new section and component.
3. Task 3: npm run lint, npm run test, npm run build from web/.
4. Orchestrator afterwards (not the executor): browser check of /stats on desktop and 375px with a session-only INTERNAL_STATS_PASSWORD, "Alle Antworten" closed on the desktop screenshot, no email address in the HTML (plan section Verifikation 3-4).
</verification>

<success_criteria>
- getInternalStatsWithBaseline returns outcomes per round, with test addresses excluded in the query and no email column read.
- /stats shows "Nach dem Brief" between Feedback and Wirkung with nav link, filter note, round frame, Briefweg, daily return chart, four open detail blocks, call_ok count and a closed "Alle Antworten" block.
- Shares follow the 30 threshold everywhere in the section.
- Privacy notes and the new Definition "Rückmeldungen" match the actual behaviour.
- Lint, full Jest suite and production build pass, or remaining failures are documented as pre-existing.
</success_criteria>

<output>
Create `.planning/quick/261014-iuq-stats-seite-sektion-nach-dem-brief-fuer-/261014-iuq-SUMMARY.md` when done.
</output>

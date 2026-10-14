---
phase: quick-261014-hhs
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/lib/campaigns/creatorSurvey.ts
  - web/src/lib/campaigns/creatorSurveyRepository.ts
  - web/src/lib/campaigns/creatorStats.ts
  - web/src/lib/campaigns/creatorStatsView.ts
  - web/src/lib/campaigns/endedMail.ts
  - web/src/lib/actions/submitCreatorSurvey.ts
  - web/src/lib/actions/campaignEnd.ts
  - web/src/lib/email/buildCampaignCreatorEmailHtml.ts
  - web/src/lib/email/sendCampaignCreatorEmail.ts
  - web/src/lib/email/sendCreatorSurveyAdminEmail.ts
  - web/src/lib/email/sendCampaignEndedAdminNotice.ts
  - web/scripts/send-campaign-ended-mail.ts
  - web/src/app/(site)/kampagne/verwalten/feedback/page.tsx
  - web/src/components/campaigns/CreatorSurveyForm.tsx
  - web/src/components/campaigns/CreatorSurveyCard.tsx
  - web/src/app/(site)/datenschutz/page.tsx
  - web/supabase/migrations/034_campaign_end_feedback.sql
  - web/supabase/MIGRATION_STATUS.md
  - web/src/__tests__/creatorSurvey.test.ts
  - web/src/__tests__/creatorSurveyAction.test.ts
  - web/src/__tests__/creatorSurveyAdminEmail.test.ts
  - web/src/__tests__/campaignEndedEmail.test.ts
  - web/src/__tests__/campaignEndedMailFlow.test.ts
  - web/src/__tests__/campaignEndActions.test.ts
  - .planning/todos/pending/2026-10-08-kampagnen-s4-danke-mail-zum-kampagnenende.md
autonomous: true
requirements: [quick-261014-hhs]

estimate:
  tokens: 230000
  raw_tokens: 230000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "An ended campaign with 10 or more letters (never status blocked) is eligible for the creator survey; running campaigns still need 500 (D-05)"
    - "The ended mail has exactly one big primary CTA '1 Minute Feedback' whose href is creatorSurveyUrl(token) (manage link with &ziel=feedback); the referral ask with a link to /ngo-briefkampagne sits directly above it; donation is only a small text link (D-06b)"
    - "The ended mail shows the send-rate line only when getCampaignCreatorStats-equivalent data has a shown sendRate (>= 10 answers), worded honestly as 'X % der N Unterstützer:innen, die geantwortet haben, ...' (D-06a)"
    - "created_by_founder = true adds the founder thank-you sentence to the ended mail and shows 'Von Thomas aufgesetzt: ja' in the survey admin mail (D-04)"
    - "The survey form has the three new questions (expectation, outcomes + optional note, To-Do statement), lead text says 'etwa 1 Minute', and the quote consent offers named OR anonymous with an optional label and a live preview (D-02, D-03)"
    - "The script supports --list (ended, ended_notified_at null, 10+ letters), --preview-to-me (mail to Thomas with marked note gap, no DB writes), --note, and --send (needs --note, refuses when already notified, sets ended_notified_at only after a real creator send) (D-07, D-08)"
    - "endCampaignAction sends a short admin mail to Thomas after a successful end via after(); a mail failure never changes the action result; nothing is sent to creators (D-08)"
    - "Until migrations 029 and 034 are applied, the survey stays dark (status unavailable) and the app's main campaign queries are unchanged (no select of the new campaigns columns outside tolerant reads and the manual script)"
  artifacts:
    - path: web/supabase/migrations/034_campaign_end_feedback.sql
      provides: "campaigns.created_by_founder, campaigns.ended_notified_at, new campaign_creator_surveys columns + CHECKs"
      contains: "ended_notified_at"
    - path: web/src/lib/campaigns/creatorStatsView.ts
      provides: "pure (non server-only) stats builder + constants, re-exported by creatorStats.ts"
      contains: "buildCampaignCreatorStats"
    - path: web/src/lib/campaigns/endedMail.ts
      provides: "isAwaitingEndedMail, endedMailSendStat, resolveEndedMailSend (pure, script-importable)"
    - path: web/src/lib/email/sendCampaignEndedAdminNotice.ts
      provides: "buildCampaignEndedAdminNoticeHtml + sendCampaignEndedAdminNotice"
    - path: web/src/__tests__/campaignEndedMailFlow.test.ts
      provides: "Jest for --list selection, stat threshold, send guard / ended_notified_at idempotency"
  key_links:
    - from: "web/src/lib/email/sendCampaignCreatorEmail.ts"
      to: "web/src/lib/campaigns/creatorSurvey.ts"
      via: "creatorSurveyUrl(token) becomes ended.feedbackUrl"
      pattern: "creatorSurveyUrl"
    - from: "web/scripts/send-campaign-ended-mail.ts"
      to: "web/src/lib/campaigns/endedMail.ts"
      via: "isAwaitingEndedMail for --list, resolveEndedMailSend before any send, endedMailSendStat for the stats line"
      pattern: "resolveEndedMailSend"
    - from: "web/scripts/send-campaign-ended-mail.ts"
      to: "web/src/lib/campaigns/creatorStatsView.ts"
      via: "buildCampaignCreatorStats on the campaign's review rows (script cannot import server-only modules)"
      pattern: "buildCampaignCreatorStats"
    - from: "web/src/lib/actions/campaignEnd.ts"
      to: "web/src/lib/email/sendCampaignEndedAdminNotice.ts"
      via: "after(() => sendCampaignEndedAdminNotice(...)) following endCampaignNow"
      pattern: "sendCampaignEndedAdminNotice"
    - from: "web/src/lib/campaigns/creatorSurveyRepository.ts"
      to: "web/supabase/migrations/034_campaign_end_feedback.sql"
      via: "status probe selects quote_mode, so a missing 034 keeps the survey unavailable"
      pattern: "quote_mode"
---

<objective>
Kampagnen-Abschluss-Mail mit 1-Minute-Feedback fuer Ersteller:innen, exactly as approved in the locked plan (Grilling 2026-10-14). Decision IDs below map 1:1 to "Entscheidungen" 1-9 of that plan: D-01 build on existing (no rebuild), D-02 three new survey questions + "etwa 1 Minute", D-03 quote named OR anonymous + label + live preview, D-04 campaigns.created_by_founder, D-05 survey eligibility ended 10+, D-06 ended mail (stats from 10 answers, one big feedback button + referral above, quiet donation, big thanks, Thomas' personal paragraph on top), D-07 manual two-step send (--preview-to-me, --note, --send, ended_notified_at), D-08 admin notice on endCampaignAction + --list, D-09 existing ended campaigns (incl. NRV) use the same flow.

Purpose: Creators get a warm closing mail that leads straight into a 1-minute form; Thomas gets results, media/political outcomes, quote permissions and referrals.
Output: migration 034 (file only), extended survey, rebuilt ended mail, script flags, admin notice, tests, rendered previews, S4 todo update, and a SUMMARY with a "Copy zur Freigabe" section.

Hard boundaries (orchestrator constraints, override D-01's "Migration 029 anwenden"; the approved plan's own Umsetzung step 1 also says "erst nach OK anwenden"):
- Do NOT apply any migration. Create the 034 file and update web/supabase/MIGRATION_STATUS.md only.
- Do NOT send any email. Never run the script with --send or --preview-to-me (both send via Brevo). Render previews to files only. No DB writes.
- No push, no deploy. No new npm packages.
- All new or changed user-facing copy is a DRAFT: draft it with the `write-like-me` skill, check it against `../signs-of-ai-writing.md`, no em dashes (use hyphens, commas, colons), "ich" never "wir" for Thomas, brand spelled "Brief-nach-Berlin", donation only quiet ("Reichweite vor Spende"). Collect every new/changed string in a "Copy zur Freigabe" section of the SUMMARY.
- Frontend parts (form, mail layout) go through the `frontend-design:frontend-design` skill (project memory rule); keep the existing airmail/paper/green language and existing email table/inline-style patterns.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@web/AGENTS.md
@.planning/STATE.md
@.planning/todos/pending/2026-10-08-kampagnen-s4-danke-mail-zum-kampagnenende.md
@.planning/quick/261009-r0z-feedback-formular-fuer-kampagnen-erstell/261009-r0z-SUMMARY.md
@.planning/quick/261009-luq-kampagnen-abschluss-mail-fuer-beendete-k/261009-luq-SUMMARY.md

Verified facts from planning (do not re-derive):
- `server-only` is NOT an installed package; tsx scripts cannot import any module that has `import "server-only"` (probe: "Cannot find module 'server-only'"). creatorSurvey.ts, endDate.ts, schema.ts, internalStats/aggregate.ts, feedback/feedbackTags.ts import fine under tsx. creatorStats.ts and creatorSurveyRepository.ts and repository.ts are server-only.
- Jest maps `server-only` via jest.config moduleNameMapper; tests run from web/ with `npx jest <path>`.
- Migration 029 is NOT applied in production (MIGRATION_STATUS.md). 034 must ALTER `campaign_creator_surveys`, so it requires 029 first. Latest existing migration is 033.
- The creator-feedback paragraph in the privacy page is now in section "21. Kampagnen von Creatorinnen und Creatorn" (renumbered since r0z, around lines 896-917 of web/src/app/(site)/datenschutz/page.tsx). "Stand: 14. Oktober 2026" is already today's date; leave it.
- FOUNDER_EMAIL (web/src/lib/config.ts) equals BRIEF_EMAIL; admin mails go to `process.env.THOMAS_MAIL || CONTACT.email` (see sendCreatorSurveyAdminEmail.ts).
- `getCampaignCreatorStats` (web/src/lib/campaigns/creatorStats.ts ~line 509) = loadReviewRows + loadSignalRows + pure `buildCampaignCreatorStats`; feedback.sendRate is a CreatorStatsKpi `{status:"shown", value, responses}` computed over knownSendCount.
- tsc --noEmit has pre-existing unrelated errors (.next/dev/types duplicates, campaignTopicReset test); use eslint on changed files + `npm run build` as the type gate.
</context>

<tasks>

<task type="tracer">
  <name>Task 1 (tracer): Abschluss-Mail fuehrt per "1 Minute Feedback"-Button ins Formular, ended ab 10 Briefen</name>
  <files>web/src/lib/campaigns/creatorSurvey.ts, web/src/lib/email/buildCampaignCreatorEmailHtml.ts, web/src/lib/email/sendCampaignCreatorEmail.ts, web/scripts/send-campaign-ended-mail.ts, web/src/__tests__/creatorSurvey.test.ts, web/src/__tests__/campaignEndedEmail.test.ts</files>
  <read_first>web/src/lib/campaigns/creatorSurvey.ts (isCreatorSurveyEligible ~line 219, creatorSurveyUrl ~line 246), web/src/lib/email/buildCampaignCreatorEmailHtml.ts (buildCampaignEndedEmailHtml ~line 271), web/src/lib/email/sendCampaignCreatorEmail.ts, web/scripts/send-campaign-ended-mail.ts, web/src/__tests__/campaignEndedEmail.test.ts</read_first>
  <action>
Thinnest vertical slice through every layer the mail flow touches: survey eligibility (lib) -> mail builder -> Brevo sender -> manual script -> existing manage-link jump (zugang route, already tested).

1. Per D-05: in creatorSurvey.ts set CREATOR_SURVEY_MIN_LETTERS_ENDED to 10. Leave CREATOR_SURVEY_MIN_LETTERS (500) and isCreatorSurveyMilestone untouched (500er rule stays; no 500er mail block in this scope). Update the comment above isCreatorSurveyEligible if it mentions 50. In creatorSurvey.test.ts rename/adjust the "needs only 50 letters once the campaign has ended" case to 10 (9 letters ended -> false, 10 letters ended -> true, 10 letters running -> false, blocked ended 10 -> false).

2. Per D-06b: extend CampaignEndedEmailParams with a required `feedbackUrl: string`. In buildCampaignEndedEmailHtml replace the current feedbackBox ("Wie war es für dich?" + reply hint) with a box that holds one big primary button (same filled green style as the existing "Statistiken ansehen" button: background #2D6A4F, white, 16px bold, class bnb-cta-link) labelled "1 Minute Feedback" linking to `escapeHtml(feedbackUrl)` with target _blank, plus a short reply hint below it (draft: "Oder antwortet einfach auf diese Mail."). Copy wording is finalised in Task 3; keep this step structural.

3. In sendCampaignCreatorEmail.ts, for kind "ended" compute `feedbackUrl: creatorSurveyUrl(params.token)` (import from "@/lib/campaigns/creatorSurvey", which is not server-only and safe for the script's lazy import). Only the token-carrying union branch has `token`; kind "ended" is in that branch.

4. In web/scripts/send-campaign-ended-mail.ts file-preview branch, pass `feedbackUrl: creatorSurveyUrl("vorschau")` (relative import ../src/lib/campaigns/creatorSurvey). No other script changes in this task.

5. Tests in campaignEndedEmail.test.ts: add `feedbackUrl` to the fixture; assert the html contains the "1 Minute Feedback" label and an href containing both `token=test` and `ziel=feedback`; assert the old reply-only box heading "Wie war es für dich?" is gone; in the Brevo-mocked send test assert the sent htmlContent contains `ziel=feedback` and the token passed to sendCampaignCreatorEmail. Keep the other existing assertions passing (copy rewrite comes in Task 3).
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/creatorSurvey.test.ts src/__tests__/campaignEndedEmail.test.ts src/__tests__/campaignTransferAccess.test.ts</automated>
  </verify>
  <done>Ended 10+ campaigns are survey-eligible (running still 500); the ended mail renders one "1 Minute Feedback" button whose href is the manage link with ziel=feedback built from the send token; the three suites pass.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Migration 034 + Formular um Erwartung, Ergebnisse, To-Do-Aussage und Zitat-Modus erweitern</name>
  <files>web/supabase/migrations/034_campaign_end_feedback.sql, web/supabase/MIGRATION_STATUS.md, web/src/lib/campaigns/creatorSurvey.ts, web/src/lib/campaigns/creatorSurveyRepository.ts, web/src/lib/actions/submitCreatorSurvey.ts, web/src/lib/email/sendCreatorSurveyAdminEmail.ts, web/src/app/(site)/kampagne/verwalten/feedback/page.tsx, web/src/components/campaigns/CreatorSurveyForm.tsx, web/src/components/campaigns/CreatorSurveyCard.tsx, web/src/app/(site)/datenschutz/page.tsx, web/src/__tests__/creatorSurvey.test.ts, web/src/__tests__/creatorSurveyAction.test.ts, web/src/__tests__/creatorSurveyAdminEmail.test.ts</files>
  <read_first>web/supabase/migrations/029_campaign_creator_surveys.sql, web/supabase/migrations/026_campaign_ends_at.sql (style for campaigns columns), web/supabase/MIGRATION_STATUS.md, web/src/lib/campaigns/creatorSurveyRepository.ts, web/src/lib/actions/submitCreatorSurvey.ts, web/src/lib/email/sendCreatorSurveyAdminEmail.ts, web/src/components/campaigns/CreatorSurveyForm.tsx, web/src/app/(site)/kampagne/verwalten/feedback/page.tsx, web/src/__tests__/creatorSurveyAction.test.ts, web/src/__tests__/creatorSurveyAdminEmail.test.ts</read_first>
  <behavior>
    - Schema accepts the new fields: expectation one of mehr|so_viele|weniger or null; outcomes subset of medienbericht|antwort_politik|politische_entscheidung|noch_nichts|zu_frueh; outcomesNote trimmed max 300; statements.todoHandeln uses the existing four answers; quoteMode named|anonymous or null; anonymousLabel trimmed max 80
    - Schema rejects: noch_nichts or zu_frueh combined with any other outcome; consentQuote true with quoteMode null (consent scope must be explicit, never defaulted to named)
    - normalize: quoteMode becomes null when there is no quote consent; anonymousLabel becomes null unless consent + anonymous; empty strings become null; arrays in option-list order
    - toggleOutcome: picking noch_nichts or zu_frueh replaces everything; picking a positive outcome drops both exclusive ones; picking a selected slug removes it
    - creatorSurveyQuoteAttribution: named -> displayName; anonymous -> label, or "eine Initiative" when empty
    - resolveConsentQuoteAt re-stamps when quoteMode or anonymousLabel changes (not only the quote); creatorSurveyAnswersChanged sees every new field
    - getCreatorSurveyStatus returns "unavailable" when the probe select (which now includes quote_mode) errors, e.g. 42703; getCampaignCreatedByFounder returns false on any error and true only for created_by_founder === true
    - Action passes createdByFounder into the admin mail params; admin mail shows "Von Thomas aufgesetzt", expectation, outcomes + note (escaped), the To-Do statement, and the consent line as nein / mit Logo und Name / anonym als „label“
    - migration 034 file mirrors every new slug as a quoted literal and contains created_by_founder, ended_notified_at, statement_todo_handeln
  </behavior>
  <action>
Per D-01 extend the existing r0z survey; do not rebuild. Use `frontend-design:frontend-design` for the form part.

1. Migration web/supabase/migrations/034_campaign_end_feedback.sql (file only, never apply). Header comment in the 029/026 style: purpose, "Requires 029 applied first", apply manually in Supabase SQL Editor after Thomas' OK, idempotent, code tolerates absence (survey stays unavailable via the quote_mode probe; script --send/--list refuse with a clear message; app campaign queries do not select the new columns). Contents:
   a. campaigns: add column if not exists created_by_founder boolean not null default false (per D-04, Thomas sets it in the Supabase dashboard), add column if not exists ended_notified_at timestamptz (per D-07), with comment on column for both.
   b. campaign_creator_surveys add columns if not exists: expectation text, outcomes text[] not null default '{}', outcomes_note text, statement_todo_handeln text, quote_mode text, anonymous_label text.
   c. Backfill before constraints: set quote_mode = 'named' where consent_quote and quote_mode is null (an old consent was "mit Logo und Name").
   d. CHECK constraints, each written as DROP CONSTRAINT IF EXISTS then ADD CONSTRAINT so re-runs are safe: expectation null or in ('mehr','so_viele','weniger'); outcomes contained in ARRAY['medienbericht','antwort_politik','politische_entscheidung','noch_nichts','zu_frueh']; 'noch_nichts' or 'zu_frueh' only alone (cardinality 1); outcomes_note null or length 1-300; statement_todo_handeln in ('stimmt','teils','stimmt_nicht','weiss_nicht'); quote_mode null or in ('named','anonymous'); consent_quote requires quote_mode not null; quote_mode not null requires consent_quote; anonymous_label null or (length 1-80 and quote_mode = 'anonymous').
   e. Update MIGRATION_STATUS.md: add a 034 row "Not yet applied (file only, 2026-10-14). Requires 029. Apply order after Thomas' OK: 029, then 034, in the SQL Editor." Extend the 029 row's note that 034 must follow it before the survey becomes visible.

2. creatorSurvey.ts (per D-02, D-03), keeping the existing allowlist pattern (const arrays of {slug,label}, z.enum built from them, labels are drafts):
   a. CREATOR_SURVEY_EXPECTATIONS: mehr "Mehr als erwartet", so_viele "So viele wie erwartet", weniger "Weniger als erwartet" (D-02a, one tap).
   b. CREATOR_SURVEY_OUTCOMES: medienbericht "Medienbericht", antwort_politik "Antwort aus der Politik", politische_entscheidung "Politische Entscheidung", noch_nichts "Noch nichts", zu_frueh "Noch zu früh"; CREATOR_SURVEY_OUTCOMES_EXCLUSIVE = [noch_nichts, zu_frueh]; CREATOR_SURVEY_OUTCOMES_NOTE_MAX = 300; toggleOutcome modelled on toggleConcern (D-02b; exclusivity is planner discretion so "noch nichts" never coexists with a reported result).
   c. New statement in CREATOR_SURVEY_STATEMENTS after handschriftWirkt: key todoHandeln, column statement_todo_handeln, label verbatim "Ein konkretes To-Do hat unsere Leute ins Handeln gebracht." (D-02c).
   d. CREATOR_SURVEY_QUOTE_MODES: named "Mit Logo und Name", anonymous "Anonym"; CREATOR_SURVEY_ANONYMOUS_LABEL_MAX = 80; CREATOR_SURVEY_ANONYMOUS_FALLBACK = "eine Initiative"; CREATOR_SURVEY_ANONYMOUS_PLACEHOLDER = "eine Umwelt-NGO aus NRW"; creatorSurveyQuoteAttribution({quoteMode, anonymousLabel}, displayName) (D-03).
   e. Extend CreatorSurveyAnswers with expectation (slug or null), outcomes, outcomesNote (string or null), quoteMode (named|anonymous or null), anonymousLabel (string or null); extend creatorSurveyInputSchema (two new refines, see behavior), normalizeCreatorSurvey, creatorSurveyAnswersChanged, resolveConsentQuoteAt per the behavior block.

3. creatorSurveyRepository.ts: row type, mapRow and upsert get the new columns (expectation, outcomes, outcomes_note, quote_mode, anonymous_label; statement_todo_handeln flows through CREATOR_SURVEY_STATEMENTS automatically). Change the getCreatorSurveyStatus probe select from "id" to "id, quote_mode" and update its comment: the feature stays dark until both 029 and 034 exist. Add getCampaignCreatedByFounder(campaignId, db?) reading campaigns.created_by_founder by id with maybeSingle, never throwing (console.error + false on error). Do NOT add created_by_founder to the main campaign select in web/src/lib/campaigns/repository.ts; that would break production queries before 034 is applied.

4. submitCreatorSurvey.ts: after the eligibility check load createdByFounder via getCampaignCreatedByFounder and pass it into the admin mail params. No other behavior change.

5. sendCreatorSurveyAdminEmail.ts: params get createdByFounder: boolean. Body (all values through esc): a line "Von Thomas aufgesetzt: ja/nein" under the campaign line (D-04); "Briefe im Vergleich zur Erwartung" with the label or "keine Angabe"; "Ergebnisse gehört" list (or "Nichts angekreuzt") plus the outcomes note as a quoted block when present; the To-Do statement appears through the existing statements loop; replace "Zitat mit Logo/Name freigegeben: ja/nein" with "Zitat freigegeben: nein", "Zitat freigegeben: mit Logo und Name" or "Zitat freigegeben: anonym als „{attribution}“" (attribution via creatorSurveyQuoteAttribution, fallback "eine Initiative"). Keep help offers on top and replyTo unchanged.

6. feedback/page.tsx: the record-to-initial mapping lists fields explicitly; add expectation, outcomes, outcomesNote, quoteMode, anonymousLabel.

7. CreatorSurveyForm.tsx (frontend-design skill, mobile-first at 375 px, reuse ChipToggle, CheckRow, fieldsetClasses, fieldsetLegend, existing textarea classes and focus styles):
   a. Lead text per D-02: "Ein paar kurze Fragen, etwa 1 Minute. Jede Angabe ist freiwillig."
   b. New first fieldset (one tap, easy start; order is planner discretion): legend draft "Wie viele Briefe sind es geworden?", radiogroup of ChipToggle role="radio" over CREATOR_SURVEY_EXPECTATIONS, re-tap clears (same pattern as setStatement).
   c. Second fieldset: legend draft "Habt ihr schon von Ergebnissen gehört?", chips via toggleOutcome, then an optional textarea (id creator-survey-outcomes-note, label draft "Was genau? (optional)", maxLength CREATOR_SURVEY_OUTCOMES_NOTE_MAX, counter like the quote counter) and hint per D-02b, draft "Kommt später noch etwas? Tragt es hier nach oder antwortet einfach auf meine Mail."
   d. Then the existing reasons, concerns, statements (now including the To-Do statement automatically), quote textarea.
   e. "Was ich zeigen darf" per D-03: replace the named-only checkbox with CheckRow "Unser Satz darf auf brief-nach-berlin.de erscheinen." (disabled without quote, as today); when checked show a radiogroup (CREATOR_SURVEY_QUOTE_MODES, default named in local state); when anonymous show an input (label draft "So darf ich euch nennen (optional)", placeholder CREATOR_SURVEY_ANONYMOUS_PLACEHOLDER, maxLength 80, hint draft "Leer gelassen steht dort „eine Initiative“."). The live preview card follows the mode: named keeps CampaignLogo + "Anliegen von {displayName}"; anonymous shows no logo and the attribution from creatorSurveyQuoteAttribution with the first letter capitalised. Keep the aggregate checkbox and the revoke hint.
   f. Submit sends expectation, outcomes, outcomesNote (trimmed or null), quoteMode (null unless consent), anonymousLabel (trimmed or null, only when anonymous). EMPTY_ANSWERS gets the new fields.
   g. While in this file, fix the two existing brand spellings "Brief nach Berlin" to "Brief-nach-Berlin" (help-offer intro and donation line) and list them in Copy zur Freigabe.

8. CreatorSurveyCard.tsx: "Hast du 90 Sekunden für mich?" becomes "Hast du 1 Minute für mich?" (D-02 target).

9. Datenschutz, section 21 feedback paragraph (Sie-Form): extend "Gespeichert werden ..." to name: whether the number of letters met the expectation, which results were heard of (media report, political answer or decision) with an optional free text, and the quote mode. Replace "Ihren Satz zeige ich mit Logo und Namen der Kampagne nur nach Ihrer ausdrücklichen Freigabe." with a sentence saying the quote is shown only after explicit consent, either with logo and name of the campaign or anonymously with a description chosen by the creator (default "eine Initiative"). In the Rechtsgrundlage paragraph make lit. a cover "die Veröffentlichung des Zitats (mit Logo und Namen oder anonym)". Leave the Stand line.

10. Tests (write the behavior cases first, RED, then implement): creatorSurvey.test.ts (schema, normalize, toggleOutcome, attribution, consent re-stamp, answersChanged, a "migration 034" describe that reads the file and checks the three column names plus every slug of CREATOR_SURVEY_EXPECTATIONS, CREATOR_SURVEY_OUTCOMES, CREATOR_SURVEY_QUOTE_MODES as quoted literals, and a small repository describe passing a fake db client: status probe select includes quote_mode and returns "unavailable" on an error, getCampaignCreatedByFounder false on error / true on true); creatorSurveyAction.test.ts (fixtures with new fields, add getCampaignCreatedByFounder to the repository mock, assert createdByFounder reaches the mail params, consent without quoteMode -> code invalid); creatorSurveyAdminEmail.test.ts (founder line, expectation, outcomes + escaped note, the three consent variants, replaced old consent line).
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/creatorSurvey src/__tests__/campaignTransferAccess.test.ts && npx eslint src/lib/campaigns/creatorSurvey.ts src/lib/campaigns/creatorSurveyRepository.ts src/lib/actions/submitCreatorSurvey.ts src/lib/email/sendCreatorSurveyAdminEmail.ts "src/app/(site)/kampagne/verwalten/feedback/page.tsx" src/components/campaigns/CreatorSurveyForm.tsx src/components/campaigns/CreatorSurveyCard.tsx "src/app/(site)/datenschutz/page.tsx" && ! grep -n "$(printf '\342\200\224')" src/components/campaigns/CreatorSurveyForm.tsx src/components/campaigns/CreatorSurveyCard.tsx src/lib/campaigns/creatorSurvey.ts src/lib/email/sendCreatorSurveyAdminEmail.ts && grep -c "ended_notified_at" supabase/migrations/034_campaign_end_feedback.sql && grep -c "034_campaign_end_feedback" supabase/MIGRATION_STATUS.md</automated>
  </verify>
  <done>Migration 034 file exists (not applied) and MIGRATION_STATUS documents order 029 then 034; the form shows the three new questions, "etwa 1 Minute", named/anonymous consent with label and live preview; action, repository and admin mail carry every new field plus createdByFounder; the survey stays unavailable until 034 exists; all creatorSurvey suites and eslint pass; no em dashes in the touched copy files.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Abschluss-Mail fertig ausbauen, Skript-Ablauf --list/--preview-to-me/--note/--send, Admin-Hinweis beim Beenden, Previews</name>
  <files>web/src/lib/campaigns/creatorStatsView.ts, web/src/lib/campaigns/creatorStats.ts, web/src/lib/campaigns/endedMail.ts, web/src/lib/email/buildCampaignCreatorEmailHtml.ts, web/src/lib/email/sendCampaignCreatorEmail.ts, web/src/lib/email/sendCampaignEndedAdminNotice.ts, web/src/lib/actions/campaignEnd.ts, web/scripts/send-campaign-ended-mail.ts, web/src/__tests__/campaignEndedEmail.test.ts, web/src/__tests__/campaignEndedMailFlow.test.ts, web/src/__tests__/campaignEndActions.test.ts, .planning/todos/pending/2026-10-08-kampagnen-s4-danke-mail-zum-kampagnenende.md</files>
  <read_first>web/src/lib/campaigns/creatorStats.ts (whole file once), web/src/lib/actions/campaignEnd.ts, web/src/lib/actions/submitCreatorSurvey.ts (after() pattern), web/src/lib/email/sendCreatorSurveyAdminEmail.ts (soft apiKey guard pattern), web/src/__tests__/campaignEndActions.test.ts, web/src/__tests__/campaignCreatorStats.test.ts (imports only)</read_first>
  <behavior>
    - isAwaitingEndedMail: true only for status not blocked, ended per isCampaignEnded, endedNotifiedAt null, letterCount >= CREATOR_SURVEY_MIN_LETTERS_ENDED (10); false for 9 letters, for running campaigns, for already notified, for blocked
    - endedMailSendStat: returns {percent, responses} only when feedback.status is "ready" and sendRate.status is "shown" with responses >= CREATOR_STATS_MIN_RESPONSES; null for "collecting", "unavailable", "too_few"
    - resolveEndedMailSend: mode file and preview_to_me are always ok and never mark notified; mode send fails without a non-empty note, fails when the campaign is not ended or below 10 letters or blocked, fails when the survey is unavailable, fails when endedNotifiedAt is set unless the recipient is overridden (--to test send); markNotified is true only for a send without --to
    - Ended mail: note rendered in Caveat directly under the greeting (HTML-escaped, newlines to br); without note and preview true a dashed placeholder box "Dein persönlicher Absatz" appears; without note and preview false nothing appears; founder sentence only when createdByFounder; stats line only with a sendStat; exactly one big primary button (the feedback CTA); donation only as a small text link; preview subject starts with "[Vorschau] "
    - endCampaignAction: on success calls after() once and the callback sends sendCampaignEndedAdminNotice with slug, title, letterCount, creatorName; a rejected notice does not throw or change the result; failure paths never schedule it
  </behavior>
  <action>
1. Stats seam (needed because the script cannot import server-only modules, see context): create web/src/lib/campaigns/creatorStatsView.ts without `import "server-only"` and move into it, unchanged, everything from creatorStats.ts except the server-only import, the getServiceRoleClient import, loadReviewRows, loadSignalRows and getCampaignCreatorStats. creatorStats.ts keeps `import "server-only"`, imports what its loaders need from ./creatorStatsView, and adds `export * from "./creatorStatsView"` so every existing import of "@/lib/campaigns/creatorStats" keeps working. Pure move, no logic edits. Check `grep -rn "campaigns/creatorStats\"" web/src` callers still compile via the build.

2. New pure module web/src/lib/campaigns/endedMail.ts (no server-only, no Supabase import) with isAwaitingEndedMail, endedMailSendStat, resolveEndedMailSend per the behavior block (types: a candidate shape {status, letterCount, endsAt, endedNotifiedAt}; EndedMailSendStat {percent, responses}). Reuse CREATOR_SURVEY_MIN_LETTERS_ENDED from creatorSurvey.ts (mail threshold = survey threshold, per D-05/D-08) and CREATOR_STATS_MIN_RESPONSES from creatorStatsView.ts (per D-06a); verify kpi()'s own threshold while reading and keep the explicit responses guard anyway. Failure reasons are German one-liners for the CLI (e.g. "Ohne --note kein Versand. Erst --preview-to-me, dann --note.").

3. Ended mail (buildCampaignCreatorEmailHtml.ts), per D-06 and the frontend-design skill. Extend CampaignEndedEmailParams with note (string or null, optional), preview (boolean, optional), createdByFounder (boolean, optional), sendStat (EndedMailSendStat or null, optional). Address creators with "ihr" in the body (locked phrases D-04/D-06c use "ihr"). Order inside contentHtml:
   a. Greeting (unchanged logic).
   b. Personal paragraph on top (D-06d): note in Caveat (font already loaded in headHtml), about 22-24px, color #1D3557; or the preview-only dashed placeholder box with draft text "Dein persönlicher Absatz: 2-3 Sätze, kommen per --note hier rein."
   c. Thanks paragraph (D-06c) draft: "Eure Kampagne ist beendet. {N} Briefe sind darüber entstanden: So viele Menschen haben eure Argumente aufgegriffen und daraus ihren eigenen, persönlichen Brief geschrieben. Danke, dass ihr euch das getraut habt, obwohl Brief-nach-Berlin noch so klein ist." plus, only with createdByFounder (D-04), draft "Und danke, dass ihr mir vertraut habt, die Kampagne für euch aufzusetzen."
   d. Stats line only with sendStat (D-06a), draft "{percent} % der {responses} Unterstützer:innen, die geantwortet haben, haben ihren Brief abgeschickt." followed by a small text link "Alle Zahlen findet ihr auf eurer Verwaltungsseite." to actionUrl#creator-stats. The old big "Statistiken ansehen" box goes away (one big button only, D-06b).
   e. Referral paragraph directly above the feedback CTA (D-06b, Reichweite vor Spende), draft "Kennt ihr andere Initiativen oder Creator, für die so eine Briefkampagne passt? Erzählt ihnen davon, das hilft mir am meisten." with a link to `${APP_URL}/ngo-briefkampagne`.
   f. The Task-1 feedback box with the single big "1 Minute Feedback" button and the reply hint.
   g. Existing share box ("Erfolg auf den Socials teilen", its "Bild speichern" stays as the share box's own control) with intro draft "Wenn ihr mögt, teilt euren Erfolg auf Instagram, LinkedIn oder WhatsApp. Das Bild dafür ist schon fertig."
   h. Sign-off "Allerbeste Grüße aus Bremen" + Caveat "Thomas" (keep).
   i. Quiet donation (D-06b): replace the outline button row with one small grey 13px line, draft "Brief-nach-Berlin bleibt kostenlos. Wer mich unterstützen will, findet hier die Spendenseite." with the link on "Spendenseite" to DONATION_PROVIDER_URL.
   Note escaping: escapeHtml then replace newlines with br. Keep footer and footerNoteHtml.

4. sendCampaignCreatorEmail.ts: ended param becomes {count, note?, createdByFounder?, sendStat?, preview?}; pass them through; subject gets the prefix "[Vorschau] " when ended.preview is true. Tag and replyTo unchanged.

5. Script web/scripts/send-campaign-ended-mail.ts (per D-07, D-08, D-09; update the header usage comment for every flag):
   a. Flags: --list, --slug, --out, --to, --name, --note "<text>", --preview-to-me, --send. --preview-to-me and --send together -> usage error. --slug required except for --list. Usage errors (including running with no flags) print a usage line that names every flag and exit 1 BEFORE loadEnvLocal or any DB access (the verify step runs the script without flags).
   b. --list: select id, slug, title, creator_name, letter_count, status, ends_at, ended_notified_at, created_by_founder from campaigns (filters: ends_at not null and lte now, ended_notified_at is null, letter_count gte 10, status neq blocked), then filter again with isAwaitingEndedMail, sort by ends_at; print slug, title, letters, end date, founder flag and the next command `npx tsx scripts/send-campaign-ended-mail.ts --slug <slug> --preview-to-me`. If the select errors with a missing column, print "Migration 034 fehlt" and exit 1. Already ended NRV (ended_notified_at null) appears like any other (D-09).
   c. Campaign load: keep the base select; read created_by_founder and ended_notified_at in a separate select so the file preview still works before 034 (warn "Migration 034 fehlt: ohne Founder-Satz, ohne Versandschutz"; treat as not applied).
   d. Stats: query reviews for the slug with CREATOR_STATS_REVIEW_COLUMNS ordered by created_at desc (mirrors loadReviewRows), run buildCampaignCreatorStats({rows, signalRows: null, now, letterCount, ended: true}), take endedMailSendStat. Query error -> rows null -> no stats line, print a warning.
   e. Survey availability: select id, quote_mode from campaign_creator_surveys limit 0; error -> unavailable.
   f. Before any send call resolveEndedMailSend; on failure print the reason and exit 1.
   g. --preview-to-me: send via sendCampaignCreatorEmail with token "vorschau" (no token row created), recipient process.env.THOMAS_MAIL or FOUNDER_EMAIL, adminCopy false, ended.preview true, note if given. No DB writes. Print the recipient and that links in the preview do not work.
   h. --send: create the manage token exactly as today, send with adminCopy true unless --to, then when markNotified update campaigns set ended_notified_at = now ISO where id = campaign id and ended_notified_at is null; print the result. A failed update after a successful send prints a loud warning with the SQL to run by hand.
   i. File preview (no send flags): unchanged behavior plus note, preview placeholder, founder flag and stats.

6. Admin notice (D-08): new web/src/lib/email/sendCampaignEndedAdminNotice.ts modelled on sendCreatorSurveyAdminEmail.ts (soft apiKey guard, never throws, to THOMAS_MAIL or CONTACT.email, tag campaign-ended-admin, subject "[BnB Kampagne beendet] {slug}"). Exports buildCampaignEndedAdminNoticeHtml({slug, title, letterCount, creatorName}) and sendCampaignEndedAdminNotice. Body (internal, escaped): campaign link and slug, letter count, creator name or "ohne Namen"; with 10+ letters the line "Abschluss-Mail vorbereiten:" and the command `cd web && npx tsx scripts/send-campaign-ended-mail.ts --slug {slug} --preview-to-me`; below 10 the line "Unter 10 Briefen: keine Abschluss-Mail vorgesehen." No creator email address in the notice. In campaignEnd.ts endCampaignAction, after endCampaignNow succeeds and revalidation, schedule after(async () => {...}) that calls the notice in try/catch and logs failures only (pattern from submitCreatorSurveyAction). updateCampaignEndDateAction is unchanged: expired end dates are found via --list (D-08).

7. Tests (behavior first): new campaignEndedMailFlow.test.ts for isAwaitingEndedMail, endedMailSendStat (build views via buildCampaignCreatorStats from creatorStatsView with 9 vs 10 answered rows), resolveEndedMailSend incl. the idempotency rule; campaignEndedEmail.test.ts rewritten to the new draft copy: note escaping, placeholder only in preview, founder sentence toggle, stats line toggle, referral link to /ngo-briefkampagne above the feedback button, exactly one occurrence of the filled primary button style for the feedback CTA outside the share box, no outline "Unterstützen" button, donation link present, preview subject prefix in the Brevo-mocked send; campaignEndActions.test.ts mocks "@/lib/email/sendCampaignEndedAdminNotice", grabs the after() callback on success and asserts the notice call, asserts no after() on failure paths, and asserts a rejected notice is swallowed.

8. Previews (no DB, no sends): from web/ render four variants with `npx tsx -e` calling buildCampaignCreatorEmailHtml (fixture slug unterschrift-ist-kein-dienstvergehen, 90 letters, feedbackUrl via creatorSurveyUrl("vorschau")) into .planning/quick/261014-hhs-kampagnen-abschluss-mail-mit-1-minute-fe/preview/: ended-preview-placeholder.html (preview true, no note), ended-with-note.html (note, founder false, no stats), ended-founder-stats.html (note, founder true, sendStat {percent 78, responses 23}), admin-notice.html. Screenshot at 640 and 375 px if a headless browser tool is available; otherwise say so in the SUMMARY.

9. S4 todo: add "## Stand 2026-10-14 (quick-261014-hhs)" with: decisions D-01..D-09 in one line each, what is built (files), manual send flow (--list, --preview-to-me, Thomas sends 2-3 sentences, --note, second preview, --send after OK, ended_notified_at), that a cron stays out by decision (D-07 manual), open steps (apply 029 then 034, set created_by_founder in the dashboard, browser check of the form at 375 px after the migrations). Mark superseded bullets in the older "Stand"/"schönere Version" sections as erledigt or überholt; keep the file in pending.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/campaignEnd src/__tests__/campaignCreatorStats.test.ts src/__tests__/creatorSurvey && npx eslint src/lib/campaigns/creatorStatsView.ts src/lib/campaigns/creatorStats.ts src/lib/campaigns/endedMail.ts src/lib/email/buildCampaignCreatorEmailHtml.ts src/lib/email/sendCampaignCreatorEmail.ts src/lib/email/sendCampaignEndedAdminNotice.ts src/lib/actions/campaignEnd.ts scripts/send-campaign-ended-mail.ts && ! grep -n "$(printf '\342\200\224')" src/lib/email/buildCampaignCreatorEmailHtml.ts src/lib/email/sendCampaignEndedAdminNotice.ts && npx tsx scripts/send-campaign-ended-mail.ts 2>&1 | grep -c -- "--list" && npm run build</automated>
  </verify>
  <done>Ended mail carries the personal paragraph slot, big thanks, optional founder sentence, honest stats line from 10 answers, referral above the single "1 Minute Feedback" button and a quiet donation link; the script lists, previews to Thomas, inserts --note, guards --send and sets ended_notified_at only after a real creator send; endCampaignAction notifies Thomas via after(); four preview files exist; S4 todo updated; jest suites, eslint and npm run build pass.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| creator browser -> submitCreatorSurveyAction | untrusted survey input (new enums, free text, anonymous label) crosses here |
| Thomas CLI -> mail HTML | --note text is inserted into an email sent to a third party |
| server -> Brevo -> creator inbox | real outbound mail with a fresh manage token |
| app -> Supabase (service role) | new campaigns columns and survey columns, migration not yet applied |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-hhs-01 | Tampering | creatorSurveyInputSchema / migration 034 | medium | mitigate | z.enum allowlists, length caps (300 note, 80 label), exclusivity refine; mirrored DB CHECKs in 034 so a bypassed client still fails |
| T-hhs-02 | Repudiation | quote consent scope | medium | mitigate | consentQuote without explicit quoteMode is rejected (no silent default to named); consent_quote_at re-stamped when mode or label changes; DB CHECK consent_quote <-> quote_mode |
| T-hhs-03 | Information disclosure / injection | --note, outcomes note, anonymous label in HTML mails | medium | mitigate | escapeHtml / esc on every interpolated value, newline-to-br after escaping; tests assert escaping |
| T-hhs-04 | Elevation of privilege | manage token in ended mail | high | mitigate | token created only on --send (existing hashed-token pattern); --preview-to-me uses the placeholder token "vorschau" and writes nothing; feedback deep link reuses the whitelisted ziel=feedback jump (existing tests) |
| T-hhs-05 | Denial of service (self-inflicted) | app campaign queries before 034 | high | mitigate | created_by_founder is read only through a tolerant repository function and the manual script; repository.ts main select untouched; survey status probe keeps the feature dark |
| T-hhs-06 | Spoofing / duplicate send | send-campaign-ended-mail --send | medium | mitigate | resolveEndedMailSend: note required, ended + 10 letters + survey available required, refuses when ended_notified_at is set; conditional update "ended_notified_at is null" |
| T-hhs-07 | Information disclosure | endCampaignAction admin notice | low | mitigate | notice goes only to THOMAS_MAIL/CONTACT, contains no creator email address, runs in after() and swallows errors |
| T-hhs-SC | Tampering | npm/pip/cargo installs | high | accept | no new packages in this plan; any install attempt is out of scope and must stop for Thomas |
</threat_model>

<verification>
From web/:
1. `npx jest src/__tests__/creatorSurvey src/__tests__/campaignEnd src/__tests__/campaignCreatorStats.test.ts src/__tests__/campaignTransferAccess.test.ts` passes.
2. eslint on every changed TS/TSX file passes; `npm run build` passes (type gate; tsc --noEmit has known unrelated errors).
3. Preview HTML files exist in .planning/quick/261014-hhs-kampagnen-abschluss-mail-mit-1-minute-fe/preview/ (placeholder, with note, founder + stats, admin notice); screenshots at 640/375 if a browser tool was available.
4. No em dashes in touched copy files (printf-based grep in the task verifies).
5. Not verifiable by the executor (hand to Thomas, list in SUMMARY Open Items): applying 029 then 034; browser check of the form at 375 px (needs the tables); --preview-to-me mail to Thomas; any real --send.
</verification>

<success_criteria>
- Every locked decision D-01..D-09 is implemented or, where it needs Thomas (migration apply, dashboard flag, writing the personal note, sending), documented as his next step.
- Survey: ended 10+ eligible, three new questions, "etwa 1 Minute", named/anonymous quote consent with label and live preview, admin mail complete incl. founder flag.
- Mail: personal paragraph slot, thanks incl. "noch so klein", founder sentence, stats from 10 answers, referral above one big "1 Minute Feedback" button, quiet donation link.
- Script: --list, --preview-to-me, --note, guarded --send with ended_notified_at idempotency.
- endCampaignAction: admin notice to Thomas, no creator send.
- Nothing applied, nothing sent, nothing pushed.
- SUMMARY contains "Copy zur Freigabe" with every new/changed user-facing string (form, card, mail, admin mails, Datenschutz, CLI messages Thomas reads) and an Open Items list: (1) apply 029 then 034 after OK, (2) set created_by_founder for the campaigns Thomas built, (3) run --list, then per campaign --preview-to-me, send Thomas' 2-3 sentences via --note (for NRV phrased as a Nachtrag, D-09), second preview, --send after OK, (4) browser check of the form at 375 px, (5) question for Thomas: should section 21 also mention the one-time closing mail to creators (not changed here, not in the locked plan), (6) push/deploy.
</success_criteria>

<output>
Create `.planning/quick/261014-hhs-kampagnen-abschluss-mail-mit-1-minute-fe/261014-hhs-SUMMARY.md` when done
</output>

---
phase: quick-261027-hjb
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/lib/feedback/ageGroup.ts
  - web/src/lib/internalStats/aggregate.ts
  - web/src/lib/internalStats/getInternalStats.ts
  - web/src/app/stats/page.tsx
  - web/src/__tests__/internalStats.test.ts
  - web/supabase/migrations/037_reviews_age_group_split.sql
  - web/supabase/MIGRATION_STATUS.md
  - web/src/app/(site)/feedback/FeedbackForm.tsx
  - web/src/__tests__/ageGroup.test.ts
autonomous: true
requirements: [QUICK-261027-hjb]

estimate:
  tokens: 70000
  raw_tokens: 70000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "The feedback form offers exactly six age options in this order: unter 20, 20 bis 29, 30 bis 44, 45 bis 59, 60 bis 74, 75 oder älter, and submitReview accepts exactly these six values"
    - "Migration 037 moves all existing rows of the old combined youngest bucket to 20_29 and re-adds reviews_age_group_check with exactly under_20, 20_29, 30_44, 45_59, 60_74, 75_plus"
    - "MIGRATION_STATUS.md tells Thomas to run 037 in the SQL Editor BEFORE deploying"
    - "/stats has its own section 'Alter', reachable from the SectionNav, whose percentages use only reviews with an age answer as base"
    - "/stats shows 'X % geben ihr Alter an (seit <Datum>)' with n, where the base counts only filled-in reviews from the first age answer onward"
    - "The age section respects the page filters (time range, source, Bundesland) exactly like the other review sections and shows baseline marks when a narrowing filter is active"
    - "No reference to the old combined youngest bucket remains in web/src outside __tests__"
  artifacts:
    - path: "web/supabase/migrations/037_reviews_age_group_split.sql"
      provides: "Constraint swap plus legacy row rewrite"
      contains: "reviews_age_group_check"
    - path: "web/src/lib/feedback/ageGroup.ts"
      provides: "Six age group values and German labels"
      contains: "under_20"
    - path: "web/src/lib/internalStats/aggregate.ts"
      provides: "AgeGroupStats on InternalStats (distribution, answerCount, answeredSince, rateBase, rateAnswerCount, ratePercent)"
      contains: "ageGroups"
    - path: "web/src/app/stats/page.tsx"
      provides: "Section id=alter with distribution bars and answer rate"
      contains: "id=\"alter\""
    - path: "web/src/__tests__/ageGroup.test.ts"
      provides: "Value list and migration file assertions"
  key_links:
    - from: "web/src/lib/internalStats/getInternalStats.ts"
      to: "web/src/lib/internalStats/aggregate.ts"
      via: "reviews select string includes age_group, rows flow into aggregateInternalStats"
      pattern: "age_group"
    - from: "web/src/app/stats/page.tsx"
      to: "web/src/lib/internalStats/aggregate.ts"
      via: "page reads stats.ageGroups and baseline?.ageGroups"
      pattern: "ageGroups"
    - from: "web/src/lib/feedback/ageGroup.ts"
      to: "web/supabase/migrations/037_reviews_age_group_split.sql"
      via: "AGE_GROUP_VALUES must equal the CHECK list (asserted in ageGroup.test.ts); submitReview uses z.enum(AGE_GROUP_VALUES)"
      pattern: "AGE_GROUP_VALUES"
---

<objective>
Split the youngest review age bucket into "unter 20" and "20 bis 29" (form, server validation, DB constraint plus one-time rewrite of legacy rows) and add an own "Alter" section to the internal /stats page with the age distribution and the age answer rate.

Purpose: Thomas wants to see who writes (especially young people after the Schule/Jung push) and how many reviewers give their age at all.
Output: migration 037 (not applied, Thomas runs it), updated age values, age aggregate in internalStats, new /stats section, Jest tests.

Data path decision (extend, don't copy): /stats already loads every review row through `fetchAllRows` in `getInternalStats.ts` and aggregates in JS in `aggregateInternalStats`, applying time range, source and Bundesland filters there. The age stats reuse that exact path: add `age_group` to the existing reviews select and count it inside the existing filtered-review loop. No RPC, no new SQL function, so no new grants are needed.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@web/AGENTS.md
@web/src/lib/feedback/ageGroup.ts
@web/src/lib/internalStats/getInternalStats.ts
@web/supabase/migrations/028_reviews_age_group.sql
@web/supabase/migrations/035_letter_outcomes_reply_feeling.sql
@web/supabase/MIGRATION_STATUS.md

Read by line range only (large files):
- web/src/lib/internalStats/aggregate.ts: types at lines 12-22 and 117-197, guards at 461-473, main loop at 493-710.
- web/src/app/stats/page.tsx: helpers 86-106 (formatDate), 164-272 (SectionHeading, EmptyState, BasisNote, SECTION_LINKS, Section, SubHeading), 472-543 (SurveyDistributionBars and option arrays), 864-900 (page setup), 1469-1610 (Wirkung section as the layout model, Definitionen section).
- web/src/__tests__/internalStats.test.ts: fixture `row()` at lines 1-16 and the political activation test from line 115 as a style model.
- web/src/__tests__/politicalActivation.test.ts lines 85-110: pattern for asserting migration file content via readFileSync(join(process.cwd(), ...)).
- web/src/app/(site)/feedback/FeedbackForm.tsx lines 413-436 (age fieldset).

Already checked, no edit needed: `web/src/lib/actions/submitReview.ts` (uses `z.enum(AGE_GROUP_VALUES)`, picks up the new values via import), `web/src/app/(site)/feedback/PrivacyDisclosure.tsx` and `web/src/app/(site)/datenschutz/page.tsx` (generic "Altersgruppe" copy, example "45 bis 59" stays valid). No existing test references the old bucket. Do not touch `.claude/worktrees/`.

Working tree is dirty with Thomas's unrelated WIP (`.planning/ROADMAP.md`, `.planning/STATE.md`, `web/src/__tests__/campaignCreatorStats.test.ts`, `web/src/components/SocialFollow.tsx`, `web/src/components/campaigns/CampaignReferralCard.tsx`, `web/src/lib/config.ts`, `web/src/lib/contact.ts`, untracked files). Never modify, stage or revert those. Stage only the files in `files_modified`, by explicit path; never `git add -A` or `git add .`. No push. No writes to the production database (Thomas applies the migration himself).

If Jest crashes with an "alias" error or git reports invalid objects, the cause is usually iCloud-evicted files: run `brctl download <file>` for the affected file and retry.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Tracer, new age values flow from the review rows into a /stats "Alter" section with the distribution</name>
  <files>web/src/lib/feedback/ageGroup.ts, web/src/lib/internalStats/aggregate.ts, web/src/lib/internalStats/getInternalStats.ts, web/src/app/stats/page.tsx, web/src/__tests__/internalStats.test.ts</files>
  <behavior>
    - Distribution counts only rows whose age_group is one of the six AGE_GROUP_VALUES; rows with null, unknown or legacy values are not counted and are not part of answerCount (the percent base).
    - Example: filtered rows with ages under_20, under_20, 20_29, null, null and one legacy value give distribution under_20=2, 20_29=1, all others 0, answerCount=3.
    - Filters apply: with timeRange 30 and fetchedAt 2026-08-30T12:00:00Z, an age answer from 2026-07-01 is not in distribution or answerCount.
    - Empty input gives all six distribution keys at 0 and answerCount 0.
  </behavior>
  <action>
    Write the new tests in `web/src/__tests__/internalStats.test.ts` first (new `describe("age groups", ...)` block reusing the existing `row()` fixture with `age_group` overrides) and watch them fail, then implement:

    1. `web/src/lib/feedback/ageGroup.ts`: AGE_GROUP_VALUES becomes exactly `under_20`, `20_29`, `30_44`, `45_59`, `60_74`, `75_plus` in this order. Labels: `under_20` "unter 20", `20_29` "20 bis 29", the other four unchanged. Remove the old combined youngest key completely and do not leave a comment about it. FeedbackForm and submitReview pick the values up through their existing imports.
    2. `web/src/lib/internalStats/aggregate.ts`: add `age_group?: string | null` to InternalReviewRow (optional like `letter_id`, so `creatorStatsView.ts` toInternalRow and other fixtures keep compiling). Add an exported type `AgeGroupStats` with `distribution: Record<AgeGroup, number>` and `answerCount: number`, and add `ageGroups: AgeGroupStats` to InternalStats. Add a local guard `isAgeGroup` next to `isPoliticalSelfEfficacy`, using AGE_GROUP_VALUES from `@/lib/feedback/ageGroup`. Initialise the distribution with all six keys at 0 and count valid values inside the existing `for (const row of filteredReviews)` loop, so time range, source and Bundesland filters apply automatically. Return `ageGroups` from aggregateInternalStats.
    3. `web/src/lib/internalStats/getInternalStats.ts`: append `age_group` to the existing reviews select string. Do not add a new query or RPC.
    4. `web/src/app/stats/page.tsx`: add `{ id: "alter", label: "Alter" }` to SECTION_LINKS between "wirkung" and "definitionen", and a new `<Section id="alter">` between the Wirkung and Definitionen sections. SectionHeading: eyebrow "Wer schreibt", title "Alter", detail "Freiwillige Angabe im ausgefüllten Feedback. Die Prozente zählen nur Bewertungen mit Altersangabe." Inside, a `grid gap-8 lg:grid-cols-2 lg:gap-12` wrapper (same as Wirkung) with one `<article>`: SubHeading "Altersverteilung" with detail "„Wie alt bist du?“ · nur Bewertungen mit Angabe", then EmptyState "Noch keine Altersangaben." when answerCount is 0, else SurveyDistributionBars with `values={stats.ageGroups.distribution}`, `total={stats.ageGroups.answerCount}`, `options` built from AGE_GROUP_VALUES and AGE_GROUP_LABELS (module-level const like `powerlessnessOptions`), `color="#2D6A4F"`, `mode`, and `baselineValues`/`baselineTotal` from `baseline?.ageGroups`. Close the article with BasisNote "Basis: N Bewertungen mit Altersangabe".

    UI: follow the frontend-design skill conventions scoped to this page, which here means reusing the page's own Section, SectionHeading, SubHeading, SurveyDistributionBars, EmptyState and BasisNote and its existing colors; no new components, classes or dependencies. Copy is German, no em dashes, no "wir".
  </action>
  <verify>
    <automated>cd web && npx jest internalStats && npx tsc --noEmit && npx eslint src/app/stats/page.tsx src/lib/internalStats/aggregate.ts src/lib/internalStats/getInternalStats.ts src/lib/feedback/ageGroup.ts</automated>
  </verify>
  <done>New age-group tests pass alongside the existing internalStats suites; tsc and eslint are clean; /stats renders a SectionNav link "Alter" and a section with the age distribution whose base is answerCount.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Answer rate "X % geben ihr Alter an (seit Datum)" counted from the first age answer onward</name>
  <files>web/src/lib/internalStats/aggregate.ts, web/src/app/stats/page.tsx, web/src/__tests__/internalStats.test.ts</files>
  <behavior>
    - answeredSince is the earliest created_at among ALL review rows passed to aggregateInternalStats (before any filter) that carry a valid age group; null when there is none. It is the global start of the question, so the baseline and every filter share it.
    - rateBase counts filtered reviews with full_feedback_submitted true and created_at at or after answeredSince. Quick ratings never carry an age (submitReview only writes age_group in mode "full"), so they stay out of the base, same convention as powerlessnessNoAnswerCount. Rows with created_at null stay out of the base.
    - rateAnswerCount counts rows of rateBase with a valid age group; ratePercent is rounded to one decimal via the existing roundOne, 0 when rateBase is 0.
    - Case "all": rows r0 2026-06-01 full no age (before start), r1 2026-07-01 full age 45_59, r2 2026-08-10 full no age, r3 2026-08-12 full age under_20, r4 2026-08-15 quick rating no age. Expected answeredSince is r1's created_at, rateBase 3, rateAnswerCount 2, ratePercent 66.7.
    - Case timeRange 30 with fetchedAt 2026-08-30T12:00:00Z on the same rows: answeredSince still r1's created_at, rateBase 2, rateAnswerCount 1, ratePercent 50.
    - Empty input: answeredSince null, rateBase 0, rateAnswerCount 0, ratePercent 0.
  </behavior>
  <action>
    Add the test cases above to the "age groups" describe block first, then implement:

    1. `web/src/lib/internalStats/aggregate.ts`: extend AgeGroupStats with `answeredSince: string | null`, `rateBase: number`, `rateAnswerCount: number`, `ratePercent: number`. Before the filter loop, find answeredSince by scanning the unfiltered `rows` argument (compare with Date.parse, keep the original ISO string). In the filtered-review loop, count rateBase and rateAnswerCount as defined in the behavior block. Compute ratePercent with roundOne after the loop.
    2. `web/src/app/stats/page.tsx`, inside the "alter" section grid: add a second `<article>` before the distribution article. SubHeading "Antwortquote" with detail "Ab der ersten Altersangabe, damit ältere Bewertungen ohne die Frage nicht mitzählen." EmptyState "Noch keine Altersangaben." when answeredSince is null, else ValueEmphasis with `mode`, `value={stats.ageGroups.rateAnswerCount}`, `total={stats.ageGroups.rateBase}`, `unit="ausgefüllte Bewertungen"`, followed by a caption paragraph in the same style as the Wirkung caption: "geben ihr Alter an (seit {formatDate(answeredSince)})". BasisNote "Basis: N ausgefüllte Bewertungen seit der ersten Altersangabe am {Datum} · die Filter oben wirken hier".
    3. Same file, Definitionen section: add a Definition titled "Altersangabe" with body "Freiwillig im ausgefüllten Feedback, erste Angabe am {Datum}. Die Verteilung zählt nur Bewertungen mit Angabe. Die Antwortquote zählt ausgefüllte Bewertungen ab diesem Tag; ältere Bewertungen ohne die Frage bleiben außen vor." Fall back to "noch keine Angabe" for the date when answeredSince is null.

    German copy, no em dashes, no "wir". Reuse ValueEmphasis and formatDate as they exist; no new helpers in view.ts.
  </action>
  <verify>
    <automated>cd web && npx jest internalStats && npx tsc --noEmit && npx eslint src/app/stats/page.tsx src/lib/internalStats/aggregate.ts</automated>
  </verify>
  <done>Rate tests (all, 30-day filter, empty) pass; the Alter section shows the answer rate with n and the start date next to the distribution; the Definitionen section explains both bases.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Migration 037, migration status row, six-option form grid and value/migration tests</name>
  <files>web/supabase/migrations/037_reviews_age_group_split.sql, web/supabase/MIGRATION_STATUS.md, web/src/app/(site)/feedback/FeedbackForm.tsx, web/src/__tests__/ageGroup.test.ts</files>
  <behavior>
    - AGE_GROUP_VALUES equals exactly under_20, 20_29, 30_44, 45_59, 60_74, 75_plus; every value has a non-empty label; under_20 is "unter 20" and 20_29 is "20 bis 29".
    - Migration 037 wraps everything in BEGIN/COMMIT, drops reviews_age_group_check with IF EXISTS, runs the UPDATE to 20_29 before the ADD CONSTRAINT, and the text after "ADD CONSTRAINT reviews_age_group_check" contains every AGE_GROUP_VALUES value quoted and not the legacy value.
  </behavior>
  <action>
<!-- planner-discipline-allow: under_30 -->
    Write `web/src/__tests__/ageGroup.test.ts` first (plain .ts, Jest only runs *.test.ts; no Mistral import involved). Read the migration with readFileSync(join(process.cwd(), "supabase/migrations/037_reviews_age_group_split.sql"), "utf8") as in politicalActivation.test.ts. Assert the behavior above, including the order check (index of the UPDATE is lower than index of the ADD CONSTRAINT) and the region-scoped check on the substring after the ADD CONSTRAINT.

    1. `web/supabase/migrations/037_reviews_age_group_split.sql`, style of 028 and 035: a two-line header comment (Quick 261027-hjb, youngest bucket split into under_20 and 20_29; per Thomas's decision every existing row of the old bucket becomes 20_29 because no pupils use the app yet). Then BEGIN; ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_age_group_check; UPDATE public.reviews SET age_group = '20_29' WHERE age_group = 'under_30'; ALTER TABLE public.reviews ADD CONSTRAINT reviews_age_group_check CHECK with age_group IS NULL OR age_group IN the six values in AGE_GROUP_VALUES order; COMMIT. No GRANT or REVOKE: no new table or function, and the column revokes from 028 stay in effect.
    2. `web/supabase/MIGRATION_STATUS.md`: add a row after the 036 row: migration `037_reviews_age_group_split.sql`, status "Not yet applied", evidence "Thomas runs it in the Supabase SQL Editor BEFORE deploying, because the form sends under_20/20_29, which the old constraint rejects. Deploy right after: until the deploy is live the old form still offers „unter 30“, which the new constraint rejects. Not run by any agent; constraint not independently verified."
    3. `web/src/app/(site)/feedback/FeedbackForm.tsx`, age fieldset only (around lines 426-434): drop the `wide` prop from the age SurveyChoice and the now unused `index` map parameter, so six options fill three full rows of the existing two-column grid. Leave the self-efficacy grid and its `wide` untouched.
  </action>
  <verify>
    <automated>cd web && npx jest ageGroup internalStats && npx tsc --noEmit && npx eslint "src/app/(site)/feedback/FeedbackForm.tsx" src/__tests__/ageGroup.test.ts && cd .. && ! grep -rn "under_30" web/src --exclude-dir=__tests__</automated>
  </verify>
  <done>ageGroup tests pass; migration 037 and the status row exist; the form shows six options in three full rows; no legacy bucket reference remains in web/src outside __tests__.</done>
  <reversibility rating="reversible">The executor only writes the SQL file; the one-way production UPDATE is Thomas's own decision and manual step in the SQL Editor.</reversibility>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| browser → submitReview server action | untrusted ageGroup value crosses here |
| /stats page → Supabase service role | internal page reads review rows with the service role key |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-hjb-01 | I | /stats "Alter" section | low | mitigate | Only aggregate counts are rendered; the page keeps its INTERNAL_STATS_PASSWORD cookie gate (isInternalStatsCookieValid); 037 grants nothing, the 028 column revokes on age_group for anon/authenticated/PUBLIC stay in effect. |
| T-hjb-02 | T | submitReview ageGroup input | low | mitigate | Server-side z.enum(AGE_GROUP_VALUES) plus DB CHECK with the same six values; ageGroup.test.ts asserts the migration list matches AGE_GROUP_VALUES. |
| T-hjb-03 | D | Deploy window between migration and deploy | medium | mitigate | MIGRATION_STATUS row: run 037 before deploying and deploy right after; only full reviews with the old youngest option fail in that short window, other answers are unaffected. |
| T-hjb-04 | T | One-way rewrite of legacy rows in 037 | low | accept | Thomas decided all legacy rows become 20_29; BEGIN/COMMIT so the constraint is never missing; agents do not run it. |
| T-hjb-SC | Tampering | npm/pip/cargo installs | high | accept | No package installs in this plan; no new dependencies allowed. |
</threat_model>

<verification>
- `cd web && npx jest ageGroup internalStats` green.
- `cd web && npx jest` full suite: report any failure in `campaignCreatorStats.test.ts` or other files touched by Thomas's WIP as unrelated instead of fixing it.
- `cd web && npx tsc --noEmit` and `npm run lint` clean.
- Copy check on the new /stats strings and the migration status row: no em dash, no "wir".
- Optional manual check for Thomas after migration and deploy: /stats shows the "Alter" link and section; time range filter changes the counts; the answer rate date matches the first age answer.
</verification>

<success_criteria>
- Six age values everywhere in app code, form grid without a gap.
- Migration 037 present, not applied, MIGRATION_STATUS row tells Thomas to run it before deploying.
- /stats "Alter" section with distribution (base: reviews with age) and answer rate since the first age answer with n, respecting filters and baseline.
- Tests for the aggregation (base excludes null, rate from first answer date, filter) and for the values plus migration pass.
- Commit stages only the nine paths in files_modified by explicit path; no push.
</success_criteria>

<output>
Create `.planning/quick/261027-hjb-altersgruppen-in-reviews-neu-aufteilen-u/261027-hjb-SUMMARY.md` when done
</output>

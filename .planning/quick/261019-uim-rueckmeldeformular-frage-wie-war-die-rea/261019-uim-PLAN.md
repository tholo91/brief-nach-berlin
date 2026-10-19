---
phase: quick-261019-uim
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/supabase/migrations/035_letter_outcomes_reply_feeling.sql
  - web/supabase/MIGRATION_STATUS.md
  - web/src/lib/rueckmeldung/schema.ts
  - web/src/lib/actions/submitOutcome.ts
  - web/src/app/(site)/rueckmeldung/RueckmeldungForm.tsx
  - web/src/__tests__/outcomeAction.test.ts
  - web/src/lib/internalStats/outcomes.ts
  - web/src/app/stats/page.tsx
  - web/src/__tests__/internalStatsOutcomes.test.ts
autonomous: true
requirements: [QUICK-261019-uim]

estimate:
  tokens: 70000
  raw_tokens: 70000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "A respondent whose sent letter got a reply sees 'Wie war die Reaktion für dich?' directly after 'Wurde auf dein Anliegen eingegangen?' and cannot finish the form without answering it"
    - "Respondents without a reply (letter not sent, or 'Noch nichts') never see the question and never store a reply_feeling value, also not via progress saves"
    - "submitOutcomeAction rejects a full submit with a reply but no replyFeeling, rejects replyFeeling without a reply, and sends replyFeeling null to the RPC whenever there is no reply"
    - "Migration 035 adds a nullable reply_feeling column with a value CHECK and a needs-reply CHECK, and submit_letter_outcome writes it; existing rows stay valid"
    - "/stats shows the reply_feeling distribution (base = non-null answers only), one line per reply_addressed value with total > 0, and the hint that the question exists since 19.10.2026"
  artifacts:
    - path: web/supabase/migrations/035_letter_outcomes_reply_feeling.sql
      provides: "reply_feeling column, two CHECK constraints, submit_letter_outcome with reply_feeling"
    - path: web/src/lib/rueckmeldung/schema.ts
      provides: "REPLY_FEELING_VALUES, outcomeAnswersSchema.replyFeeling"
    - path: web/src/lib/internalStats/outcomes.ts
      provides: "replyFeelingCounts, replyFeelingBase, feelingByAddressed, OUTCOME_LABELS.replyFeeling"
  key_links:
    - from: "web/src/app/(site)/rueckmeldung/RueckmeldungForm.tsx"
      to: "web/src/lib/actions/submitOutcome.ts"
      via: "answers.replyFeeling in submitOutcomeAction payload"
    - from: "web/src/lib/actions/submitOutcome.ts"
      to: "web/supabase/migrations/035_letter_outcomes_reply_feeling.sql"
      via: "p_answers.replyFeeling read by p_answers->>'replyFeeling'"
    - from: "web/src/lib/internalStats/outcomes.ts"
      to: "web/src/app/stats/page.tsx"
      via: "OUTCOME_ROW_COLUMNS includes reply_feeling; OutcomeRoundStats fields rendered in OutcomeRoundBlock"
---

<objective>
Add the required follow-up question "Wie war die Reaktion für dich?" to the Rückmeldeformular, shown only when a reaction came, stored in a new nullable column `letter_outcomes.reply_feeling`, validated server-side, and shown on /stats. Spec is locked by Thomas; do not re-scope.

Purpose: learn how people experience the reply they got, separately from how concrete it was.
Output: migration 035 (not applied), schema/action/form changes, stats aggregation and page block, extended Jest tests.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@web/AGENTS.md
@web/supabase/migrations/033_letter_outcomes.sql
@web/src/lib/rueckmeldung/schema.ts
@web/src/lib/actions/submitOutcome.ts

Answer values (DB key and exact German label, same labels in form and stats):
- positive_surprise: "Positiv überrascht"
- glad_someone_answered: "Hatte mehr erwartet, finde es aber gut, dass sich jemand gemeldet hat"
- as_expected: "Ungefähr so, wie ich es erwartet hatte"
- disappointing: "Eher enttäuschend"

House rules for the executor:
- Worktree is dirty from other sessions (`.gitignore`, `.planning/research/2026-10-14-mdep-kampagnen-europaabgeordnete.md`, `web/*.jsonl`). Stage only the files listed in `files_modified` by explicit path. Never `git add .` or `git add -A`.
- Do not run the migration against any database. Do not push.
- New user-facing copy: German, no em dash and no en dash used as Gedankenstrich, first person singular, plain wording. Datenschutz page stays unchanged (it already covers "persönliches Erleben").
- Per Thomas's UI rule, invoke the `frontend-design:frontend-design` skill before editing `RueckmeldungForm.tsx` and `stats/page.tsx`. Here it only guards consistency: reuse the existing `Question`, `Choices`, `SurveyDistributionBars` components and existing Tailwind classes, no new components or styles.
- `web/src/__tests__/rueckmeldungPage.test.ts` only server-renders the entry/consent state and does not cover the question flow, so it gets no changes; it must still pass.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: reply_feeling end to end on the write path (migration, schema, action, form, action tests)</name>
  <files>web/supabase/migrations/035_letter_outcomes_reply_feeling.sql, web/supabase/MIGRATION_STATUS.md, web/src/lib/rueckmeldung/schema.ts, web/src/lib/actions/submitOutcome.ts, web/src/app/(site)/rueckmeldung/RueckmeldungForm.tsx, web/src/__tests__/outcomeAction.test.ts</files>
  <behavior>
    - full submit, letter sent, replyChannels ["email"], replyAddressed "partly", replyFeeling null: returns error "validation" with message "Bitte beantworte noch, wie die Reaktion für dich war.", rpc not called
    - full submit, replyChannels ["none"], replyFeeling "disappointing": validation error, rpc not called
    - full submit, letterSent "not_sent" with notSentReason "no_time", replyFeeling "as_expected": validation error, rpc not called
    - full submit with reply and replyFeeling "glad_someone_answered": success, rpc p_answers contains replyFeeling "glad_someone_answered"
    - progress save with letterSent "not_sent" and replyFeeling "positive_surprise": rpc p_answers.replyFeeling is null
    - progress save with letterSent "handwritten", replyChannels ["none"], replyFeeling "positive_surprise": rpc p_answers.replyFeeling is null
    - unknown value replyFeeling "great": validation error from zod, rpc not called
  </behavior>
  <action>
1. New file `web/supabase/migrations/035_letter_outcomes_reply_feeling.sql` (034 is taken by `034_campaign_end_feedback.sql`), wrapped in BEGIN; ... COMMIT; like 033:
   a. `ALTER TABLE public.letter_outcomes ADD COLUMN IF NOT EXISTS reply_feeling text;` (nullable, no default).
   b. Named constraint `letter_outcomes_reply_feeling_allowed`: `DROP CONSTRAINT IF EXISTS` first, then `ADD CONSTRAINT ... CHECK (reply_feeling IS NULL OR reply_feeling IN ('positive_surprise','glad_someone_answered','as_expected','disappointing'))`. Named so the file is re-runnable (an inline CHECK on ADD COLUMN IF NOT EXISTS would be skipped silently on re-run).
   c. Named constraint `letter_outcomes_reply_feeling_needs_reply`, same drop-then-add pattern: `CHECK (reply_feeling IS NULL OR (letter_sent IS DISTINCT FROM 'not_sent' AND cardinality(reply_channels) > 0 AND NOT ('none' = ANY(reply_channels))))`.
   d. Do NOT touch `letter_outcomes_completed_branch`: older completed rows with a reply have no reply_feeling and must stay valid.
   e. `CREATE OR REPLACE FUNCTION public.submit_letter_outcome(...)`: copy the full signature, attributes (`LANGUAGE plpgsql`, `SECURITY DEFINER`, `SET search_path = public, pg_temp`) and body from `033_letter_outcomes.sql` byte for byte, adding exactly one line in the UPDATE SET list directly after the `reply_addressed = ...` line: `reply_feeling = NULLIF(p_answers->>'replyFeeling', 'null'),`. Then repeat the two lines `REVOKE ALL ON FUNCTION public.submit_letter_outcome(text,text,text,text,jsonb,boolean,text,text,boolean,text,boolean,text) FROM PUBLIC, anon, authenticated;` and `GRANT EXECUTE ON FUNCTION ... TO service_role;` from 033. No cron, no table re-creation.
2. `web/supabase/MIGRATION_STATUS.md`: add a table row after the `034_campaign_end_feedback.sql` row: file `035_letter_outcomes_reply_feeling.sql`, status "Not yet applied", note "Thomas runs it in the Supabase SQL Editor BEFORE deploying, because /stats selects the new column `reply_feeling` (the select fails with 42703 until then). Not run by any agent; constraints and function not independently verified." English, same style as the other rows.
3. `web/src/lib/rueckmeldung/schema.ts`: export `REPLY_FEELING_VALUES = ["positive_surprise", "glad_someone_answered", "as_expected", "disappointing"] as const` next to `REPLY_ADDRESSED_VALUES`; add `replyFeeling: z.enum(REPLY_FEELING_VALUES).nullable().default(null)` to `outcomeAnswersSchema` directly after `replyAddressed`.
4. `web/src/lib/actions/submitOutcome.ts`:
   a. `validateFull` not_sent branch (~line 34): the "Ungültige Antworten zum Brief." condition also triggers when `answers.replyFeeling` is set.
   b. Sent branch, after the existing `hadReply !== Boolean(answers.replyAddressed)` check (~line 41): if `hadReply && !answers.replyFeeling` return "Bitte beantworte noch, wie die Reaktion für dich war."; if `!hadReply && answers.replyFeeling` return "Ungültige Antwort zur Reaktion.".
   c. RPC payload (~lines 84-89), mirroring `replyAddressed`: `replyFeeling` is null when `answers.letterSent === "not_sent"` OR `answers.replyChannels.length === 0` OR `answers.replyChannels.includes("none")`, else `answers.replyFeeling`. This matters for progress saves: without it the DB needs-reply CHECK would raise and the progress write would fail.
5. `web/src/app/(site)/rueckmeldung/RueckmeldungForm.tsx`:
   a. `EMPTY_ANSWERS` (~line 15): add `replyFeeling: null`.
   b. `change()` (~lines 88-94): set `next.replyFeeling = null` in the not_sent branch and inside the existing `if (...includes("none") || !next.replyChannels.length)` reset, alongside `replyAddressed`.
   c. `replyReady` (~line 119): when `hasReply`, require both `answers.replyAddressed !== null` and `answers.replyFeeling !== null`.
   d. `questionCount` (~line 125): the `hasReply` value becomes 8 (6 otherwise stays).
   e. `answered` (~lines 126-130): add `!notSent && hasReply && answers.replyFeeling !== null` directly after the replyAddressed entry.
   f. Render directly after the closing of the "Wurde auf dein Anliegen eingegangen?" Question (~line 205), same condition `!notSent && hasReply`: `Question` with title "Wie war die Reaktion für dich?", mark "Reaktion", containing `Choices` with label "Gefühl zur Reaktion", the four [key, label] tuples from the context block in the listed order, `value={answers.replyFeeling}`, `onSelect={(replyFeeling) => change({ replyFeeling }, "reply_feeling")}`.
6. `web/src/__tests__/outcomeAction.test.ts`: add `replyFeeling: null` to the `fullAnswers` fixture; in the existing `it.each` "yes" row (replyChannels ["email"], replyAddressed "partly") add `replyFeeling: "as_expected"`, otherwise it now fails by design. Add the cases from `<behavior>` as new `it`s, using the existing `rpc` mock and `createRueckmeldungToken` pattern.
  </action>
  <verify>
    <automated>(cd web && npx jest src/__tests__/outcomeAction.test.ts src/__tests__/rueckmeldungPage.test.ts && ! (npx tsc --noEmit -p . 2>&1 | grep -E "rueckmeldung|submitOutcome|outcomeAction")) && test "$(diff <(sed -n '/CREATE OR REPLACE FUNCTION/,/^[$][$];/p' web/supabase/migrations/033_letter_outcomes.sql) <(sed -n '/CREATE OR REPLACE FUNCTION/,/^[$][$];/p' web/supabase/migrations/035_letter_outcomes_reply_feeling.sql) | grep '^[<>]' | grep -vF "reply_feeling = NULLIF(p_answers->>'replyFeeling', 'null')," | wc -l | tr -d ' ')" = 0 && grep -q "GRANT EXECUTE ON FUNCTION public.submit_letter_outcome" web/supabase/migrations/035_letter_outcomes_reply_feeling.sql && grep -q "035_letter_outcomes_reply_feeling.sql" web/supabase/MIGRATION_STATUS.md</automated>
  </verify>
  <done>Both Jest files green including the new reply_feeling cases; no tsc errors in the touched files; the 035 function differs from 033 only by the reply_feeling line; MIGRATION_STATUS.md lists 035 as not yet applied; migration not executed anywhere.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: reply_feeling on /stats (aggregation, page block, stats tests) plus final gates</name>
  <files>web/src/lib/internalStats/outcomes.ts, web/src/app/stats/page.tsx, web/src/__tests__/internalStatsOutcomes.test.ts</files>
  <behavior>
    - completed replied rows with reply_feeling positive_surprise/generic, glad_someone_answered/generic, disappointing/concrete, plus one replied row with reply_feeling null: replyFeelingBase 3, replyFeelingCounts {positive_surprise 1, glad_someone_answered 1, as_expected 0, disappointing 1}
    - feelingByAddressed.generic is {total 2, counts positive_surprise 1, glad_someone_answered 1}, concrete total 1, partly total 0
    - a completed row with reply_channels ["none"] and a reply_feeling value, and an incomplete row with a reply_feeling value, are not counted
    - the outcomes query selects 17 columns including reply_feeling and still never email
  </behavior>
  <action>
1. `web/src/lib/internalStats/outcomes.ts`:
   a. Import `REPLY_FEELING_VALUES`, add `type ReplyFeeling`.
   b. `InternalOutcomeRow`: add `reply_feeling: string | null` after `reply_addressed`; `OUTCOME_ROW_COLUMNS`: add `"reply_feeling"` after `"reply_addressed"`.
   c. `OUTCOME_LABELS`: add `replyFeeling: Record<ReplyFeeling, string>` to the type and the four labels from the context block to the object, after `replyAddressed`.
   d. `OutcomeRoundStats`: add `replyFeelingCounts: Record<ReplyFeeling, number>`, `replyFeelingBase: number`, `feelingByAddressed: Record<ReplyAddressed, { total: number; counts: Record<ReplyFeeling, number> }>`; initialise in `emptyOutcomeRoundStats` with `zeroRecord` (each feelingByAddressed cell gets its own fresh record, no shared object).
   e. In the completed-rows loop, inside the existing `handwritten || typed` block: when `state.replied` and `isOneOf(REPLY_FEELING_VALUES, row.reply_feeling)`, increment `replyFeelingBase` and the count; if additionally `isOneOf(REPLY_ADDRESSED_VALUES, row.reply_addressed)`, increment that cell's `total` and `counts[row.reply_feeling]`. Null feelings never enter any base.
2. `web/src/app/stats/page.tsx`:
   a. Import `REPLY_FEELING_VALUES` from `@/lib/rueckmeldung/schema`; add `replyFeelingOptions` next to `addressedOptions` (~line 1655) using `OUTCOME_LABELS.replyFeeling`.
   b. Add a small module const map for the per-addressed line prefixes: concrete "Bei konkreten Antworten", partly "Bei teilweise konkreten Antworten", generic "Bei eher allgemeinen Antworten".
   c. Inside the existing `DetailBlock title="Reaktion und wie konkret"` (~line 1743), after the "Wurde auf das Anliegen eingegangen?" div, add a third div with the same structure: caption paragraph "Wie war die Reaktion für dich?" (same classes as the sibling captions), `SurveyDistributionBars` with `values={round.replyFeelingCounts}`, `options={replyFeelingOptions}`, `total={round.replyFeelingBase}`, `color="#C58B18"` (already used on the page), `mode="prozentual"`, `valueLabel={formatBarShare}`, `baseNote={shareBaseNote}`.
   d. Below the bars, for each key of `REPLY_ADDRESSED_VALUES` whose `round.feelingByAddressed[key].total > 0`, one compact text line: "{prefix}: {x} von {y} positiv überrascht oder froh, dass sich jemand gemeldet hat", where x = counts.positive_surprise + counts.glad_someone_answered and y = total, both via the existing `formatNumber`. Use a plain list with `font-body text-xs` classes like the existing captions.
   e. Then one hint line in the caption style: "Frage seit 19.10.2026, frühere Rückmeldungen ohne Angabe."
3. `web/src/__tests__/internalStatsOutcomes.test.ts`: add `reply_feeling: null` to the `outcome()` fixture; change the select column count assertion (~line 327) from 16 to 17 and assert the select contains `reply_feeling`; add a test in `describe("aggregateOutcomes counting rules")` covering the `<behavior>` cases with `completedForm`/`outcome`.
4. Final gates from `web/`: eslint on all touched TS/TSX files, full `npx jest`, `npm run build`. If build or jest fails in a file this plan did not touch, report it as pre-existing with the error line instead of fixing it.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/internalStatsOutcomes.test.ts && npx eslint src/lib/rueckmeldung/schema.ts src/lib/actions/submitOutcome.ts "src/app/(site)/rueckmeldung/RueckmeldungForm.tsx" src/lib/internalStats/outcomes.ts src/app/stats/page.tsx src/__tests__/outcomeAction.test.ts src/__tests__/internalStatsOutcomes.test.ts && npx jest && npm run build && grep -rn "Frage seit 19.10.2026\|Hatte mehr erwartet\|positiv überrascht oder froh\|wie die Reaktion für dich war\|Bei teilweise konkreten" src | perl -CSD -ne '$n++ if /[\x{2013}\x{2014}]/; END { exit($n ? 1 : 0) }'</automated>
  </verify>
  <done>internalStatsOutcomes tests green with the new counts and cross-tab; eslint clean on touched files; full Jest suite green; `npm run build` succeeds; new copy contains no em or en dash; only the files in files_modified are staged and committed; nothing pushed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| browser to server action | `answers.replyFeeling` arrives from an untrusted client via submitOutcomeAction |
| server action to Postgres | service-role RPC submit_letter_outcome writes letter_outcomes |
| /stats page | internal, cookie-gated aggregate view of outcomes |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-uim-01 | Tampering | submitOutcome.ts | medium | mitigate | zod enum on replyFeeling; validateFull rejects feeling without reply and missing feeling with reply; payload nulls replyFeeling without reply; DB CHECKs `letter_outcomes_reply_feeling_allowed` and `_needs_reply` as backstop |
| T-uim-02 | Elevation of Privilege | submit_letter_outcome | medium | mitigate | function keeps SECURITY DEFINER with fixed search_path and the same REVOKE from PUBLIC/anon/authenticated plus GRANT to service_role only |
| T-uim-03 | Information Disclosure | outcomes.ts / stats page | low | mitigate | only the categorical reply_feeling column is added to the select; email stays excluded (test asserts no email in select) |
| T-uim-04 | Denial of Service | deploy order | medium | mitigate | MIGRATION_STATUS.md row states 035 must be applied before deploy, otherwise the /stats select fails |
| T-uim-SC | Tampering | npm installs | low | accept | no package installs in this plan |
</threat_model>

<verification>
- Task 1 and Task 2 automated commands pass.
- `git status --short` after the commits shows only the pre-existing unrelated changes (`.gitignore`, the research file, `web/*.jsonl`) as dirty.
</verification>

<success_criteria>
- Form asks the new question only after a real reaction and blocks completion until answered.
- Server and DB reject or null reply_feeling whenever no reply exists.
- /stats shows distribution, per-addressed lines and the since-19.10.2026 hint.
- Migration 035 exists, is documented as not yet applied, and was not run.
</success_criteria>

<output>
Create `.planning/quick/261019-uim-rueckmeldeformular-frage-wie-war-die-rea/261019-uim-SUMMARY.md` when done. Include in it, as a manual step for Thomas: run `web/supabase/migrations/035_letter_outcomes_reply_feeling.sql` in the Supabase SQL Editor before deploying.
</output>

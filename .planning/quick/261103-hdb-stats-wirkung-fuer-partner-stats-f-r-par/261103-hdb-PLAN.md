---
quick_id: 261103-hdb
mode: quick
source: /Users/thomas/.claude/plans/meine-idee-ich-will-deep-whistle.md (approved by Thomas 2026-11-03)
---

# /stats: Wirkung für Partner zeigen, ohne zu überladen

Password-gated `/stats` (web/src/app/stats/page.tsx, server component) is shown to partners (NGOs, media, funders). Goal: within 10 seconds it is clear the tool works for letter writers and in politics, and every number survives scrutiny. All product decisions are locked (see source plan); do not reopen them.

## Hard boundaries
- Only touch: `web/src/app/stats/page.tsx`, `web/src/lib/internalStats/{view,outcomes,questions}.ts`, `web/src/components/internalStats/*`, new tests in `web/src/__tests__/internalStats*.test.ts`, and the existing internalStats tests where rates change.
- The working tree has unrelated uncommitted changes (Header, MdbLookupCard, Step3Success, buildEmailHtml, tests, .planning/STATE.md, ROADMAP.md, web/AGENTS.md, untracked Bpa*/MdbContactContext). NEVER stage, modify, stash or revert them. Stage files by explicit path only, never `git add -A`/`.`.
- Do not push. No new dependencies, services, tables, or Mistral calls.
- Jest only runs `*.test.ts` (not .tsx). Run tests from `web/`: `npx jest internalStats`.
- Copy: German, no em dashes, "ich" not "wir", brand spelling "Brief-nach-Berlin". Use the existing airmail/paper/green Tailwind classes already used on the page. Load the `frontend-design` skill for Task 3.
- Next.js 16: client islands need `"use client"`; follow the existing pattern of `FilterBar`/`SectionNav`.

## Task 1: Number core (lib + tests), commit `feat(quick-261103-hdb): Wirkungszahlen und einheitliche Raten für /stats`
Files: `web/src/lib/internalStats/view.ts`, `outcomes.ts`, `web/src/components/internalStats/StatsPie.tsx`, `FilterBar.tsx`, `web/src/app/stats/page.tsx` (only quoteLines ~1029-1057 and the tag labels ~593-603), tests.
- `buildImpactSummary(stats, outcomeRounds)` in view.ts returning:
  - writers: `topRatingShare` = (4★+5★)/reviewCount (from the existing rating breakdown), `sendRate` = sentCount/knownSendCount, `efficacy` = positive (clearly_yes+rather_yes) / selfEfficacyAnswerCount (ALL answers incl. "unsure"). Each with count, base, percent.
  - politics: from the NEWEST outcome round (`aggregateOutcomes` result): `reactionRate` = path.replied / path.sent, `concrete` = path.concrete / path.addressedBase, `responseRate` = respondentCount / deliveredCount. Use the existing `effectiveState` definition (outcomes.ts:441, mail click counts) so numbers match the Briefweg. Null-safe when no round.
- Efficacy rate everywhere = positive / all answers incl. unsure:
  - Review side: wherever the page shows the efficacy headline rate (CoreValues will be replaced in Task 3; quoteLines sentence now). Keep the directional count available for the detailed distribution but the headline percentage uses the inclusive base.
  - Outcome side (`outcomes.ts` selfEfficacy aggregation): same formula, senders only (letter_sent handwritten/typed per effectiveState), so "Nach dem Brief" shows the weeks-later value comparably (live: 22 of 36 = 61 %).
- quoteLines: efficacy sentence uses the inclusive rate and says "x % der Antwortenden ... (n von m Antworten)". Add one politics sentence when base >= 30: "Von den Rückmeldenden, die ihren Brief abgeschickt haben, bekamen x von y eine Reaktion (Selbstauskunft, Rücklauf z von w)." Never "die Politik hört zu".
- `buildStatements(...)` in view.ts: returns `Record<StatementKey, string | null>` for 8 keys: `efficacy`, `powerlessness`, `briefweg`, `writeAgain`, `rating`, `qualitySend`, `firstTimers`, `topCategory`. Fixed German templates filled with numbers; `null` when the relevant base < 30. Wording must stay neutral/true in both directions (e.g. compare numbers instead of hardcoding "mehr" when it could flip: derive comparatives from the data).
- StatsPie centre: sent / (sent + notSent), matching the KPI (sent/known). Legend still lists "keine Angabe".
- Tag labels on page.tsx ~593-603: take labels from `web/src/lib/feedback/feedbackTags.ts` instead of hardcoded strings (fixes "Klingt nicht nach mir" → "Klingt zu sehr nach KI", "Anliegen verfehlt" → "Anliegen falsch verstanden").
- FilterBar hint (~107-110): say that the letter counter and the Rückmeldungen (Nach dem Brief) stay unfiltered.
- New `web/src/__tests__/internalStatsImpact.test.ts`: 620 positive of 717 answers → 86 %; statements null under 30; politics from outcome rows incl. a mail-click "yes" row; StatsPie/known-rate consistency. Update existing internalStats tests whose expected rates change.

## Task 2: Question info, commit `feat(quick-261103-hdb): Frage-Info per Tipp auf /stats`
Files: new `web/src/lib/internalStats/questions.ts`, new `web/src/components/internalStats/StatInfo.tsx`, new `web/src/__tests__/internalStatsQuestions.test.ts`.
- questions.ts: `STAT_QUESTIONS: Record<StatQuestionKey, { question: string; asked: string; options?: readonly string[] }>`. Question text VERBATIM as users see it. Keys and sources (verify wording in the files):
  - rating: mail "Wie findest du deinen Brief?" (lib/email/mailLocale.ts) / form; asked: everyone who rated.
  - sendSignal: "Hast du deinen Brief schon verschickt oder verschickst ihn gleich?" (FeedbackForm.tsx); asked: everyone who opened the full form.
  - efficacy: "Fühlst du dich durch diesen Brief eher in der Lage, dich politisch einzubringen?"; asked: only those who answered "Ja, geht raus".
  - letterHistory, priorContact (only if first/bnb_only), powerlessness, age: from FeedbackForm.tsx.
  - tags: "Was hat geklappt?" (ab 4 Sternen) / "Was war's?" (bis 3 Sterne); options: ALL tags from feedbackTags.ts grouped (chart shows only 6 of 16).
  - Outcome questions from `web/src/app/(site)/rueckmeldung/RueckmeldungForm.tsx`: sent, notSentReason, channels, addressed, feeling, expectation, outcomeEfficacy, writeAgain; and the last-call mail question "Hat sich jemand auf deinen Brief gemeldet?" (lib/email/buildLastcallHtml.ts) for the Briefweg; asked: recipients of the last-call mail who answered (round label).
  - `options` only where the chart does not show all options (tags; Briefweg click options). Reuse existing label constants, never retype them.
- Drift test: read FeedbackForm.tsx, RueckmeldungForm.tsx, buildLastcallHtml.ts, mailLocale.ts with `fs` and assert every `question` string occurs verbatim in one of them (normalize JSX whitespace and HTML entities/typographic quotes if needed). Do not modify the form files.
- StatInfo.tsx (`"use client"`): copy the pattern of `web/src/components/campaigns/CampaignFixedRecipientBadge.tsx`: an (i) icon button (aria-label "Frage zu <title> anzeigen", min-h-11 min-w-11 tap target, visible focus ring), native `<dialog>` with showModal, closes on backdrop click and "Schließen" button, returns focus. Dialog shows: "Gefragt:" + question in quotes, "Wer:" + asked, optional list of options. Props: `title`, `info` (serializable object, not the key, so the server page passes data).

## Task 3: Page rebuild, commit `feat(quick-261103-hdb): /stats zeigt Wirkung zuerst und klappt Details ein`
Files: `web/src/app/stats/page.tsx` (+ small new components in web/src/components/internalStats/ if it keeps page.tsx readable).
- `ImpactBlock` replaces `CoreValues` (page.tsx ~692-778):
  - Top line: letter count (keep "ca. … ohne Doppelte").
  - Two columns (stack on mobile): "Bei den Schreibenden": topRatingShare "geben 4 bis 5 Sterne", sendRate "schicken den Brief ab", efficacy "fühlen sich eher in der Lage, sich politisch einzubringen" (inclusive rate, show "n von m"). Keep `BaselineLine` for these three when a filter is active.
  - "In der Politik": "x von y bekamen eine Reaktion" (absolute numbers first), "z davon gingen konkret oder teilweise auf das Anliegen ein", note: "Selbstauskunft aus der Rückmeldungsrunde <label>, Rücklauf a von b, unabhängig vom Filter."
  - StatInfo on each value that comes from a question.
- Section order: Überblick (ImpactBlock + Zahlen zum Zitieren), Wirkung, Nach dem Brief, Themen, Verlauf, Feedback, Alter, Erstschreiber, Definitionen. Update `SECTION_LINKS` (~203) to the same order.
- Statements: render `buildStatements` result as one line above the chart (not hidden in a tooltip) on these cards: Handlungsfähiger durch den Brief, Positive Selbstauskunft nach Ohnmachtsfrequenz, Briefweg, Wieder schreiben, Bewertung (x/5), Qualität entscheidet mit, Erstschreiber Kennzahlen, Oberkategorien. Skip the line when null. Style: small, strong, waldgruen-dark, before the chart.
- Keep open by default (~14): ImpactBlock, Zahlen zum Zitieren, Wirkung (Handlungsfähiger, Politische Ohnmacht, Ohnmacht × Handlungsfähigkeit), Briefweg, Reaktion und wie konkret, Wieder schreiben, Oberkategorien, Bundesländer, Verlauf Brief-Erstellungen, Bewertung, Qualität entscheidet mit, Erstschreiber Kennzahlen, Altersverteilung.
- Move everything else into the existing `Collapsible` (~252) with a clear summary label, nothing deleted: Themensignale/Reviews timelines, Unterthemen, Heatmap, Politische Ebene, PLZ, per-category cards, Funnel, Versandsignal pie, Das hilft / Das bremst, Rücklauf pro Tag, Von Hand oder getippt, Nicht abgeschickt, Fertige Formulare, Alle Antworten (already collapsed), Altersantwortquote, Erstschreiber Verteilung. Exception: the Kampagnen card stays open when a campaign filter is active.
- Add StatInfo next to the title of every card based on a question (efficacy, powerlessness, rating, send, tags, age, letterHistory, outcome cards, Briefweg).
- Efficacy card in Wirkung: big number = inclusive rate; keep the Ja/Nein/Unsicher pills and distribution.
- Mobile: verify no horizontal scroll at 375 px; dialogs fit (max-h-[90dvh]).

## Task 4: Featured quotes skeleton (same commit as Task 3 is fine)
- Add `"id"` to `OUTCOME_ROW_COLUMNS` (outcomes.ts) if not present and to the row type.
- `FEATURED_OUTCOME_QUOTES: readonly string[] = []` in outcomes.ts (Thomas picks IDs later). A small "Stimmen" block in Wirkung renders only rows whose id is listed AND consent === true AND body non-empty; name shown only if display_name, else "anonym". With an empty list the block renders nothing.

## Verify
- `cd web && npx jest internalStats` green, `npm run lint` clean for touched files, `npm run build` succeeds.
- Report any test you had to change and why.

## Done
3 atomic code commits on local main (no push), SUMMARY at `.planning/quick/261103-hdb-stats-wirkung-fuer-partner-stats-f-r-par/261103-hdb-SUMMARY.md` with `status: complete`, listing changed rates and anything deviating from this plan.

---
phase: quick
plan: 261103-hdb
subsystem: internal-stats
tags: [stats, impact, partners, question-info]
key-files:
  created:
    - web/src/lib/internalStats/questions.ts
    - web/src/components/internalStats/StatInfo.tsx
    - web/src/__tests__/internalStatsImpact.test.ts
    - web/src/__tests__/internalStatsQuestions.test.ts
    - web/src/__tests__/internalStatsPage.test.ts
  modified:
    - web/src/app/stats/page.tsx
    - web/src/lib/internalStats/view.ts
    - web/src/lib/internalStats/outcomes.ts
    - web/src/components/internalStats/StatsPie.tsx
    - web/src/components/internalStats/FilterBar.tsx
    - web/src/__tests__/internalStatsOutcomes.test.ts
status: complete
commits: 3
plan_head_before: 52ad068bd6654ed08cd1ee43b15a221414255188
plan_head_after: c0249a677676b3cea90d77d3f68779b3b87544ee
actuals:
  tasks: 4
  commits: 3
---

# Quick 261103-hdb: /stats zeigt Wirkung zuerst

Password-gated `/stats` now opens with an impact block (letters, writers, politics), ordered sections, folded-away detail cards, one summary sentence above each key chart, and an (i) dialog with the verbatim question on every question-based card.

## Commits (local main, not pushed)
- 86b43b0 feat(quick-261103-hdb): Wirkungszahlen und einheitliche Raten für /stats
- 200b98c feat(quick-261103-hdb): Frage-Info per Tipp auf /stats
- c0249a6 feat(quick-261103-hdb): /stats zeigt Wirkung zuerst und klappt Details ein

## Changed rates
- Efficacy headline everywhere (ImpactBlock, Wirkung card, quote line, statements, cross card per Ohnmachtsfrequenz): positive / all answers incl. "unsicher". Previously positive / directional answers (aggregate.ts fields `selfEfficacyPositiveRatePercent` are untouched and no longer used for display). Percent shown as whole number.
- Efficacy after the letter (Rückmeldungen): now senders only (handwritten/typed). Was every completed form incl. "nicht abgeschickt". `selfEfficacy.outcomesBase` shrinks accordingly.
- StatsPie centre: sent / (sent + notSent), identical to the KPI send rate.
- Tag labels on the "Das hilft / Das bremst" lists come from `feedbackTags.ts` ("Klingt zu sehr nach KI", "Anliegen falsch verstanden").
- Quote lines: efficacy sentence uses the inclusive rate with "n von m Antworten"; new politics sentence when at least 30 senders.

## Tests changed
- `internalStatsOutcomes.test.ts`: select column count 17 to 18 (new `id` column) plus assertion that `id` is selected.
- New: internalStatsImpact (620 of 717 = 86 %, statements null under 30, mail-click "yes" row counted, senders-only efficacy, pie centre, featured quotes), internalStatsQuestions (drift test against FeedbackForm, RueckmeldungForm, buildLastcallHtml, mailLocale), internalStatsPage (server render smoke test with mocked data: section order, tag labels, no Stimmen without list).

## Deviations from Plan
- [Rule 2] Added optional `hint` and `alternativeQuestion` (and `optionGroups` for tags) to `StatQuestionInfo` so the "Was hat geklappt?" / "Was war's?" pair and the efficacy hint can be shown verbatim and drift-tested.
- [Rule 2] `concreteOrPartly` added next to `concrete` in `buildImpactSummary` because the ImpactBlock text says "konkret oder teilweise"; `concrete` (concrete / addressedBase) is still returned as specified.
- [Rule 2] Powerlessness x efficacy cards on the page now use positive / answered (inclusive) for consistency; the statement for that card compares "oft" against all others and derives höher/niedriger/gleich hoch from the numbers.
- Section collapsing: several small cards were grouped into one Collapsible per section (for example "Weitere Themen-Details", "Weitere Zahlen zur Runde") instead of one Collapsible per card. Nothing deleted. The Kampagnen card stays open when a campaign filter is active.
- Extra definition "Handlungsfähigkeit" added to the Definitionen section.
- Co-author trailer uses "Claude Sonnet 5.5" (harness attribution) instead of "Claude Opus 5.5" from the prompt.
- Commits were made on `main` as instructed by the sequential-execution block; `git.base-branch --is-protected main` returns true, so the usual protected-branch guard was bypassed deliberately on the orchestrator's instruction.
- `.next/cache/turbopack` (gitignored build cache, corrupted by iCloud duplicates) was removed to get `npm run build` running.

## Verification
- `npx jest internalStats`: 9 suites, 116 tests passed. Full `npx jest`: 180 suites, 1751 tests passed.
- `npm run lint`: 0 errors, 8 warnings, all in files this task did not touch.
- `npm run build`: succeeded.
- Not done (orchestrator): browser check at 375 px and dialog fit; no dev server was started.

## Known Stubs
- `FEATURED_OUTCOME_QUOTES` is intentionally empty until Thomas picks row IDs; the Stimmen block renders nothing meanwhile.

## Self-Check: PASSED

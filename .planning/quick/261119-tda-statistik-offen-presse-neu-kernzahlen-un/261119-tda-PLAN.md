---
phase: quick-261119-tda
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/lib/internalStats/keyFigures.ts
  - web/src/lib/internalStats/getInternalStats.ts
  - web/src/lib/internalStats/publicTeaser.ts
  - web/src/components/internalStats/KeyFigures.tsx
  - web/src/components/internalStats/PublicStatsLanding.tsx
  - web/src/app/stats/page.tsx
  - web/src/__tests__/statsKeyFigures.test.ts
  - web/src/__tests__/internalStatsPublicTeaser.test.ts
  - web/src/lib/reviews/pickSpreadQuotes.ts
  - web/src/components/reviews/QuoteCarousel.tsx
  - web/src/__tests__/statsQuotes.test.ts
  - web/src/components/internalStats/PressStatsDashboard.tsx
autonomous: true
requirements: [TDA-01, TDA-02, TDA-03, TDA-04, TDA-05, TDA-06, TDA-07]

estimate:
  tokens: 150000
  raw_tokens: 150000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Logged out, /stats shows in this order: kicker, H1, short intro (Schreiben per Hand aktiviert, der Akt ist demokratisches Engagement), Kernzahlen strip, quote carousel, 'Zugang anfragen' box, password form. The old send-rate and topic tiles are gone (D-03)."
    - "The Kernzahlen strip is ONE component used by the public page and the press dashboard: Briefentwürfe gesamt, erstmals an die Politik geschrieben, fühlen sich eher handlungsfähig, würden wieder schreiben, Ø-Bewertung. Each share and the rating appear only when their base is at least SHARE_PERCENT_MIN_BASE (30) and carry a small base note such as 'aus 412 Antworten' (D-02)."
    - "The carousel shows up to 20 consented reviews with rating 4 or 5, picked evenly across calendar months, each with name or 'Anonym', stars and month; it has prev/next buttons, arrow-key control, aria-live, no autoplay, and works at 375 px (D-04)."
    - "The press dashboard starts with the Kernzahlen strip plus 'Zahlen zitieren' and 'Abmelden', then topics and weekly chart, then 'Was die Nachbefragung zeigt' with the newest round open and an 'Erste Werte' badge, older rounds collapsed, and an early-round bias note on the October round (D-07)."
    - "The 'Zahlen zitieren' text states the activation numbers (first-timers, handlungsfähig, wieder schreiben, rating) whenever their base reaches the minimum."
    - "The public page exposes only aggregates plus consented review fields (body, rating, display name, month); both public reads are cached daily and a failed read is not cached."
  artifacts:
    - path: web/src/lib/internalStats/keyFigures.ts
      provides: "Pure buildKeyFigures(stats, outcomes, rating) and keyFigureQuoteLines(figures); single source of truth for the five numbers and their bases"
    - path: web/src/components/internalStats/KeyFigures.tsx
      provides: "Shared Kernzahlen strip (server component) with optional action slot"
    - path: web/src/components/internalStats/PublicStatsLanding.tsx
      provides: "Logged-out /stats view (moved out of page.tsx so it can be rendered in tests and screenshots)"
    - path: web/src/lib/reviews/pickSpreadQuotes.ts
      provides: "Pure pickSpreadQuotes(reviews, limit) month-spread quote selection"
    - path: web/src/components/reviews/QuoteCarousel.tsx
      provides: "Small accessible client carousel, no new library"
    - path: web/src/lib/internalStats/publicTeaser.ts
      provides: "Daily-cached getPublicStatsTeaser (KeyFigures, cache key public-stats-teaser-v3) and getPublicStatsQuotes (cache key public-stats-quotes-v1)"
    - path: web/src/__tests__/statsKeyFigures.test.ts
      provides: "Tests for buildKeyFigures, keyFigureQuoteLines, teaser wiring and landing order"
    - path: web/src/__tests__/statsQuotes.test.ts
      provides: "Tests for pickSpreadQuotes, QuoteCarousel first render and landing order with quotes"
  key_links:
    - from: web/src/lib/internalStats/getInternalStats.ts
      to: web/src/lib/internalStats/keyFigures.ts
      via: "getPressStats returns keyFigures built from unfiltered (DEFAULT_STATS_FILTER) stats, sent outcome rounds and getReviewStats()"
      pattern: "keyFigures"
    - from: web/src/lib/internalStats/publicTeaser.ts
      to: web/src/lib/internalStats/getInternalStats.ts
      via: "unstable_cache wraps getPressStats(DEFAULT_STATS_FILTER).keyFigures"
      pattern: "public-stats-teaser-v3"
    - from: web/src/app/stats/page.tsx
      to: web/src/components/internalStats/PressStatsDashboard.tsx
      via: "{...press} spread now carries keyFigures into the dashboard"
      pattern: "PressStatsDashboard"
    - from: web/src/lib/reviews/getPublicReviews.ts
      to: web/src/components/reviews/QuoteCarousel.tsx
      via: "getPublicReviews(200) -> pickSpreadQuotes(..., 20) -> cached -> PublicStatsLanding -> QuoteCarousel"
      pattern: "pickSpreadQuotes"
---

<objective>
Implement "Quick 1" (open /stats page) and "Quick 2" (press view) of the approved stats redesign plan. Both views lead with the same five Kernzahlen, the open page gets a quote carousel, and the press view regroups the Nachbefragung. The message: writing by hand activates people, and the act of writing is already democratic engagement.

Requirement IDs (from the orchestrator's numbered list): TDA-01 shared Kernzahlen strip, TDA-02 public page order, TDA-03 quote carousel, TDA-04 press dashboard, TDA-05 brand look plus design skill plus screenshots, TDA-06 no new DB columns, services or SDKs and aggregates only, TDA-07 nothing private committed.

Decision references (numbering of "Entscheidungen" in the approved plan): D-01 each view has its own role, D-02 Kernzahlen, D-03 open page content, D-04 quotes, D-07 Nachbefragung, D-09 look. D-05, D-06 and D-08 belong to Quick 3 and are OUT OF SCOPE. Do NOT touch web/src/app/stats/intern/**, web/src/components/internalStats/SectionNav.tsx or web/src/lib/internalStats/outcomes.ts. Another session is building Quick 3 and can later reuse buildKeyFigures and KeyFigures.

Source decision per number (locked here, document it in a one-line comment per field at the top of keyFigures.ts):
- Briefentwürfe gesamt: stats.letterCount (global counter, includes campaigns).
- Erstmals an die Politik geschrieben: reviews (feedback right after the letter). positive = letterHistory.distribution.first, base = letterHistory.answerCount. This is the same definition as the current press cell "Schreiben erstmals an Politiker:innen".
- Fühlen sich eher handlungsfähig: reviews. positive = politicalActivation.selfEfficacyDistribution.clearly_yes + rather_yes, base = politicalActivation.selfEfficacyAnswerCount. The base includes "Kann ich noch nicht sagen", which is conservative. Do NOT use selfEfficacyPositiveRatePercent, which leaves out "unsure". Reviews win over the outcome round because the base is larger, the question is asked right after writing (the act itself), and the early outcome round is biased.
- Würden wieder schreiben: newest sent outcome round (last element of the outcomes array, which follows OUTCOME_ROUNDS order). positive = writeAgainCounts.already_did + writeAgainCounts.yes, base = writeAgainBase (includes maybe and rather_not).
- Ø-Bewertung: getReviewStats() (averageRating, totalCount, since MIN_PUBLIC_REVIEW_DATE). This is the same number /stimmen and the homepage show, so the public pages never disagree.
- All five are always computed unfiltered (Gesamtzeitraum, bundesweit, mit Kampagnen), so press and public numbers match. Percentages are whole numbers (Math.round). Each share is null below SHARE_PERCENT_MIN_BASE, and the rating average is null when totalCount is below SHARE_PERCENT_MIN_BASE. The strip HIDES a tile whose value is null (it does not show "Keine Angaben"); the letter total is always shown.

Known data state, do not change it: web/src/lib/rueckmeldung/cohort.ts still lists the November round with sentCount 0, so sentOutcomeRounds() returns only the October round. Today the October round is therefore the "newest" round: it shows open with "Erste Werte" plus its bias note. Updating the November round config is not part of this plan.

Output: shared Kernzahlen strip, redesigned public /stats, quote carousel, regrouped press dashboard, tests.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@web/AGENTS.md
@.planning/brand-identity.md
@web/src/app/stats/page.tsx
@web/src/lib/internalStats/publicTeaser.ts
@web/src/lib/internalStats/getInternalStats.ts
@web/src/components/internalStats/PressStatsDashboard.tsx
@web/src/lib/reviews/getPublicReviews.ts
@web/src/lib/reviews/getReviewStats.ts

Interfaces the executor needs (already in the codebase, do not re-derive):
- web/src/lib/internalStats/view.ts: SHARE_PERCENT_MIN_BASE = 30, shareParts(value, total).
- web/src/lib/internalStats/aggregate.ts: InternalStats (letterCount, fetchedAt, letterHistory.distribution.first, letterHistory.answerCount, politicalActivation.selfEfficacyDistribution, politicalActivation.selfEfficacyAnswerCount), DEFAULT_STATS_FILTER, isNarrowingFilter, aggregateInternalStats(rows, letterCount, fetchedAt, signals, filter, labels).
- web/src/lib/internalStats/outcomes.ts (READ ONLY): OutcomeRoundStats (cohort, label, writeAgainCounts.already_did, writeAgainCounts.yes, writeAgainBase, efficacyByReply), aggregateOutcomes(rows, reviewRows, round, fetchedAt).
- web/src/lib/rueckmeldung/cohort.ts: LASTCALL_COHORT, OUTCOME_ROUNDS, sentOutcomeRounds().
- web/src/lib/reviews/types.ts: PublicReview { id, created_at, rating, body, display_name }, MIN_PUBLIC_REVIEW_DATE.
- web/src/lib/reviews/getReviewStats.ts: getReviewStats() returns { averageRating, totalCount, ... } and returns EMPTY_STATS on any error.
- web/src/lib/formatNumber.ts: formatNumber, formatDecimal (de-DE). web/src/lib/internalStats/pressCopy.ts: formatPressDate.
- web/src/components/reviews/RatingStat.tsx exports StarBar({ rating, size: "sm" | "lg" }) (no aria text, add sr-only text yourself).
- web/src/__tests__/internalStatsPage.test.ts and web/src/__tests__/internalStatsOutcomes.test.ts show the patterns for review and outcome fixtures and for renderToStaticMarkup with createElement in .ts tests.
- Important fact: web/src/lib/supabase.ts (used by getPublicReviews) is a SERVICE-ROLE client despite the "anon" comment. RLS does not protect it, so the explicit consent filter and the 5-column select in getPublicReviews are the only guard. Do not widen that select.

Project rules that bind this plan: Jest only runs web/src/__tests__/**/*.test.ts (no .tsx tests; use createElement). Always mock @/lib/mistral if anything pulls it in. Never read, cat, source or symlink web/.env.local or any .env file. No new dependencies, services, SDKs or DB columns. User-facing copy must be German, with no em dash (U+2014; use commas, colons or hyphens), "ich" never "wir" or "uns", brand spelled "Brief-nach-Berlin", no AI-sounding phrasing (check it against Thomas' signs-of-AI-writing checklist if available). The existing /stats copy addresses press readers with "Sie": keep that in the Zugang box and password area, and write the intro without direct address. Test fixtures use invented texts and names only, never real review content (public repo). Commit per task on branch stats-redesign, never push.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Tracer, Kernzahlen end-to-end (aggregate, press loader, daily cache, shared strip, public /stats)</name>
  <files>web/src/lib/internalStats/keyFigures.ts, web/src/lib/internalStats/getInternalStats.ts, web/src/lib/internalStats/publicTeaser.ts, web/src/components/internalStats/KeyFigures.tsx, web/src/components/internalStats/PublicStatsLanding.tsx, web/src/app/stats/page.tsx, web/src/__tests__/statsKeyFigures.test.ts (replaces web/src/__tests__/internalStatsPublicTeaser.test.ts)</files>
  <behavior>
    - buildKeyFigures with 30 letter-history answers (12 "first") gives firstTimers.percent 40 and base 30.
    - buildKeyFigures with 30 self-efficacy answers (10 clearly_yes, 8 rather_yes, 4 unsure, 8 negative) gives efficacy.percent 60 and base 30, so unsure counts in the base.
    - With two outcome rounds, writeAgain uses the LAST one: already_did 5 + yes 25 of base 40 gives percent 75, and roundLabel is the last round's label.
    - A base of 29 gives percent null; a rating totalCount of 29 gives average null; outcomes [] gives writeAgain base 0, percent null, roundLabel null.
    - rating { averageRating 4.5, totalCount 40 } gives average 4.5 and count 40; letterCount and fetchedAt are passed through from stats.
    - getPublicStatsTeaser, with next/cache unstable_cache mocked as pass-through and getPressStats mocked, returns exactly the keyFigures from getPressStats; when getPressStats rejects it returns null.
    - PublicStatsLanding render (renderToStaticMarkup): with all bases at or above 30, markup contains all five labels and "aus 30 Antworten"-style base notes; the strip appears before "Zugang anfragen", which appears before the password field; with figures null or all shares null, only the letter total tile (or no strip at all for null) renders; markup has no em dash and no old send-rate label text.
  </behavior>
  <action>
Start the visual work by invoking the design-taste-frontend skill (dashboard and app-screen rules, no new libraries) for the direction of a calm "Jahresbericht" in brand look: creme paper background, waldgrün, airmail red and blue only as an accent (for example a thin airmail stripe), font-typewriter for big numbers with tabular-nums, lots of whitespace, almost no charts (D-09). Read .planning/brand-identity.md sections 4 and 6 first. Write the chosen direction in 3 to 5 lines into the SUMMARY and apply the same direction in Tasks 2 and 3.

1. Create web/src/lib/internalStats/keyFigures.ts as a pure module without "server-only". It exports the types KeyShare (positive, base, percent as number or null) and KeyFigures (letterCount, firstTimers, efficacy, writeAgain as KeyShare plus roundLabel as string or null, rating with average as number or null plus count, fetchedAt). It also exports buildKeyFigures(stats: InternalStats, outcomes: OutcomeRoundStats[], rating: { averageRating: number; totalCount: number }). Implement exactly the per-number sources and null rules from the objective (D-02). Add a one-line source comment per field. Use one small helper for the share: whole percent via Math.round, null below SHARE_PERCENT_MIN_BASE. The result must be a plain JSON-serializable object, because it goes through unstable_cache.

2. In web/src/lib/internalStats/getInternalStats.ts change ONLY getPressStats. Load the rows and getReviewStats() in parallel with Promise.all. Compute the global stats: reuse `stats` when the filter is the default (timeRange "all", no narrowing filter); otherwise call aggregateRows(rows, DEFAULT_STATS_FILTER, fetchedAt). Return an added field keyFigures from buildKeyFigures(globalStats, outcomes, reviewStats). Keep includePrivateOutcomeFields false. Leave getInternalStats and getInternalStatsWithBaseline untouched (Quick 3 territory). Do not add a second outcomes or reviews query: getReviewStats is the existing rating source (extend, do not copy).

3. Rewrite web/src/lib/internalStats/publicTeaser.ts. Remove the old PublicStatsTeaser type and toPublicStatsTeaser. getPublicStatsTeaser() returns Promise<KeyFigures | null>: an unstable_cache wrapper around (await getPressStats(DEFAULT_STATS_FILTER)).keyFigures with cache key bumped to "public-stats-teaser-v3", revalidate 86400 and tag "public-stats-teaser". Keep the try/catch, which logs only the error message and returns null.

4. Create web/src/components/internalStats/KeyFigures.tsx as a server component, no "use client". Props: figures: KeyFigures, optional headingId, optional action: ReactNode (the press view puts its CopyButton there). Render a section with a small heading and a dl. Show the letter total always; the four other tiles only when their value is non-null. Each tile has a big value (for example "64 %"; the rating as formatDecimal plus StarBar size "sm" plus sr-only "von 5 Sternen"), a short label, and a base note: "aus N Antworten im Feedback" for first-timers and efficacy, "aus N Antworten der Nachbefragung (roundLabel)" for wieder schreiben, "aus N Bewertungen" for the rating. Suggested labels (refine wording, keep the meaning): "Briefentwürfe mit Brief-nach-Berlin", "schreiben zum ersten Mal an die Politik", "fühlen sich durch den Brief eher politisch handlungsfähig", "würden wieder schreiben oder haben es schon getan", "durchschnittliche Bewertung". Add a footnote line: "Stand {formatPressDate(fetchedAt)}", that all answers are voluntary and anonymous, and that percentages appear from SHARE_PERCENT_MIN_BASE answers. Mobile first: readable at 375 px with no horizontal scroll. Pick the desktop grid with the design skill.

5. Create web/src/components/internalStats/PublicStatsLanding.tsx and move the logged-out view out of page.tsx into it (Next page files may not export extra components, and the move makes the view testable and screenshot-able). Props: configured, error, figures (KeyFigures | null). Task 2 adds quotes. Move ACCESS_MAIL_SUBJECT and ACCESS_MAIL_BODY along. Delete the old TeaserTile helper and the send-rate and topic tiles (D-03) <!-- planner-discipline-allow: TeaserTile -->. The new order is: kicker, H1 "Brief-nach-Berlin in Zahlen", a short intro of 2 to 3 sentences carrying the message (writing a letter by hand activates; the act itself is already democratic engagement, whether or not an answer comes), the KeyFigures strip when figures is not null, then the existing "Zugang anfragen" box and password form, unchanged in behavior (same form action /stats/unlock, same field name, same error text).

6. In web/src/app/stats/page.tsx render PublicStatsLanding in the logged-out branch with figures from getPublicStatsTeaser(). Remove imports that are now unused (formatNumber, topicCategoryLabel, SEND_SIGNAL_LABEL, PublicStatsTeaser) only if nothing else in the file uses them. The logged-in branch stays unchanged in this task. Keep metadata, and you may adjust the description to the new message.

7. Tests: git mv web/src/__tests__/internalStatsPublicTeaser.test.ts web/src/__tests__/statsKeyFigures.test.ts, then replace its content with the behavior cases above. Mock "server-only" (virtual), next/cache (unstable_cache as pass-through), @/lib/internalStats/getInternalStats and @/lib/reviews/getPublicReviews, so no module loads the real Supabase client. Build fixtures with aggregateInternalStats and aggregateOutcomes as in the existing tests. Write the failing tests first, then implement.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/statsKeyFigures.test.ts src/__tests__/internalStatsOutcomes.test.ts && npx tsc --noEmit && test "$(grep -c 'TeaserTile' src/app/stats/page.tsx src/components/internalStats/PublicStatsLanding.tsx | awk -F: '{s+=$2} END {print s}')" = "0" && test "$(grep -c 'public-stats-teaser-v3' src/lib/internalStats/publicTeaser.ts)" = "1" && grep -q '<KeyFigures' src/components/internalStats/PublicStatsLanding.tsx && grep -q 'keyFigures' src/lib/internalStats/getInternalStats.ts && test ! -e src/__tests__/internalStatsPublicTeaser.test.ts</automated>
  </verify>
  <done>Tests for buildKeyFigures, teaser wiring and landing order pass. tsc is clean (baseline at HEAD: clean). The logged-out /stats renders kicker, H1, intro, strip, Zugang box and password in that order, with no old tiles. getPressStats returns keyFigures. The teaser cache key is v3. The existing internalStatsOutcomes suite still passes. Committed.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Quote carousel with month-spread selection on the public page</name>
  <files>web/src/lib/reviews/pickSpreadQuotes.ts, web/src/__tests__/statsQuotes.test.ts, web/src/lib/internalStats/publicTeaser.ts, web/src/components/reviews/QuoteCarousel.tsx, web/src/components/internalStats/PublicStatsLanding.tsx, web/src/app/stats/page.tsx</files>
  <behavior>
    - Drops reviews with rating below 4, an empty or whitespace-only body, or a trimmed body longer than QUOTE_MAX_CHARS (600).
    - 3 months with 10 eligible reviews each and limit 6 gives exactly 2 per month.
    - 25 reviews in November plus 1 in September plus 1 in October with limit 20 gives 20 quotes that include the September and the October one.
    - Fewer eligible reviews than the limit returns all eligible ones; empty input returns [].
    - Output is sorted newest first; null or blank display_name becomes "Anonym"; monthLabel is like "November 2026" (de-DE, Europe/Berlin); the output holds only id, body (trimmed), name, rating and monthLabel; the same input always gives the same output.
    - QuoteCarousel first render (renderToStaticMarkup) shows the first quote, a position text like "1 von 3", an aria-live="polite" region, two buttons labelled "Vorherige Stimme" and "Nächste Stimme", and the star sr-text; with [] it renders nothing.
    - PublicStatsLanding with quotes renders the carousel after the strip and before "Zugang anfragen"; without quotes there is no carousel markup.
  </behavior>
  <action>
1. Create web/src/lib/reviews/pickSpreadQuotes.ts (pure). Export QUOTE_MAX_CHARS = 600, type SpreadQuote (id, body, name, rating, monthLabel) and pickSpreadQuotes(reviews: PublicReview[], limit = 20): SpreadQuote[] (D-04). Filter the eligible reviews as listed in the behavior. Group them by calendar month in Europe/Berlin (Intl.DateTimeFormat with timeZone "Europe/Berlin"). Order the months newest first and the reviews inside each month newest first. Then pick round-robin: one from each month per pass until the limit is reached. Sort the picked quotes newest first and map them to SpreadQuote. Use name = trimmed display_name or "Anonym", the capitalized form that ReviewCard on /stimmen also uses. No randomness, so the daily cache and the tests stay deterministic.

2. In web/src/lib/internalStats/publicTeaser.ts add getPublicStatsQuotes(): Promise<SpreadQuote[]>. Inside an unstable_cache with key "public-stats-quotes-v1", revalidate 86400 and tag "public-stats-teaser", call pickSpreadQuotes(await getPublicReviews(200), 20). Throw inside the cached function when the result is empty: getPublicReviews swallows errors and returns [], and a thrown error keeps a failed or empty read from being cached for a whole day. Outside the cache, catch the error, log only the message and return []. Do not change getPublicReviews; its consent filter and 5-column select stay exactly as they are.

3. Create web/src/components/reviews/QuoteCarousel.tsx with "use client" and no new library. Props: quotes: SpreadQuote[]. Return null for an empty list. Keep the current index in useState with wrap-around. Wrapper: a section with aria-roledescription "Karussell", an aria-label such as "Stimmen aus dem Feedback", tabIndex 0, onKeyDown ArrowLeft and ArrowRight, and a visible focus ring. Slide container: aria-live="polite" and aria-atomic="true". Render each quote as figure, blockquote and figcaption: name and monthLabel, plus StarBar size "sm" with sr-only "{rating} von 5 Sternen". Render the body as plain React text, never dangerouslySetInnerHTML. Prev and next buttons are at least 44 by 44 px with German aria-labels, plus a position text "n von N". No autoplay. Any transition only through Tailwind motion-safe: classes, so prefers-reduced-motion swaps instantly. At 375 px use a full-width card with the controls below it, and set a min-height so short and long quotes do not make the layout jump much. Follow the visual direction from Task 1, for example a paper card in the style of /stimmen; the handwriting font only as an accent, not for long body text (D-09).

4. Add a quotes: SpreadQuote[] prop to PublicStatsLanding and render the carousel between the strip and the Zugang box (D-03), under a small typewriter kicker such as "Was Schreibende sagen". In web/src/app/stats/page.tsx load getPublicStatsTeaser() and getPublicStatsQuotes() with Promise.all in the logged-out branch only, and pass both to PublicStatsLanding.

5. Tests in web/src/__tests__/statsQuotes.test.ts, written first: the behavior cases above, with invented fixture texts and names only. Mock "server-only" (virtual), next/cache, @/lib/internalStats/getInternalStats and @/lib/reviews/getPublicReviews as in Task 1.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/statsQuotes.test.ts src/__tests__/statsKeyFigures.test.ts && npx tsc --noEmit && test "$(grep -c 'public-stats-quotes-v1' src/lib/internalStats/publicTeaser.ts)" = "1" && grep -q '<QuoteCarousel' src/components/internalStats/PublicStatsLanding.tsx && test "$(grep -c 'dangerouslySetInnerHTML' src/components/reviews/QuoteCarousel.tsx)" = "0" && test "$(grep -c 'select("id, created_at, rating, body, display_name")' src/lib/reviews/getPublicReviews.ts)" = "1"</automated>
  </verify>
  <done>pickSpreadQuotes, the carousel first render and the landing-order tests pass. tsc is clean. The logged-out /stats renders the strip, then the carousel, then the Zugang box. The quotes cache key is v1, and failed reads are not cached. getPublicReviews is unchanged. Committed.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Press dashboard with shared strip, regrouped Nachbefragung, activation numbers in the quote text, plus full verification and screenshots</name>
  <files>web/src/lib/internalStats/keyFigures.ts, web/src/__tests__/statsKeyFigures.test.ts, web/src/components/internalStats/PressStatsDashboard.tsx</files>
  <behavior>
    - keyFigureQuoteLines returns one German sentence per non-null figure (first-timers, efficacy, wieder schreiben with round label, rating) and leaves out every null figure; each share sentence contains "n von N" and the whole percent; no sentence contains an em dash, "wir" or "uns".
    - keyFigureQuoteLines returns [] when all four shares and the rating are null.
  </behavior>
  <action>
1. In web/src/lib/internalStats/keyFigures.ts add keyFigureQuoteLines(figures: KeyFigures): string[] for "Zahlen zitieren". Write factual, citable sentences that name the source and the base. For example: first-timers "{p} % ... schreiben nach eigener Angabe zum ersten Mal an Politiker:innen ({n} von {N} Antworten im freiwilligen Feedback direkt nach dem Brief)"; efficacy with the answers „Ja, deutlich“ or „Eher ja“; wieder schreiben with "freiwillige Nachbefragung, {roundLabel}"; rating "{x} von 5 Sternen aus {N} Bewertungen". Use formatNumber and formatDecimal. Add the behavior tests to web/src/__tests__/statsKeyFigures.test.ts first.

2. Restructure web/src/components/internalStats/PressStatsDashboard.tsx (D-07, D-01: press view = citable):
   - Add a keyFigures: KeyFigures prop. It already arrives through the {...press} spread in page.tsx, so page.tsx needs no change.
   - Keep the header with H1 and the Abmelden form. Replace the single "Briefentwürfe insgesamt" box (the section with id press-total) with KeyFigures, passing the existing CopyButton labelled "Zahlen zitieren" in the action slot.
   - quoteLines order: the existing letter-total sentence, using keyFigures.letterCount and formatPressDate(keyFigures.fetchedAt) so it matches the strip; then the spread of keyFigureQuoteLines(keyFigures); then the existing top-topic sentence; then the source line.
   - Below that, PressStatsFilters, then the topics panel and the weekly chart (topics first), with their logic unchanged.
   - Then a visible section (not a collapsed Disclosure) with the heading "Was die Nachbefragung zeigt". Render the newest round (outcomes.at(-1)) open through FollowupRound, with a visible "Erste Werte" badge and one short note that answers are still coming in and the values can still change. Render the older rounds (all except the last, newest first) inside a details element ("Frühere Runden"), collapsed by default, and only when there are any. Keep the empty state "Es liegen noch keine Nachbefragungen vor."
   - Early-round bias note: inside FollowupRound, when round.cohort equals LASTCALL_COHORT (import it from web/src/lib/rueckmeldung/cohort.ts), show a short note. Its content: these letters come from the early phase, when Brief-nach-Berlin addressed almost only Bundestagsabgeordnete and copying by hand was not yet the focus, so the values are biased and only partly comparable. Today this note appears on the open October round, and later on the collapsed one.
   - The first-timer number now lives in the strip. Remove its cell from the "Erste Briefe und Versandangaben" disclosure, rename that disclosure to "Versandangaben", and keep the send-signal cell. Keep "Zahlen nach Bundesland" unchanged. Remove variables and imports that become unused.

3. Visual look-and-fix loop (D-09, TDA-05), following the design-taste-frontend skill's screenshot loop:
   - Without real env you cannot render live data, and you must NOT read, link or source any .env file. Instead create a TEMPORARY, uncommitted fixture route at web/src/app/stats/fixture-tmp/page.tsx. It renders PublicStatsLanding (figures with all bases at or above 30, 6 invented quotes of different lengths, configured true) and, below it, PressStatsDashboard fed from aggregateInternalStats and aggregateOutcomes fixtures with keyFigures from buildKeyFigures. The fixture route imports no Supabase module.
   - Start the dev server (cd web && npm run dev, or the preview tool). Screenshot at 375 px and at desktop width (about 1280 px). Fix spacing, hierarchy and contrast until the result reads as a calm annual report in the brand look. Check keyboard use of the carousel (Tab to the region, arrow keys, buttons) and the details toggle.
   - Then DELETE web/src/app/stats/fixture-tmp entirely, stop the dev server, and if the Turbopack dev cache misbehaves remove web/.next/dev.
   - If the dev server cannot start or the real /stats route needs env, record "BLOCKER: real-data preview of /stats (logged out at 375 px and desktop, press view logged in) needs env" in the SUMMARY for the orchestrator. Do not work around it.

4. Final checks from the repo root: the full jest suite, lint, and build. If npm run build fails ONLY because of missing env at prerender (for example "supabaseUrl is required"), record that as an env blocker in the SUMMARY with the exact error line, and rely on npx tsc --noEmit plus lint as the compile gate. Any other build error must be fixed.

5. Copy pass over every new or changed user-facing string in KeyFigures.tsx, PublicStatsLanding.tsx, QuoteCarousel.tsx, PressStatsDashboard.tsx and keyFigures.ts: German, no em dash, "ich" not "wir" or "uns", "Brief-nach-Berlin", short active sentences, no puffery.
  </action>
  <verify>
    <automated>cd web && npx jest && npm run lint && npx tsc --noEmit && grep -q '<KeyFigures' src/components/internalStats/PressStatsDashboard.tsx && grep -q 'Erste Werte' src/components/internalStats/PressStatsDashboard.tsx && grep -q 'keyFigureQuoteLines' src/components/internalStats/PressStatsDashboard.tsx && test ! -e src/app/stats/fixture-tmp && GS="$(git status --porcelain)" && ! printf '%s\n' "$GS" | grep -q fixture-tmp && test "$(cat src/components/internalStats/KeyFigures.tsx src/components/internalStats/PublicStatsLanding.tsx src/components/reviews/QuoteCarousel.tsx src/components/internalStats/PressStatsDashboard.tsx src/lib/internalStats/keyFigures.ts | grep -c '—')" = "0" && (npm run build || echo "BUILD FAILED: record in SUMMARY whether it is env-only")</automated>
  </verify>
  <done>The full jest suite and lint pass, and tsc is clean. The press dashboard shows the strip with "Zahlen zitieren" and "Abmelden", then topics and weekly chart, then the Nachbefragung with the newest round open and "Erste Werte", older rounds in details, and the bias note on the October cohort. The quote text includes the activation numbers above the minimum base. Screenshots at 375 px and desktop were taken through the fixture route, and the fixture route is deleted. Build passes, or an env-only blocker is documented. Committed, not pushed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Internet to logged-out /stats | Unauthenticated visitors get server-rendered aggregates and quotes |
| Server to Supabase (service role) | getPressStats, getReviewStats and getPublicReviews read with the service-role key; RLS does not apply |
| Password cookie to press view | Press dashboard is behind INTERNAL_STATS_PASSWORD cookie (unchanged) |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261119-01 | Information disclosure | buildKeyFigures / KeyFigures strip on public page | medium | mitigate | Shares and rating are null below SHARE_PERCENT_MIN_BASE (30) and the tile is hidden; only counts, percents and labels enter the cached object; tested in statsKeyFigures.test.ts |
| T-261119-02 | Information disclosure | getPublicReviews (service-role client) -> pickSpreadQuotes -> carousel | high | mitigate | getPublicReviews stays unchanged (consent = true, 5-column select, MIN_PUBLIC_REVIEW_DATE), guarded by a grep gate; SpreadQuote carries only id, trimmed body, name, rating, monthLabel; no email, letter or debug fields |
| T-261119-03 | Tampering (stored XSS) | QuoteCarousel rendering review body and display_name | medium | mitigate | Plain React text only, no dangerouslySetInnerHTML (grep gate) |
| T-261119-04 | Denial of service | Public page triggering full-table service-role reads | low | mitigate | Both reads wrapped in unstable_cache with a daily revalidate; empty or failed reads throw so they are not cached, accepting a retry per request during an outage on a low-traffic page |
| T-261119-05 | Information disclosure | Press quote text and Nachbefragung | low | mitigate | getPressStats keeps includePrivateOutcomeFields false (PRESS_OUTCOME_ROW_COLUMNS, no free text); keyFigureQuoteLines uses only aggregates |
| T-261119-06 | Information disclosure | Temporary fixture route web/src/app/stats/fixture-tmp | low | mitigate | Invented data only, deleted before commit, gated by test ! -e and git status checks |
| T-261119-SC | Tampering | npm/pip/cargo installs | high | mitigate | No package installs in this plan; any new dependency is forbidden without Thomas' approval (project rule) |
</threat_model>

<verification>
- cd web && npx jest src/__tests__/statsKeyFigures.test.ts src/__tests__/statsQuotes.test.ts (targeted), then cd web && npx jest (full). No real Mistral calls.
- cd web && npm run lint; cd web && npx tsc --noEmit; cd web && npm run build (env-only failure documented as a blocker).
- Screenshots at 375 px and desktop via the temporary fixture route (deleted afterwards). Real-data preview of /stats logged out and of the press view logged in is the orchestrator's step if env is missing.
- git diff --stat main...HEAD touches nothing under web/src/app/stats/intern/, web/src/components/internalStats/SectionNav.tsx or web/src/lib/internalStats/outcomes.ts.
- git log shows commits on stats-redesign only; nothing pushed; no private data (real names, review texts, emails) in fixtures.
</verification>

<success_criteria>
- One KeyFigures component and one buildKeyFigures function feed both the public page and the press dashboard (no copy).
- Logged-out /stats: intro, then Kernzahlen, then carousel, then Zugang, then password; old tiles removed; teaser key v3, quotes key v1, both daily.
- Carousel: up to 20 month-spread 4 to 5 star consented quotes, accessible, no new library, works at 375 px.
- Press view: strip on top with Zahlen zitieren and Abmelden, topics and weekly chart, then Nachbefragung with the newest round open ("Erste Werte") and older rounds collapsed, plus the bias note; quote text with activation numbers.
- Jest, lint and tsc green; build green or an env-only blocker documented; no out-of-scope files touched.
</success_criteria>

<output>
Create `.planning/quick/261119-tda-statistik-offen-presse-neu-kernzahlen-un/261119-tda-SUMMARY.md` when done
</output>

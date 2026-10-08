---
phase: quick-261008-rvm
plan: 01
subsystem: kampagnen
tags: [campaigns, creator-stats, donation-card, verwalten]
requires:
  - reviews.campaign_slug (S1, migration 025)
  - campaigns.ends_at / ended views (S2)
provides:
  - web/src/lib/campaigns/creatorStats.ts (buildCampaignCreatorStats, getCampaignCreatorStats, shouldShowCreatorInsights)
  - CampaignCreatorStats and CampaignDonationCard components
affects:
  - web/src/components/campaigns/CampaignManager.tsx (insights slot, old strip removed)
  - web/src/app/(site)/kampagne/verwalten/page.tsx
key-files:
  created:
    - web/src/lib/campaigns/creatorStats.ts
    - web/src/components/campaigns/CampaignCreatorStats.tsx
    - web/src/components/campaigns/CampaignDonationCard.tsx
    - web/src/__tests__/campaignCreatorStats.test.ts
  modified:
    - web/src/components/campaigns/CampaignManager.tsx
    - web/src/app/(site)/kampagne/verwalten/page.tsx
decisions:
  - "D-01 to D-07 implemented as locked in the plan"
status: complete
commits: 4
plan_head_before: fe5e53e2ecc361e3fa0c7c0ffe1e2c53731d97b3
plan_head_after: 21d149c
actuals:
  tokens: 40000
  tasks: 3
  commits: 4
completed: 2026-10-08
---

# Phase quick-261008-rvm Plan 01: Kampagnen S3 Ersteller-Stats und Spendenkarte Summary

Creators of live, paused or ended campaigns now see on /kampagne/verwalten how many letters were written (always), a progress placeholder below 10 feedback responses, and at 10+ responses three per-KPI tiles (Abschickquote, Ø Bewertung, gefuehlte Wirksamkeit) with own N plus up to 5 consented comments (month/year only), followed by the S6 donation card. Pending, draft and blocked campaigns show neither.

## Commits

(`commits:` counts only this plan's commits. The range `fe5e53e..HEAD` also contains `quick-261008-s1m` commits from the parallel session.)

| Hash | Subject |
| --- | --- |
| 784d588 | feat(quick-261008-rvm): Ersteller-Stats auf Verwalten statt Briefe-Streifen |
| 622e93a | feat(quick-261008-rvm): Spendenkarte unter den Ersteller-Stats auf Verwalten |
| bd3e712 | fix(quick-261008-rvm): Stats-Ueberschrift bricht mobil nicht mehr mit Waisenwort |
| 21d149c | docs(quick-261008-rvm): Kampagnen-Todos S1 bis S3 nach completed verschoben |

## Exported API of creatorStats.ts (for S4)

`import "server-only"`. Stable names:

```ts
export const CREATOR_STATS_MIN_RESPONSES = 10;
export const CREATOR_COMMENT_LIMIT = 5;
export const CREATOR_COMMENT_MIN_LENGTH = 10; // text must be strictly longer
export const CREATOR_STATS_REVIEW_COLUMNS: string; // "created_at,rating,letter_sent,political_self_efficacy,body,consent"

export type CampaignFeedbackRow = { created_at; rating; letter_sent; political_self_efficacy; body; consent };
export type CreatorStatsKpi =
  | { status: "shown"; value: number; responses: number }
  | { status: "too_few"; responses: number };
export type CreatorStatsComment = { text: string; rating: number; monthLabel: string };
export type CampaignCreatorStatsView = {
  letterCount: number;
  liveSinceLabel: string | null; // "dd.MM.yyyy", Europe/Berlin
  ended: boolean;
  feedback:
    | { status: "unavailable" }
    | { status: "collecting"; responses: number; remaining: number; threshold: number }
    | { status: "ready"; responses: number; sendRate: CreatorStatsKpi; averageRating: CreatorStatsKpi; selfEfficacy: CreatorStatsKpi; comments: CreatorStatsComment[] };
};

export function buildCampaignCreatorStats(input: {
  rows: CampaignFeedbackRow[] | null; letterCount: number; activatedAt: string | null; ended: boolean;
}): CampaignCreatorStatsView; // pure

export function shouldShowCreatorInsights(
  campaign: Pick<Campaign, "status" | "activatedAt">, ended: boolean,
): boolean;

export async function getCampaignCreatorStats(
  campaign: Pick<Campaign, "slug" | "letterCount" | "activatedAt">, ended: boolean,
): Promise<CampaignCreatorStatsView>; // service-role read, never throws, degrades to "unavailable"
```

For a mail (S4) a caller can use `getCampaignCreatorStats(campaign, true)` and read `feedback.status === "ready"` plus the KPI values. The mail should respect the same threshold rules (do not print numbers when `collecting` or `too_few`).

## Deviations from Plan

- **Dev server:** another session's `next dev` was already running on port 3000 for this folder (Next refuses a second one). The screenshots were taken against that server on port 3000, which picked up the preview route. Not stopped, as it is not mine.
- **Screenshots:** the first full-page shots were illegible at 375 px, so the 8 PNGs are clipped to the stats block plus donation card at device scale 2 (via a small Playwright script in the scratchpad using the existing playwright-core and the installed Chrome; nothing installed).
- **Heading wrap fix:** review of the mobile shots showed an orphan "an" in "So kommt deine Kampagne an"; heading is now `text-lg text-balance` on mobile (bd3e712).
- **Preview route left in place:** per orchestrator instruction the temporary route is NOT deleted and NOT committed; the plan's "delete before commit/build" step and its verify check (route absent) are therefore intentionally open. `npm run build` was green with the route present. The orchestrator must delete `web/src/app/(site)/kampagne/verwalten/vorschau/`.
- **Default-branch commits:** the generic "refuse to commit on main" executor guard was not applied; the orchestrator ran this task on `main` and the repo is trunk-based.
- **Test-count baseline drift:** see check results.

## Preview route (uncommitted, orchestrator deletes)

File: `web/src/app/(site)/kampagne/verwalten/vorschau/page.tsx`

URLs (dev server on port 3000 is up now):
- http://localhost:3000/kampagne/verwalten/vorschau?variant=collecting-active
- http://localhost:3000/kampagne/verwalten/vorschau?variant=ready-active
- http://localhost:3000/kampagne/verwalten/vorschau?variant=collecting-ended
- http://localhost:3000/kampagne/verwalten/vorschau?variant=ready-ended

Fixtures are invented and PII-free. The route runs the real `buildCampaignCreatorStats`, with no DB access.

## Screenshots (untracked)

Directory `.planning/quick/261008-rvm-kampagnen-s3-ersteller-stats-und-spenden/screenshots/`:
`collecting-active-{mobile,desktop}.png`, `ready-active-{mobile,desktop}.png`, `collecting-ended-{mobile,desktop}.png`, `ready-ended-{mobile,desktop}.png` (mobile 375 px, desktop 1280 px). All eight were looked at. ready-ended shows the "Noch zu wenige Antworten" tile for Wirksamkeit (6 directional answers).

## Check results

- `npm --prefix web run test`: 97 passed, 1 failed suite. Tests 696 passed, 1 failed. Failing: `supportContent.test.ts` (founder text lacks "Zeit"), pre-existing, not fixed. Plan baseline was 2 failed suites / 655 passed; `letterSignalActions.test.ts` passes now (not touched by me, presumably fixed by the parallel session). New suite `campaignCreatorStats.test.ts`: 37 tests green; `internalStats*` still green.
- `npm --prefix web run lint`: 0 errors, 7 warnings (same count as baseline, none in new files).
- `npm --prefix web run build`: green (with the preview route present).
- `npx tsc --noEmit`: 4 errors, all pre-existing in `src/__tests__/campaignTopicReset.test.ts`; none in touched files.
- No em/en dash characters in the three new source files (grep clean) and in rendered markup (tested).
- Donation card is imported only by `kampagne/verwalten/page.tsx`.

## Open points for Thomas

1. **Migration 025 remote state is unverified.** Until `reviews.campaign_slug` exists remotely, the page degrades to the quiet "Die Rueckmeldungen lassen sich gerade nicht laden" line (letter count stays). Nothing was written to any DB.
2. **PostgREST caps responses at 1000 rows by default.** For a campaign with more than 1000 reviews the stats would use only the newest 1000. Accepted for now.
3. **S6 heading copy:** "Schoen, dass du eine Briefkampagne startest" (with the party emoji) reads oddly on an ended or long-running campaign. Copy was kept verbatim as planned; decide whether the Verwalten card needs its own heading.
4. **S6 todo** still sits in `.planning/todos/pending/` although S6 is merged; I moved only S1 to S3.
5. **Not touched:** `.planning/todos/pending/...s4-danke-mail-zum-kampagnenende.md` (modified by another session), the untracked research file and `...meilenstein-mails.md`.
6. Free-text comments may contain PII (accepted per D-04; consent wording allows showing to the initiative).

## Known Stubs

None.

## Threat Flags

None beyond the plan's threat model (service-role read limited to a whitelisted column list, covered by a Jest assertion).

## Self-Check: PASSED

- Files exist: creatorStats.ts, CampaignCreatorStats.tsx, CampaignDonationCard.tsx, campaignCreatorStats.test.ts, 8 screenshots.
- Commits 784d588, 622e93a, bd3e712, 21d149c are ancestors of HEAD.

## Orchestrator follow-up

- Nachbesserung nach Screenshot-Review (Commit siehe Log, `fix(quick-261008-rvm): KPI-Kacheln mobil als Zeilen ...`): KPI-Kacheln mobil als kompakte Zeilen, "Noch zu wenige Antworten"-Kachel mit gedämpftem Label statt schiefer Satzstellung, "Gestartet am" statt "Live seit" bei beendeten Kampagnen, Spendentext mobil in voller Breite.
- Temporäre Vorschauseite `web/src/app/(site)/kampagne/verwalten/vorschau/` gelöscht, nie committet. Screenshots neu erzeugt (8 PNGs, untracked).
- Finale Checks: Jest 1 failed / 696 passed (nur `supportContent.test.ts`, vorbestehend: erwartet "Zeit" in geänderter Founder-Copy), Lint 0 Fehler / 7 Warnungen, Build grün.

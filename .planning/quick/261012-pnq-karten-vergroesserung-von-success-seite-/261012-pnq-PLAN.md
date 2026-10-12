---
phase: quick-261012-pnq
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/components/letter-signals/LetterActivityCard.tsx
  - web/src/components/HowItWorksWithExample.tsx
  - web/src/components/FAQ.tsx
  - web/src/components/wizard/LetterSignalCard.tsx
  - web/src/__tests__/contributionMapZoom.test.ts
  - web/src/__tests__/landingPageContent.test.ts
autonomous: true
requirements: [D-01, D-02, D-03, D-04, D-05]

estimate:
  tokens: 45000
  raw_tokens: 45000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "D-01: On the landing page (/), both landing map cards (HowItWorksWithExample map panel and FAQ column) show the 'Vergrößern' badge and zoom-in cursor; tap/click opens the existing large ContributionMapDialog with the public map points and header count; closing returns focus to the map trigger"
    - "D-02: On the success page, LetterSignalCard renders the Germany map as a plain non-interactive display again: no trigger button, no magnifier badge, no dialog; consent button, fly animation, red own point, map label and consent copy unchanged"
    - "D-03: /stimmen renders LetterActivityCard without the enlarge interaction (opt-in prop not passed there)"
    - "D-04: Move, not redesign: trigger markup, badge and dialog are reused as they are; ContributionMapDialog, GermanyContributionMap and mapViewport are untouched; no new npm dependencies; no new user-facing copy"
    - "D-05: Only the files in files_modified are staged and committed; the untracked .claude/worktrees/ directory stays untouched"
  artifacts:
    - path: web/src/components/letter-signals/LetterActivityCard.tsx
      provides: "Opt-in `expandable` prop: map trigger button + Vergrößern badge + ContributionMapDialog"
      contains: "expandable"
    - path: web/src/components/wizard/LetterSignalCard.tsx
      provides: "Success-page contribution card with a plain map display (pre-zoom state)"
    - path: web/src/__tests__/contributionMapZoom.test.ts
      provides: "Render test for LetterActivityCard with/without expandable, source tests for landing trigger and plain success card"
    - path: web/src/__tests__/landingPageContent.test.ts
      provides: "Call-site assertions: landing usages pass expandable, /stimmen does not"
  key_links:
    - from: web/src/components/HowItWorksWithExample.tsx
      to: web/src/components/letter-signals/LetterActivityCard.tsx
      via: "<LetterActivityCard letterCount={letterCount} expandable />"
      pattern: "LetterActivityCard letterCount=\\{letterCount\\} expandable"
    - from: web/src/components/FAQ.tsx
      to: web/src/components/letter-signals/LetterActivityCard.tsx
      via: "<LetterActivityCard letterCount={letterCount} expandable />"
      pattern: "LetterActivityCard letterCount=\\{letterCount\\} expandable"
    - from: web/src/components/letter-signals/LetterActivityCard.tsx
      to: web/src/components/letter-signals/ContributionMapDialog.tsx
      via: "open/onClose state + triggerRef focus return, points/totalContributions/postcodeAreas from mapData"
      pattern: "ContributionMapDialog"
---

<objective>
Move the "tap map to enlarge" interaction from the success page to the landing page only.

User request (Thomas, verbatim intent): "Ich will diese Funktion ausschließlich auf der Landing Page, NICHT auf der Success Page."

Quick-task decisions derived from that request (no CONTEXT.md for this quick task):
- D-01: Enlarge interaction appears on the landing page map cards (HowItWorksWithExample map panel and FAQ), and nowhere else.
- D-02: Success page map (LetterSignalCard) goes back to a plain display, everything else on that card unchanged.
- D-03: /stimmen also uses LetterActivityCard and must NOT get the interaction, so it is an opt-in prop (`expandable`) passed only from the two landing call sites.
- D-04: Move, not redesign: reuse the existing trigger button, magnifier badge and ContributionMapDialog as they are.
- D-05: Atomic, scoped commit; preserve the untracked worktree directory.

Purpose: Thomas wants the zoomable map as a landing-page showcase, while the success page stays focused on the letter and the voluntary map contribution.
Output: LetterActivityCard with `expandable` prop wired on the landing; LetterSignalCard back to its pre-zoom state; tests updated to lock in the new placement.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@web/AGENTS.md

Verified facts (planner, 2026-10-12):
- LetterActivityCard.tsx is already a client component ("use client", useState/useEffect, loads data via loadPublicLetterMapData). No server/client split or wrapper component is needed; the interaction lives directly in the card behind the opt-in prop.
- Landing call sites: web/src/components/HowItWorksWithExample.tsx line 232 and web/src/components/FAQ.tsx line 68, both rendered from web/src/app/page.tsx (lines 55 and 59). /stimmen call site: web/src/app/(site)/stimmen/page.tsx line 237 (stays as is).
- The zoom feature was added in commit 97fb5d9 (quick 261011-lgc). That commit is the latest one touching LetterSignalCard.tsx and the file has no uncommitted changes, so `97fb5d9^` holds the exact pre-zoom version of the file.
- ContributionMapDialog props: open, onClose, points, ownPoint, ownVisible, totalContributions, postcodeAreas, reducedMotion. A closed dialog renders an empty `<dialog>` element without the MapViewer (no circles).
- GermanyContributionMap variant "landing" sizes itself `mx-auto h-auto w-full max-w-[18rem] md:max-w-[29rem]`; the compact variant used on the success page is capped at 13rem.
- Jest runs in node env (`web/jest.config.js`), renderToStaticMarkup works for these client components (existing tests already render GermanyContributionMap and ContributionMapDialog).
- Baseline: `cd web && npx jest src/__tests__/contributionMapZoom.test.ts src/__tests__/landingPageContent.test.ts src/__tests__/successPageExperience.test.ts` passes (3 suites, 34 tests).
- Baseline tsc: zero errors in src; the only errors come from Finder/iCloud duplicate files in the generated Next types folder (`routes.d 2.ts`, `validator 2.ts`, `cache-life.d 2.ts`). Those are pre-existing generated artifacts, out of scope; do not delete or edit them in this task.

Source of the markup to move: web/src/components/wizard/LetterSignalCard.tsx lines 34-35 (state + ref), 123-150 (trigger button + badge), 188-200 (dialog).
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Landing map cards get the enlarge trigger and dialog via opt-in `expandable` prop</name>
  <files>web/src/components/letter-signals/LetterActivityCard.tsx, web/src/components/HowItWorksWithExample.tsx, web/src/components/FAQ.tsx, web/src/__tests__/contributionMapZoom.test.ts, web/src/__tests__/landingPageContent.test.ts</files>
  <read_first>
    - web/src/components/letter-signals/LetterActivityCard.tsx (whole file, 65 lines)
    - web/src/components/wizard/LetterSignalCard.tsx lines 1-60, 120-152, 186-202 (markup and state to copy)
    - web/src/__tests__/contributionMapZoom.test.ts lines 1-30 and 140-240
    - web/src/__tests__/landingPageContent.test.ts lines 76-100
  </read_first>
  <behavior>
    - renderToStaticMarkup(LetterActivityCard, { letterCount: 10, expandable: true }) contains 'aria-label="Karte vergrößern"', 'aria-haspopup="dialog"', "cursor-zoom-in", "Vergrößern" and `<dialog`
    - renderToStaticMarkup(LetterActivityCard, { letterCount: 10 }) (no prop) contains "max-w-[18rem]" (landing map still rendered) but NOT "Karte vergrößern", NOT "cursor-zoom-in", NOT `<dialog`
    - HowItWorksWithExample.tsx and FAQ.tsx sources contain `<LetterActivityCard letterCount={letterCount} expandable />`
    - stimmen/page.tsx source still contains `<LetterActivityCard letterCount={letterCount} />` and does not contain "expandable"
  </behavior>
  <action>
    Implements D-01, D-03, D-04. UI skill note (project rule: frontend edits go through frontend-design): this is a 1:1 move of existing markup, not new design. Load `frontend-design:frontend-design` only to sanity-check badge placement and hover in the two landing contexts (mobile carousel panel, desktop FAQ column); do not restyle anything.

    RED first: extend the tests per the behavior block, run them, confirm the new LetterActivityCard and call-site assertions fail.
    - In contributionMapZoom.test.ts: import `LetterActivityCard` from "@/components/letter-signals/LetterActivityCard"; add a `describe("LetterActivityCard expand trigger", ...)` with the two render cases from the behavior block. In the existing `describe("map dialog sources", ...)`, point the card source at `src/components/letter-signals/LetterActivityCard.tsx` and rename the variable to `landingCardSource`; rename the test "wires the card trigger to the dialog" to "wires the landing card trigger to the dialog" and keep its five assertions plus `expect(landingCardSource).toContain("expandable")`; the em-dash check uses `landingCardSource`. Leave all other describes untouched.
    - In landingPageContent.test.ts: change the two call-site expectations for `workflowSource` and `faqSource` to the string with ` expandable` before the self-closing slash; keep the `voicesSource` expectation as it is and add `expect(voicesSource).not.toContain("expandable")`.

    GREEN:
    1. LetterActivityCard.tsx: change the signature to `{ letterCount, expandable = false }: { letterCount: number; expandable?: boolean }`. Import `useRef` alongside the existing React hooks and `ContributionMapDialog` from "./ContributionMapDialog" (relative, matching the existing `./GermanyContributionMap` import style).
    2. Add state `mapOpen` (false), `reducedMotion` (false) and `triggerRef = useRef<HTMLButtonElement>(null)`. Add the prefers-reduced-motion matchMedia effect copied from LetterSignalCard lines 54-60, with an early return when `expandable` is false and `[expandable]` as deps, so /stimmen does no extra work.
    3. Keep the existing GermanyContributionMap element exactly as it is (points, variant "landing", label) in a local const. Inside the existing loading-opacity div in the figure: when `expandable` is false render that element unchanged; when true wrap it in the trigger button copied verbatim from LetterSignalCard lines 123-150 (same ref, type, aria-haspopup, aria-label, onClick opening the dialog, same className), with the inner relative positioning span using `max-w-[18rem] md:max-w-[29rem]` instead of the compact 13rem cap so the map keeps its landing size and the badge hugs the map corner; the badge span (magnifier svg + "Vergrößern") is copied verbatim. figcaption attribution stays where it is.
    4. When `expandable` is true, render ContributionMapDialog after the figure inside the outer card div, with: open={mapOpen}; onClose sets mapOpen false and focuses triggerRef (same as LetterSignalCard); points={mapData.points}; ownPoint={null}; ownVisible={false}; totalContributions={mapData.totalContributions}; postcodeAreas={mapData.postcodeAreas}; reducedMotion={reducedMotion}. Discretion choice: the dialog header counts the plotted contributions (what the dots show), not `letterCount`; the card headline keeps using letterCount. This mismatch is flagged in the SUMMARY for Thomas, do not change the dialog.
    5. HowItWorksWithExample.tsx line 232 and FAQ.tsx line 68: add the `expandable` prop to the existing LetterActivityCard element. Do not touch web/src/app/(site)/stimmen/page.tsx.

    No new dependencies, no new copy, no changes to ContributionMapDialog.tsx, GermanyContributionMap.tsx or mapViewport.ts.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/contributionMapZoom.test.ts src/__tests__/landingPageContent.test.ts</automated>
  </verify>
  <done>Both suites pass. With `expandable` the landing card renders the trigger, badge and a closed dialog; without it (/stimmen) the card markup is the same as before. Both landing call sites pass `expandable`, /stimmen does not.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Success page map back to a plain display, tests lock in the removal</name>
  <files>web/src/components/wizard/LetterSignalCard.tsx, web/src/__tests__/contributionMapZoom.test.ts</files>
  <read_first>
    - web/src/__tests__/contributionMapZoom.test.ts describe "map dialog sources" (as left by Task 1)
  </read_first>
  <behavior>
    - LetterSignalCard.tsx source does not contain "ContributionMapDialog", "cursor-zoom-in", "Karte vergrößern" or 'aria-haspopup="dialog"'
    - LetterSignalCard.tsx source still contains "GermanyContributionMap", "ownPointState" and "Mein Anliegen auf die Karte setzen"
    - LetterSignalCard.tsx source contains no em dash
  </behavior>
  <action>
    Implements D-02 and D-04.

    RED: in contributionMapZoom.test.ts, inside describe "map dialog sources", add `successCardSource` reading `src/components/wizard/LetterSignalCard.tsx` and a test "keeps the success card map non-interactive" with the assertions from the behavior block (four `not.toContain`, three `toContain`). Extend the em-dash test to also check `successCardSource`. Run the suite and confirm the new test fails.

    GREEN: restore LetterSignalCard.tsx to its pre-zoom state. Preferred mechanism: confirm `git log -1 --format=%h -- web/src/components/wizard/LetterSignalCard.tsx` prints 97fb5d9 and `git diff --quiet -- web/src/components/wizard/LetterSignalCard.tsx` exits 0; if both hold, run `git show 97fb5d9^:web/src/components/wizard/LetterSignalCard.tsx > web/src/components/wizard/LetterSignalCard.tsx`. If either check fails, hand-edit instead: the loading-opacity div contains only the GermanyContributionMap element (points, ownPoint, ownPointState, reducedMotion, label unchanged) with no button, no positioning span and no badge; delete the mapOpen state, the trigger ref and the dialog element at the end of the section; drop the now-unused `useRef` import and the dialog import. Keep the reducedMotion state and its matchMedia effect: the fly animation of the own point still needs it.

    Do not touch the consent copy, the server action call, the contribution state machine or the Datenschutz link.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/contributionMapZoom.test.ts src/__tests__/landingPageContent.test.ts src/__tests__/successPageExperience.test.ts && cd .. && git diff --quiet 97fb5d9^ -- web/src/components/wizard/LetterSignalCard.tsx</automated>
  </verify>
  <done>All three suites pass and LetterSignalCard.tsx is byte-identical to its state before commit 97fb5d9 (if the hand-edit path was needed, the git diff check is replaced by the source assertions in the new test, and the SUMMARY says so).</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| public map API -> browser | Landing dialog renders the same aggregated public points already shown on the landing map (/api/letter-signals/map), no user input involved |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-pnq-01 | Information disclosure | LetterActivityCard dialog | low | accept | Dialog receives only mapData already public on the landing; ownPoint is null and ownVisible false, so no per-user location is shown |
| T-pnq-02 | Denial of service (client) | Two closed dialogs on the landing page | low | accept | A closed ContributionMapDialog renders an empty dialog element without MapViewer or circles (asserted by existing test "renders no circles while closed") |
| T-pnq-SC | Tampering | npm installs | high | mitigate | Plan installs no packages; any install need is out of scope and stops execution for Thomas to decide |
</threat_model>

<verification>
Run from repo root:
1. `cd web && npx jest` (full suite green; if Jest crashes with an "alias" error, that is iCloud-evicted files, fix with `brctl download <file>` per affected file, not a code issue)
2. `cd web && ! (npx tsc --noEmit 2>&1 | grep -v '^\.next/' | grep 'error TS')` (no TypeScript errors in src; the pre-existing duplicate generated Next type files are excluded and left alone)
3. `cd web && npx eslint src/components/letter-signals/LetterActivityCard.tsx src/components/wizard/LetterSignalCard.tsx src/components/HowItWorksWithExample.tsx src/components/FAQ.tsx`
4. `git status --short` shows only the six files in files_modified plus the pre-existing untracked `.claude/worktrees/`

Manual check for Thomas (not blocking): on `/` at 390px (map tab in the HowItWorks carousel) and 1280px (FAQ column) the map shows the "Vergrößern" badge at its bottom-right corner and opens the large view; on the success page the map is static; on /stimmen the map is static.
</verification>

<success_criteria>
- Landing page: both map cards are tappable and open the large zoomable map (D-01)
- Success page: map is a plain display, contribution flow unchanged (D-02)
- /stimmen: map unchanged and static (D-03)
- No new dependencies, dialog/map/viewport modules untouched, no new copy (D-04)
- Jest green, no src TypeScript errors, eslint clean on touched files, commit contains only the six listed files (D-05)
</success_criteria>

<output>
Create `.planning/quick/261012-pnq-karten-vergroesserung-von-success-seite-/261012-pnq-SUMMARY.md` when done. Include the open point for Thomas: the landing card headline counts all letters (letterCount) while the dialog header counts map contributions (totalContributions), so the two numbers on the landing differ.
</output>

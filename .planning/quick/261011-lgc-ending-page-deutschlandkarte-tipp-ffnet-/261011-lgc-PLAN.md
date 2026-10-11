---
phase: quick-261011-lgc
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/lib/letterSignals/mapViewport.ts
  - web/src/components/letter-signals/GermanyContributionMap.tsx
  - web/src/components/letter-signals/ContributionMapDialog.tsx
  - web/src/components/wizard/LetterSignalCard.tsx
  - web/src/app/globals.css
  - web/src/__tests__/contributionMapZoom.test.ts
autonomous: true
requirements: [D-01, D-02, D-03, D-04, D-05, D-06, D-07]

estimate:
  tokens: 110000
  raw_tokens: 110000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "D-01/D-06: On the ending page, the compact Germany map shows a visible 'Vergrößern' hint and zoom-in cursor; tap/click opens a large view (bottom sheet below 768px, centered panel from 768px) with an animated open/close that is instant under prefers-reduced-motion"
    - "D-02: In the large view, +/−/reset buttons, pinch, double-tap/double-click and wheel/trackpad-pinch zoom between 1x and 6x, drag pans, the view never leaves the Germany bounds, and dots shrink relative to distances so dense areas separate (strokes non-scaling)"
    - "D-03: If the user contributed, their red point stays highlighted in the large view; the header shows '{totalContributions} Briefe aus {postcodeAreas} PLZ-Gebieten' (de-DE formatted, singular forms handled)"
    - "D-04: Esc, close button, backdrop click and swipe-down on the mobile sheet all close the view; focus returns to the compact map trigger; native <dialog> provides the focus trap"
    - "D-05: Landing LetterActivityCard map renders unchanged (same viewBox, classes and radii at zoom 1); no new npm dependencies; data loading, server actions, DB and consent text untouched"
    - "D-07: Only files listed in files_modified are staged and committed; unrelated dirty files stay untouched"
  artifacts:
    - path: web/src/lib/letterSignals/mapViewport.ts
      provides: "Pure viewBox zoom/pan math, radius scaling, gesture thresholds, header count copy"
      exports: [MAP_MIN_ZOOM, MAP_MAX_ZOOM, parseViewBox, initialViewport, viewportWindow, clampViewport, zoomAt, panBy, viewBoxString, clientToMap, contributionPointRadius, scaledPointRadius, formatMapCounts, pinchStep, isDoubleTap, shouldDismissSheet, wheelZoomFactor]
    - path: web/src/components/letter-signals/ContributionMapDialog.tsx
      provides: "Native <dialog> large map view: zoom/pan, controls, mobile sheet, animated close"
    - path: web/src/__tests__/contributionMapZoom.test.ts
      provides: "Unit tests for viewport math + render/source tests for map, dialog, card"
  key_links:
    - from: web/src/components/wizard/LetterSignalCard.tsx
      to: web/src/components/letter-signals/ContributionMapDialog.tsx
      via: "mapOpen state + trigger button (aria-haspopup=dialog) wrapping the compact map"
      pattern: "ContributionMapDialog"
    - from: web/src/components/letter-signals/ContributionMapDialog.tsx
      to: web/src/components/letter-signals/GermanyContributionMap.tsx
      via: "variant expanded + viewBox + zoom props"
      pattern: "variant=\"expanded\""
    - from: web/src/components/letter-signals/ContributionMapDialog.tsx
      to: web/src/lib/letterSignals/mapViewport.ts
      via: "zoomAt / panBy / clampViewport / viewportWindow / clientToMap"
      pattern: "zoomAt\\("
---

<objective>
Make the Germany map on the ending page (LetterSignalCard) tappable: it opens a large view (modal on desktop, bottom sheet on mobile) where users can zoom and pan to see where letters come from, with their own red point still highlighted.

Purpose: the compact map (max 13rem) packs hundreds of dots into dense clusters; users cannot see their region. A zoomable view makes the "Briefe aus ganz Deutschland" signal tangible on the page where people just wrote a letter.
Output: pure viewport helper + tests, extended GermanyContributionMap (backwards compatible), new ContributionMapDialog, wired trigger on LetterSignalCard, open/close animations in globals.css.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@web/src/components/letter-signals/GermanyContributionMap.tsx
@web/src/components/wizard/LetterSignalCard.tsx
@web/src/components/letter-signals/LetterActivityCard.tsx
@web/src/components/campaigns/CampaignFixedRecipientBadge.tsx
@web/src/__tests__/successPageExperience.test.ts
@web/src/__tests__/heroCampaignPills.test.ts

Locked decisions (from the quick-task request, numbered D-01..D-07 in order given):
- D-01 Scope only LetterSignalCard. Tap/click opens fullscreen-ish modal (desktop) / bottom sheet (<768px). Smooth open/close, respects prefers-reduced-motion.
- D-02 Pinch-zoom, double-tap/double-click zoom, drag pan, visible + / − / reset buttons. viewBox manipulation + Pointer Events. Clamp zoom 1x-6x and pan to map bounds. Dot radii shrink with zoom; strokes non-scaling.
- D-03 Own red point stays highlighted; header shows "{totalContributions} Briefe aus {postcodeAreas} PLZ-Gebieten". German copy, no U+2014 em dash, solo-founder voice (first person singular only, never first-person plural).
- D-04 Close via Esc, close button, backdrop click, swipe-down on mobile sheet. Focus trap + focus return; native <dialog>.
- D-05 No new npm dependencies. No changes to data loading, server actions, DB, consent text. Topics-per-region is out of scope.
- D-06 Invoke the `frontend-design:frontend-design` skill (Skill tool) before writing UI code; use brand tokens waldgruen / waldgruen-dark / airmail-rot / warmgrau / creme / font-body. Subtle affordance on the compact map.
- D-07 Unrelated uncommitted changes exist (web/src/lib/email/*, web/src/lib/support-content.ts, web/src/app/api/generate-letter/route.ts, several web/src/__tests__/* files, untracked stats/campaigns/migration files from a parallel session). Never modify, stage or commit them. Stage only this plan's files by explicit path.

Codebase facts (verified at planning time):
- Jest runs in `testEnvironment: "node"`, `testMatch: **/src/__tests__/**/*.test.ts` (no .tsx test files). Components can be rendered with `renderToStaticMarkup` + `createElement` from a .ts test (pattern: heroCampaignPills.test.ts).
- GERMANY_MAP_VIEWBOX is "0 0 180 180" (square). Current dot radius formula is in GermanyContributionMap.tsx line 54; own point radii 3.2 (dot) and 3.4 (pulse halo).
- Existing native-dialog pattern with backdrop-rect click and focus return: CampaignFixedRecipientBadge.tsx.
- Dev-only success preview: `/app?preview=success` (WizardShell.tsx line 103) renders LetterSignalCard with contextToken "preview-token". Map points come from `/api/letter-signals/map` (web/.env.local exists).
- Baseline: `npx tsc --noEmit` currently FAILS on unrelated files (`.next/types/routes.d 2.ts` iCloud duplicate, dirty email files). Use the filtered tsc gate below. `npx eslint` on the map files is clean today.
- Brand tokens live in web/src/app/globals.css `@theme inline`; reduced-motion block at about line 183 lists animation classes that get `animation: none !important`.
</context>

<interfaces>
Contract for web/src/lib/letterSignals/mapViewport.ts (pure TS, no React/DOM imports). Executor implements exactly these names; Task 1 creates the first group, Task 2 adds the gesture group.

Types:
- MapBounds = { x: number; y: number; width: number; height: number }
- MapViewport = { cx: number; cy: number; scale: number }   (center in map units + zoom factor)
- MapPoint2D = { x: number; y: number }

Task 1 group:
- MAP_MIN_ZOOM = 1, MAP_MAX_ZOOM = 6, MAP_BUTTON_ZOOM_STEP = 1.6, POINT_RADIUS_ZOOM_EXPONENT = 0.7
- parseViewBox(viewBox: string): MapBounds
- initialViewport(bounds: MapBounds): MapViewport   -> bounds center, scale 1
- viewportWindow(viewport, bounds, aspect: number): MapBounds   -> visible window. At scale 1 the bounds are fitted "meet"-style into the stage aspect (aspect = stageWidth / stageHeight): if aspect >= bounds aspect then height = bounds.height and width = height * aspect, else width = bounds.width and height = width / aspect. Both divided by scale, centered on (cx, cy). Because the window aspect equals the stage aspect, there is no letterboxing.
- clampViewport(viewport, bounds, aspect): MapViewport   -> scale clamped to [MAP_MIN_ZOOM, MAP_MAX_ZOOM]; per axis: if window dimension >= bounds dimension, center = bounds center on that axis; else center clamped to [boundsMin + dim/2, boundsMax - dim/2]
- zoomAt(viewport, factor, focal: MapPoint2D, bounds, aspect): MapViewport   -> newScale = clamp(scale * factor); ratio = newScale / scale; newCenter = focal + (center - focal) / ratio; then clampViewport. The focal map point keeps its screen position unless clamping intervenes.
- panBy(viewport, dx, dy, bounds, aspect): MapViewport   -> content follows the finger: center minus (dx, dy) in map units, then clampViewport
- viewBoxString(window: MapBounds): string   -> "x y w h", each rounded to 3 decimals
- clientToMap(clientX, clientY, rect: {left; top; width; height}, window: MapBounds): MapPoint2D   -> linear mapping; zero-size rect returns the window center
- contributionPointRadius(count: number): number   -> exactly the current formula moved from GermanyContributionMap line 54
- scaledPointRadius(radius: number, zoom: number): number   -> radius / max(zoom, 1) ** POINT_RADIUS_ZOOM_EXPONENT (at zoom 1 returns radius unchanged; on screen dots grow by zoom^0.3 while distances grow by zoom)
- formatMapCounts(total: number, areas: number): string   -> total 0: "Noch keine Punkte auf der Karte"; else `${de-DE total} ${total === 1 ? "Brief" : "Briefe"} aus ${de-DE areas} ${areas === 1 ? "PLZ-Gebiet" : "PLZ-Gebieten"}`

Task 2 group:
- DOUBLE_TAP_ZOOM = 2, DOUBLE_TAP_MAX_DELAY_MS = 320, DOUBLE_TAP_MAX_DISTANCE_PX = 28, TAP_MAX_MOVE_PX = 8, SHEET_DISMISS_DISTANCE_PX = 110, SHEET_DISMISS_MIN_DISTANCE_PX = 32, SHEET_DISMISS_VELOCITY = 0.5 (px per ms)
- pinchStep(prevA, prevB, nextA, nextB: MapPoint2D): { factor: number; prevMidpoint: MapPoint2D; nextMidpoint: MapPoint2D }   -> factor = dist(next) / dist(prev); prev distance 0 gives factor 1
- isDoubleTap(previous: { time: number; x: number; y: number } | null, current: same shape): boolean
- shouldDismissSheet(dragDistancePx: number, velocityPxPerMs: number): boolean   -> distance >= 110, or distance >= 32 and velocity >= 0.5
- wheelZoomFactor(deltaY: number, deltaMode: number, ctrlKey: boolean): number   -> Math.exp(-deltaY * k), k = 0.01 when ctrlKey (trackpad pinch), 0.06 when deltaMode === 1 (lines), else 0.0025; result clamped to [0.5, 2]

GermanyContributionMap new optional props (Task 1): viewBox?: string (default GERMANY_MAP_VIEWBOX), zoom?: number (default 1), variant adds "expanded".
ContributionMapDialog props (Task 1): open: boolean; onClose: () => void; points: LetterMapPoint[]; ownPoint: { x: number; y: number } | null; ownVisible: boolean; totalContributions: number; postcodeAreas: number; reducedMotion: boolean.
</interfaces>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Tracer - tap compact map opens native dialog with button zoom (helper -> map -> dialog -> card)</name>
  <files>web/src/lib/letterSignals/mapViewport.ts, web/src/components/letter-signals/GermanyContributionMap.tsx, web/src/components/letter-signals/ContributionMapDialog.tsx, web/src/components/wizard/LetterSignalCard.tsx, web/src/__tests__/contributionMapZoom.test.ts</files>
  <behavior>
    - parseViewBox("0 0 180 180") returns {x:0,y:0,width:180,height:180}; initialViewport returns {cx:90,cy:90,scale:1}
    - viewportWindow: aspect 1 scale 1 gives 0/0/180/180; aspect 0.5 scale 1 gives width 180, height 360, y -90; aspect 1 scale 2 gives width 90
    - clampViewport: scale 10 becomes 6, scale 0.5 becomes 1; at scale 2 aspect 1 a center of cx 170 is clamped to 135
    - zoomAt: the focal point keeps its relative position in the window ((focal - window.x) / window.width unchanged) when not clamped; zooming past 6 stays at 6
    - panBy at scale 1 aspect 1 leaves the center unchanged; at scale 3 it moves the center by minus dx
    - viewBoxString rounds to 3 decimals; clientToMap with rect 300x300 and window 0 0 180 180 maps client (150,150) to (90,90)
    - contributionPointRadius(1) equals Math.min(2.5, 0.75 + Math.log2(2) * 0.32) and a huge count caps at 2.5; scaledPointRadius(r, 1) === r; scaledPointRadius(r, 4) < r and scaledPointRadius(r, 4) * 4 > r
    - formatMapCounts(0, 0), (1, 1) -> "1 Brief aus 1 PLZ-Gebiet", (1234, 56) -> "1.234 Briefe aus 56 PLZ-Gebieten"
    - Render (renderToStaticMarkup): compact default still has viewBox "0 0 180 180", class max-w-[13rem], and r equal to String(contributionPointRadius(count)); landing still has max-w-[18rem]; expanded with zoom 4 and a custom viewBox uses that viewBox, class h-full w-full, and r equal to String(scaledPointRadius(contributionPointRadius(count), 4))
    - Render ContributionMapDialog open=true (2 points, ownPoint, ownVisible, total 3, areas 2): markup contains "3 Briefe aus 2 PLZ-Gebieten", aria-labels "Karte schließen", "Hineinzoomen", "Herauszoomen", "Ansicht zurücksetzen", the legend "Dein Anliegen", and fill-airmail-rot; open=false renders no circle element
    - Source: LetterSignalCard contains ContributionMapDialog, aria-haspopup="dialog", "Karte vergrößern", cursor-zoom-in, "Vergrößern"; ContributionMapDialog and LetterSignalCard contain no U+2014 (assert with the JS unicode escape sequence backslash-u-2014, never the literal character) and the dialog source has no standalone first-person-plural pronoun (case-insensitive word-boundary regex built from escapes or string concatenation so the test file itself stays clean)
  </behavior>
  <action>
Start by invoking the Skill tool with `frontend-design:frontend-design` (D-06) and apply its guidance strictly inside the existing brand tokens (waldgruen, waldgruen-dark, airmail-rot, warmgrau, creme, font-body); state in the SUMMARY that it was used. Write the test file first (RED), then implement (GREEN).

1. Create web/src/lib/letterSignals/mapViewport.ts with the Task 1 group from the interfaces block, exact names and semantics (D-02 clamp 1x-6x, pan clamp to bounds). Pure functions only, no React or DOM imports.

2. GermanyContributionMap.tsx: add optional props viewBox (default GERMANY_MAP_VIEWBOX), zoom (default 1) and variant "expanded" (svg class block h-full w-full). Replace the inline radius formula with scaledPointRadius(contributionPointRadius(point.count), zoom); own point radii 3.2 and 3.4 go through scaledPointRadius too, and the pulse animate values scale by the same factor. Only in the expanded variant: dots get a thin creme separation stroke and the own point gets a white ring, every stroke with vectorEffect non-scaling-stroke (D-02). Compact and landing output must stay identical at zoom 1 (same viewBox, classes, r values), because LetterActivityCard must keep working unchanged (D-05). Do not edit LetterActivityCard.tsx.

3. Create web/src/components/letter-signals/ContributionMapDialog.tsx ("use client") with the props from the interfaces block. Follow the CampaignFixedRecipientBadge native-dialog pattern (D-04): call showModal() in an effect when open turns true and the dialog is not already open; aria-labelledby a useId title. Render header, stage and controls only while open is true (Task 2 adds an internal closing flag to this condition) so the closed dialog carries no circles and the own-point pulse replays on open. Header: h2 "Woher die Briefe kommen"; counts line from formatMapCounts (D-03); legend with a red dot and "Dein Anliegen" only when ownVisible; close button with an X icon, aria-label "Karte schließen", autoFocus. Stage: a flex-1 relative overflow-hidden div observed by a ResizeObserver (in an effect) that stores aspect = width / height (default 1); it renders GermanyContributionMap with variant "expanded", viewBox = viewBoxString(viewportWindow(viewport, bounds, aspect)), zoom = viewport.scale, ownPointState "contributed" when ownVisible else "idle", reducedMotion passed through, and a German aria label built from formatMapCounts. Bounds come from parseViewBox(GERMANY_MAP_VIEWBOX). Controls: role="group" aria-label "Kartenansicht", placed bottom-right over the stage, three buttons with at least 44px tap targets: "Hineinzoomen" (+), "Herauszoomen" (U+2212 minus glyph), "Ansicht zurücksetzen" (reset icon); zoom via zoomAt(viewport, MAP_BUTTON_ZOOM_STEP or its inverse, current center, ...); + disabled at MAP_MAX_ZOOM, minus and reset disabled at scale 1. Reset the viewport to initialViewport every time the dialog opens and re-clamp when aspect changes. One requestClose() function is called by the close button, by onCancel (Esc: preventDefault, then requestClose) and by a backdrop click; count a click as backdrop only if the pointerdown also started on the dialog element itself outside the inner panel rect (so a pan that ends over the backdrop does not close). In this task requestClose calls dialog.close() directly. The native close event calls onClose; keep it idempotent. Never touch window or document during render (SSR and the node test render it).

4. LetterSignalCard.tsx: add mapOpen state and a triggerRef. Wrap the existing map container in a button type="button" with aria-haspopup="dialog", aria-label "Karte vergrößern", cursor-zoom-in, focus-visible outline in waldgruen, and a subtle hover (slight lift or border tint). Overlay a small pill at the bottom-right of the map: magnifier-plus inline SVG plus the word "Vergrößern" (font-body, about 11px, semibold, text-waldgruen, creme background, waldgruen/20 border) (D-06). Keep the existing loading pulse classes on the map wrapper. Render ContributionMapDialog with mapData.points, ownPoint, ownVisible = state is "flying" or "contributed", mapData.totalContributions, mapData.postcodeAreas, reducedMotion; onClose sets mapOpen false and focuses triggerRef (D-04). Leave all existing copy, the consent paragraph, createLetterSignalAction usage and loadPublicLetterMapData untouched (D-05). Keep every string asserted by successPageExperience.test.ts and do not add the class that test negative-asserts at line 54.

5. Create web/src/__tests__/contributionMapZoom.test.ts covering every behavior bullet above (unit tests for mapViewport, render tests with createElement + renderToStaticMarkup, source assertions via readFileSync like successPageExperience.test.ts).

6. Commit (D-07): stage exactly the five files of this task with explicit paths (never git add -A, git add ., or commit -a), confirm with git diff --cached --name-only, then commit "feat(quick-261011-lgc): Abschluss-Karte öffnet große Ansicht mit Zoom-Buttons". Do not push.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/contributionMapZoom.test.ts src/__tests__/successPageExperience.test.ts && npx eslint src/lib/letterSignals/mapViewport.ts src/components/letter-signals/GermanyContributionMap.tsx src/components/letter-signals/ContributionMapDialog.tsx src/components/wizard/LetterSignalCard.tsx src/__tests__/contributionMapZoom.test.ts && ! npx tsc --noEmit 2>&1 | grep -E "(letter-signals/|letterSignals/|LetterSignalCard|contributionMapZoom)"</automated>
  </verify>
  <done>Tests green (new + successPageExperience); eslint clean on touched files; tsc reports no errors in any touched file; clicking the compact map opens the dialog, +/−/reset change the viewBox within 1x-6x, close button, Esc and backdrop click close it and focus returns to the trigger; commit contains only the five task files.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Gestures, mobile bottom sheet with swipe-down, animated open/close</name>
  <files>web/src/lib/letterSignals/mapViewport.ts, web/src/components/letter-signals/ContributionMapDialog.tsx, web/src/app/globals.css, web/src/__tests__/contributionMapZoom.test.ts</files>
  <behavior>
    - pinchStep: fingers moving from 100px apart to 200px apart gives factor 2 and the correct midpoints; identical prev points give factor 1
    - isDoubleTap: null previous -> false; 200ms and 10px apart -> true; 400ms apart -> false; 40px apart -> false
    - shouldDismissSheet: (120, 0) true; (40, 0.8) true; (40, 0.2) false; (20, 2) false
    - wheelZoomFactor: negative deltaY > 1, positive < 1, ctrlKey zooms faster per delta than plain pixel mode, extreme deltas clamp to [0.5, 2]
    - Source: ContributionMapDialog contains setPointerCapture, passive: false, gesturestart, requestAnimationFrame, data-state, onCancel, and a matchMedia query for max-width 767.98px
    - globals.css: every new map dialog/sheet animation class name appears in the region between "@media (prefers-reduced-motion: reduce)" and the following "animation: none !important" (region-scoped substring check)
  </behavior>
  <action>
Keep following the frontend-design skill guidance from Task 1 (D-06). Write the new test cases first.

1. mapViewport.ts: add the Task 2 group from the interfaces block (constants, pinchStep, isDoubleTap, shouldDismissSheet, wheelZoomFactor).

2. Gestures on the dialog stage (D-02): stage gets touch-none and select-none, cursor-grab with active:cursor-grabbing when scale is above 1. Pointer Events: on pointerdown call setPointerCapture and track pointers in a ref Map of client coordinates. One pointer: pan by the difference between clientToMap(previous) and clientToMap(current) using the current window and the stage rect. Two pointers: pinchStep, then zoomAt with its factor at clientToMap(nextMidpoint) plus a pan by the midpoint delta. pointerup and pointercancel remove the pointer. A gesture that never moved more than TAP_MAX_MOVE_PX and never had two pointers is a tap; if isDoubleTap matches the last tap, zoomAt DOUBLE_TAP_ZOOM at the tap point, or reset to initialViewport when already at MAP_MAX_ZOOM. Mouse double-click goes through the same tap path; do not also bind onDoubleClick (would fire twice). Wheel: attach a native wheel listener with passive: false in an effect, preventDefault, zoomAt wheelZoomFactor at the cursor; this also covers macOS trackpad pinch, which arrives as ctrlKey wheel and would otherwise zoom the whole page. Safari: native gesturestart and gesturechange listeners on the stage with preventDefault. Keep the latest viewport in a ref and commit it to React state at most once per requestAnimationFrame so hundreds of circles do not re-render on every pointermove. Button and double-tap zooms ease over about 180ms via requestAnimationFrame interpolation of cx, cy, scale; with reducedMotion they apply instantly. Gestures always apply directly. Cancel pending frames on unmount.

3. Responsive layout (D-01): below md the dialog is a bottom sheet (full width, anchored to the bottom, height about 88dvh, rounded top corners, a centered drag-handle bar, bottom padding with env(safe-area-inset-bottom)); from md it is a centered panel of about min(92vw, 60rem) by min(88dvh, 48rem) with rounded-2xl. Override the UA dialog styles (margin, max-width, max-height, padding, border). Backdrop in waldgruen-dark at about 45 percent with a light blur. overscroll-contain on the dialog.

4. Swipe-down (D-04): pointer handlers on the sheet header and handle (touch-none there), active only when window.matchMedia("(max-width: 767.98px)") matches (read inside the handler, not during render). Follow the finger downward only by writing translateY directly to the dialog element style (no React state per move). On release, shouldDismissSheet with distance and velocity decides requestClose; otherwise snap back with a short transition (none under reducedMotion).

5. Animations (D-01): in web/src/app/globals.css add keyframes and classes for sheet slide-up and slide-down, desktop fade plus slight scale in and out, and backdrop fade in and out (the ::backdrop pseudo-element), driven by a data-state attribute ("open" or "closing") on the dialog; sheet keyframes apply below 768px and panel keyframes from 768px via media queries. Add every new animation class to the existing prefers-reduced-motion block next to the other animate-* classes. requestClose now: with reducedMotion call dialog.close() immediately; otherwise set an internal closing flag (keeps the content mounted, sets data-state closing) and call dialog.close() after the out-animation duration (about 220ms) via a timeout; do not rely only on animationend. Reset the closing flag in the close handler; clear timers on unmount.

6. Scroll lock: while the dialog is open set document.documentElement.style.overflow to hidden and restore the previous value on close and unmount.

7. Footer inside the dialog: a hint line, mobile "Mit zwei Fingern zoomen, doppelt tippen für mehr Nähe." and desktop "Mausrad oder Doppelklick zum Zoomen, ziehen zum Verschieben." (switch with md:hidden / hidden md:inline), plus the map attribution in tiny warmgrau text using a local constant with exactly the same text as SHORT_MAP_ATTRIBUTION in LetterActivityCard.tsx (copy the text; do not edit LetterActivityCard.tsx, D-05). All copy German, du-form, no U+2014, first person singular if a personal voice is used at all (D-03). Check the copy against the project's signs-of-AI-writing habit (short, concrete, no filler).

8. Commit (D-07): stage exactly the four files of this task with explicit paths, confirm with git diff --cached --name-only, commit "feat(quick-261011-lgc): Karten-Gesten, Bottom-Sheet und Animationen". Do not push.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/contributionMapZoom.test.ts src/__tests__/successPageExperience.test.ts && npx eslint src/lib/letterSignals/mapViewport.ts src/components/letter-signals/ContributionMapDialog.tsx src/__tests__/contributionMapZoom.test.ts && ! npx tsc --noEmit 2>&1 | grep -E "(letter-signals/|letterSignals/|LetterSignalCard|contributionMapZoom)"</automated>
  </verify>
  <done>New gesture-helper and region-scoped CSS tests green; drag pans, pinch and wheel zoom around the finger/cursor, double-tap/double-click zooms and resets at max; below 768px the view is a bottom sheet that closes on swipe-down; open/close animate and are instant under prefers-reduced-motion; page does not scroll behind the open dialog; commit contains only the four task files.</done>
</task>

<task type="auto">
  <name>Task 3: Verify in the dev preview at mobile and desktop, fix what is off</name>
  <files>web/src/components/letter-signals/ContributionMapDialog.tsx, web/src/components/letter-signals/GermanyContributionMap.tsx, web/src/components/wizard/LetterSignalCard.tsx, web/src/app/globals.css (only if a check below fails)</files>
  <action>
1. Run the gates: the Task 1 verify command, `cd web && npx jest` (full suite), `git diff --quiet -- web/package.json web/package-lock.json` (D-05: no dependency change) and `git diff --quiet -- web/src/lib/actions web/src/lib/letterSignals/publicMapClient.ts web/src/lib/letterSignals/getPublicMapData.ts web/src/components/letter-signals/LetterActivityCard.tsx` (D-05: data path and landing consumer untouched). Full-suite or tsc failures in files outside this plan (for example the dirty email tests or `.next/types/* 2.ts` iCloud duplicates) are reported in the SUMMARY, not fixed (D-07).

2. Start the dev server via the Claude Preview launch config "web" (.claude/launch.json) and open /app?preview=success (dev-only success preview). Do NOT click "Mein Anliegen auf die Karte setzen" in the preview: it calls the real server action and would try to write a signal; the own-point highlight is covered by the Task 1 render test.

3. Desktop at about 1280x800: screenshot the compact map with the "Vergrößern" hint and zoom-in cursor; click it and screenshot the centered panel; press + twice, drag to pan, double-click, use the wheel, confirm that dense areas (Ruhrgebiet, Berlin, Rhein-Main) separate into distinguishable dots and the view cannot be dragged off Germany; reset; press Esc and confirm via an eval of document.activeElement that focus is back on the "Karte vergrößern" button; reopen and close via backdrop click and via the close button.

4. Mobile at 375x812: tap the map, screenshot the bottom sheet; check that controls are reachable with the thumb and nothing overlaps the safe area; drag the handle down past the threshold and confirm it closes; reopen and close via backdrop tap. If the preview tool can emulate prefers-reduced-motion, confirm open/close is instant; otherwise rely on the region-scoped CSS test and say so in the SUMMARY.

5. Open / (landing) and confirm the LetterActivityCard map looks as before (screenshot).

6. Fix any visual or behavior issue found, only inside this plan's files, re-run the Task 1 verify command, then commit with explicit paths "fix(quick-261011-lgc): ..." (D-07). If nothing needed fixing, make no commit. Stop the dev server.

7. In the SUMMARY list the screenshots taken, what was verified in the preview, and the remaining gap: real two-finger pinch and swipe-down on a physical iPhone and Android device were not tested (preview cannot simulate multi-touch) and are a manual check for Thomas.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/contributionMapZoom.test.ts src/__tests__/successPageExperience.test.ts && npx eslint src/lib/letterSignals/mapViewport.ts src/components/letter-signals/GermanyContributionMap.tsx src/components/letter-signals/ContributionMapDialog.tsx src/components/wizard/LetterSignalCard.tsx src/__tests__/contributionMapZoom.test.ts && ! npx tsc --noEmit 2>&1 | grep -E "(letter-signals/|letterSignals/|LetterSignalCard|contributionMapZoom)" && cd .. && git diff --quiet -- web/package.json web/package-lock.json web/src/lib/actions web/src/lib/letterSignals/publicMapClient.ts web/src/lib/letterSignals/getPublicMapData.ts web/src/components/letter-signals/LetterActivityCard.tsx</automated>
  </verify>
  <done>All gates pass; desktop and 375px screenshots show the affordance, the opened view, a zoomed dense area and the closed state with focus returned; landing map unchanged; SUMMARY lists screenshots, unrelated pre-existing failures and the real-device multi-touch gap.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| public map API -> browser | Aggregated, already-public map points from /api/letter-signals/map; unchanged by this plan |
| user gestures -> client state | Pointer, wheel and keyboard input drive local viewport state only; nothing leaves the browser |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261011-lgc-01 | Information disclosure | ContributionMapDialog | low | accept | Shows only the same public aggregated points as the compact map plus the user's own point in their own browser; no new fetch, storage or logging (D-05, verified by git diff gate in Task 3) |
| T-261011-lgc-02 | Denial of service (client) | gesture handlers in ContributionMapDialog | low | mitigate | Viewport commits batched per requestAnimationFrame, zoom clamped to 1x-6x, per-event wheel factor clamped to [0.5, 2], timers and frames cancelled on unmount |
| T-261011-lgc-03 | Tampering | dialog close path | low | mitigate | Backdrop close only when pointerdown and click both hit the backdrop, so a pan ending outside the panel cannot dismiss; native dialog keeps focus trapped |
| T-261011-lgc-SC | Tampering | npm installs | high | mitigate | No package installs planned (D-05); Task 3 gate fails if web/package.json or web/package-lock.json changed |
</threat_model>

<verification>
- `cd web && npx jest src/__tests__/contributionMapZoom.test.ts src/__tests__/successPageExperience.test.ts` green
- eslint clean on all touched files; filtered tsc gate shows no error in touched files
- No diff in web/package.json, web/package-lock.json, server actions, map data loaders, LetterActivityCard.tsx
- `git log -3 --stat` shows only this plan's files in the quick-261011-lgc commits; `git status --short` still lists the unrelated dirty files untouched
- Desktop and 375px preview screenshots captured as described in Task 3
</verification>

<success_criteria>
- Tapping the ending-page map opens a large, zoomable, pannable Germany map (sheet on mobile, panel on desktop) with smooth, reduced-motion-aware transitions (D-01, D-02)
- Own red point highlighted and header counts shown in German (D-03)
- All four close paths work and focus returns to the trigger (D-04)
- Landing map, data flow, consent text and dependencies unchanged (D-05)
- frontend-design skill used, brand tokens followed, compact map shows a "Vergrößern" affordance (D-06)
- Only plan files committed (D-07)
</success_criteria>

<output>
Create `.planning/quick/261011-lgc-ending-page-deutschlandkarte-tipp-ffnet-/261011-lgc-SUMMARY.md` with `status: complete` in its frontmatter when done. Do not commit PLAN/SUMMARY/STATE (the orchestrator does the docs commit).
</output>

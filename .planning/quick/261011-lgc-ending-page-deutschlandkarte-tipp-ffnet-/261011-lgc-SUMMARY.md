---
phase: quick-261011-lgc
plan: 01
subsystem: ending-page map
tags: [map, zoom, dialog, gestures, mobile-sheet]
status: complete
requirements-completed: [D-01, D-02, D-03, D-04, D-05, D-06, D-07]
key-files:
  created:
    - web/src/lib/letterSignals/mapViewport.ts
    - web/src/components/letter-signals/ContributionMapDialog.tsx
    - web/src/__tests__/contributionMapZoom.test.ts
  modified:
    - web/src/components/letter-signals/GermanyContributionMap.tsx
    - web/src/components/wizard/LetterSignalCard.tsx
    - web/src/app/globals.css
commits: 2
plan_head_before: 9d7960e5ffe11cd16c01599bc1097021de6b7a4c
plan_head_after: 78ca14b3250f4e9b55bdef2fb28405b9538a06a3
actuals:
  tokens: 28000
  tasks: 3
  commits: 2
---

# Quick 261011-lgc: Zoombare Deutschlandkarte auf der Abschlussseite

Die kompakte Karte in `LetterSignalCard` ist jetzt antippbar und oeffnet eine grosse, zoom- und verschiebbare Ansicht (Bottom-Sheet unter 768px, zentriertes Panel darueber) mit Pointer-Events-Gesten, ohne neue Dependencies.

## Commits

- `97fb5d9` feat(quick-261011-lgc): Abschluss-Karte oeffnet grosse Ansicht mit Zoom-Buttons (Task 1, Tracer)
- `78ca14b` feat(quick-261011-lgc): Karten-Gesten, Bottom-Sheet und Animationen (Task 2)
- Task 3: kein Fix noetig, daher kein Commit.

## What was built

- `mapViewport.ts`: reine viewBox-Mathematik (Zoom 1x bis 6x, Pan-Clamp auf Deutschland-Bounds, Radius-Skalierung, Pinch/Doppeltipp/Wisch/Wheel-Helfer, Zaehl-Text mit Singularformen).
- `GermanyContributionMap`: neue optionale Props `viewBox`, `zoom`, Variante `expanded` (creme Trennstrich an Punkten, weisser Ring am eigenen Punkt, alle Striche non-scaling). Compact und Landing sind bei Zoom 1 unveraendert (im Browser geprueft: gleiche Klassen/viewBox).
- `ContributionMapDialog`: natives `<dialog>`, Header "Woher die Briefe kommen" + "{n} Briefe aus {m} PLZ-Gebieten", Legende "Dein Anliegen", Buttons +/-/Reset (44px), Ziehen, Pinch, Mausrad/Trackpad-Pinch, Doppeltipp/Doppelklick (2x, am Maximum Reset), Safari-Gesture-Events abgefangen, rAF-gebatchte State-Commits, 180ms-Easing (sofort bei reduced motion), Esc/Schliessen/Backdrop/Wisch-nach-unten, Scroll-Lock, Fokus-Rueckgabe auf den Trigger.
- `LetterSignalCard`: Karte in Button (`aria-haspopup="dialog"`, `cursor-zoom-in`, Hover-Lift) mit "Vergroessern"-Pill. Texte, Consent, Server Action und Datenladen unveraendert.
- `globals.css`: Keyframes und Klassen `.map-dialog-sheet`, `.map-dialog-panel`, `.map-dialog-backdrop`, alle im `prefers-reduced-motion`-Block auf `animation: none`.
- Design: frontend-design-Skill wurde vor dem UI-Code aufgerufen. Bewusst innerhalb der Brand-Tokens; einziger Akzent ist der Airmail-Streifen oben am Dialog (Marken-Motiv statt neuer Dekoration), sonst ruhig.

## Verification (honest)

- Jest: `contributionMapZoom` + `successPageExperience` gruen (29 Tests); komplette Suite 122 Suites / 1074 Tests gruen.
- ESLint auf allen 5 Code-Dateien + Test: sauber.
- `tsc --noEmit` gefiltert auf Plan-Dateien: keine Fehler. Der ungefilterte tsc-Lauf wurde nicht als Gate genutzt (Baseline schon vorher rot wegen fremder Dateien).
- D-05-Gate (`git diff --quiet` auf package.json, lock, actions, publicMapClient, getPublicMapData, LetterActivityCard): sauber.
- Unrelated dirty files unveraendert, nichts davon gestaged oder committet.

### Browser-Pruefung (Playwright-core mit Chrome gegen bereits laufenden Dev-Server :3011, `/app?preview=success`)

Desktop 1280x800:
- Cursor `zoom-in`, "Vergroessern"-Pill sichtbar, Dialog oeffnet, Header zeigt "2.086 Briefe aus 1.514 PLZ-Gebieten".
- +/+ , Reset, 14x Mausrad-Zoom bis 6x: Dichte Regionen trennen sich in einzelne Punkte; riesiger Drag klemmt an den Bounds; Doppelklick zoomt, zweiter Doppelklick bei 6x setzt zurueck.
- Esc, Backdrop-Klick, Schliessen-Button schliessen; `document.activeElement` ist danach der "Karte vergroessern"-Button; Scroll-Lock auf `html` gesetzt und wieder entfernt.
- Drag, der ueber dem Backdrop endet, schliesst NICHT.
- Reduced motion (Emulation): Dialog nach 30ms nach Esc zu (instant).
- Keine Konsolen- oder pageerror-Meldungen.

Mobil 375x812 (Touch-Emulation inkl. CDP-Touch-Events):
- Sheet verankert unten, Controls erreichbar (rechts unten, 46px breit), Safe-Area-Padding gesetzt.
- Zwei-Finger-Pinch (CDP, 2 Touchpoints) zoomt auf 5x, Ein-Finger-Pan verschiebt, Doppeltipp zoomt 2x.
- Kleiner Wisch (32px) springt zurueck, grosser Wisch schliesst; Backdrop-Tap schliesst; Wiederoeffnen startet mit Reset-Viewport.

Landing `/`: LetterActivityCard-Karte unveraendert (Klasse `max-w-[18rem] md:max-w-[29rem]`, kein Button-Wrapper).

Nicht geklickt: "Mein Anliegen auf die Karte setzen". Der rote eigene Punkt im Dialog ist daher nur per Render-Test abgedeckt, nicht live gesehen.

### Screenshots (alle in diesem Ordner)

- `desktop-1-compact.png`, `desktop-1b-page.png`: kompakte Karte mit Pill
- `desktop-2-open.png`: Panel offen
- `desktop-3-zoomed-dense.png`: 6x Zoom
- `desktop-4-dragged-clamped.png`: nach Extrem-Drag
- `mobile-1-compact.png`, `mobile-2-sheet.png`, `mobile-3-pinched.png`, `mobile-4-swiping.png`
- `landing-map-unchanged.png`

## Deviations from Plan

- [Rule 3] Responsive Layout (Sheet/Panel) kam teils schon im Tracer-Commit; Task 2 hat es final gemacht. Kein Verhaltensunterschied.
- Pinch-Mathe: Zoom am vorherigen Mittelpunkt plus Pan um das Mittelpunkt-Delta statt Zoom am neuen Mittelpunkt, weil der Punkt unter den Fingern dadurch exakt haelt.
- Safari `gesturechange` zoomt zusaetzlich, aber nur wenn kein Pointer aktiv ist (Desktop-Trackpad), sonst nur `preventDefault`, damit iOS nicht doppelt zoomt.
- Plan-Text nannte U+2212 fuer "Herauszoomen"; es ist ein SVG-Strich (gleiche Wirkung, aria-label unveraendert).
- Test: ein Em-Dash-Literal wurde beim Schreiben der Testdatei unabsichtlich im Quelltext des Tests statt als Escape abgelegt; in Task 2 durch `String.fromCharCode(0x2014)` ersetzt.

## Known Stubs

Keine.

## Remaining gaps / manual check for Thomas

Echtes Geraet fehlt weiterhin: Playwright-Touch-Emulation ist nicht dasselbe wie ein iPhone/Android-Finger.
1. iPhone Safari: Zwei-Finger-Pinch auf der Karte, Seite dahinter darf nicht mitzoomen oder scrollen.
2. iPhone/Android: Wisch nach unten am Griff/Header schliesst das Sheet, Wisch auf der Karte verschiebt nur die Karte.
3. Doppeltippen mit Daumen: zoomt, kein Browser-Zoom.
4. Safe-Area unten (Home-Indicator) ueberlappt keine Controls.
5. macOS Safari Trackpad-Pinch auf der Karte (nur per Code abgesichert, nicht getestet).
6. Eigener roter Punkt: einmal real eintragen und im Dialog pruefen (Preview-Klick bewusst vermieden).

## Self-Check: PASSED

- Dateien vorhanden: mapViewport.ts, ContributionMapDialog.tsx, contributionMapZoom.test.ts, Screenshots.
- Commits `97fb5d9`, `78ca14b` sind Vorfahren von HEAD; enthalten nur Plan-Dateien.

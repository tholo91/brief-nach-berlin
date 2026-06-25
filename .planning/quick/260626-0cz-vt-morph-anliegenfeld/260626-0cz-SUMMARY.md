---
phase: quick-260626-0cz
plan: 01
type: execute
status: complete
date: 2026-06-26
files_modified:
  - web/next.config.ts
  - web/src/components/wizard/Step2Issue.tsx
  - web/src/app/globals.css
---

# Quick Task 260626-0cz: View-Transition-Morph Anliegen-Feld (Landing -> Wizard)

## Was umgesetzt wurde (Task 1 / Core)

Das Anliegen-Feld morpht beim Wechsel von der Landing zum Wizard-Step-1 jetzt
nativ (View Transitions API), statt hart zu schneiden. Drei chirurgische Edits:

1. **web/next.config.ts** — `experimental.viewTransition: true` aktiviert Reacts
   View-Transition-Integration im App Router. Verifiziert gegen
   `node_modules/next/dist/server/config-schema.js` (Next 16.2.3).
2. **web/src/components/wizard/Step2Issue.tsx** — Der geteilte Textarea-Wrapper
   (`<div className="relative">`, Zeile ~472) bekommt
   `style={{ viewTransitionName: "anliegen-feld" }}`. Da dieselbe Komponente auf
   Landing (`variant="landing"`) und im Wizard rendert, ist der Name auf beiden
   Seiten identisch -> der Browser paart die Felder und interpoliert
   Größe + Position. Pro Snapshot eindeutig (Landing unmountet vor Wizard-Mount).
3. **web/src/app/globals.css** — `::view-transition-group(anliegen-feld)` mit
   320ms Dauer + ein `prefers-reduced-motion`-Override, der alle VT-Animationen
   auf 0s setzt.

## Mechanismus (verifiziert, nicht aus Trainingsdaten)

`router.push("/app")` in `Hero.tsx:42` ist im App Router bereits eine
React-Transition. Mit dem Flag treibt der React-Reconciler die View Transition
automatisch — kein manuelles `document.startViewTransition`, kein
`<ViewTransition>`-Import nötig. Der plain-CSS-Weg umgeht die Unsicherheit, dass
das stable `react` 19.2.4 in node_modules `ViewTransition` nicht exportiert.

## Graceful Degradation

- Browser ohne VT-Support (z.B. Firefox): `view-transition-name` wird ignoriert,
  Navigation läuft sofort wie bisher, kein Fehler.
- `prefers-reduced-motion: reduce`: kein animierter Morph, Navigation intakt.

## Verifikation

- `npx tsc --noEmit` — sauber (React 19 kennt `viewTransitionName`).
- `npx next build` — erfolgreich, Flag ohne Warnung/Fehler akzeptiert.
- Visueller Morph: offen für Human-Verify auf dem Dev-Server (Chrome/Edge).
  WICHTIG: Dev-Server nach der next.config-Änderung neu starten.

## Bewusst zurückgestellt (Task 2, optional)

Scroll-Alignment in `Hero.tsx` gegen den "Fly"-Effekt bei weit runtergescrolltem
Zustand. Erst die einfache Version testen; nur umsetzen, falls der Slide bei
mittig sitzendem Feld stört. Hero.tsx wurde NICHT angefasst.

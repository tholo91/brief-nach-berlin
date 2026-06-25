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

## Ergebnis

Das Anliegen-Feld morpht beim Wechsel von der Landing zum Wizard-Step-1 nativ
(View Transitions API), statt hart zu schneiden. Live auf dem Dev-Server
verifiziert: React ruft beim `router.push` `document.startViewTransition` auf
(Hook-Beweis: `vtCalls > 0`), Navigation + Prefill intakt, keine Konsolenfehler.

## Wichtige Korrektur gegenüber dem ersten Versuch

Der erste Ansatz (plain-CSS `view-transition-name` auf dem Wrapper + Flag) hat
**nichts** animiert: ohne Reacts `<ViewTransition>`-Komponente ruft React nie
`startViewTransition` auf, also blieb es beim harten Schnitt. Beleg aus der
projekteigenen Next-Doku: `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`
sagt explizit, der Morph wird über `<ViewTransition name="...">` aktiviert, und
"route navigations are transitions, so `<ViewTransition>` animations activate
automatically during navigation". Umgestellt auf den Komponenten-Weg.

## Finale Änderungen

1. **web/next.config.ts** — `experimental.viewTransition: true` (nötig, damit
   Reacts ViewTransition-Integration aktiv ist). Verifiziert gegen
   `config-schema.js`.
2. **web/src/components/wizard/Step2Issue.tsx**
   - `import * as React` + ein kleiner `FieldMorph`-Wrapper, der das Symbol
     `React.ViewTransition` (aus Nexts gebündeltem React; Typen in
     `react/experimental`, daher schmaler Cast) verwendet.
   - **Guard:** ist `ViewTransition` undefined, rendert `FieldMorph` die Kinder
     unverändert -> graceful degradation, kein Crash.
   - Der geteilte Textarea-Wrapper (`<div className="relative">`) wird mit
     `<FieldMorph>` (= `<ViewTransition name="anliegen-feld">`) umhüllt. Da
     dieselbe Komponente auf Landing und Wizard rendert, ist der Name beidseitig
     present -> React paart die Felder und morpht Größe + Position.
   - Die wirkungslose CSS-`viewTransitionName`-Inline-Property wurde entfernt.
3. **web/src/app/globals.css** — `::view-transition-group(anliegen-feld)` mit
   450ms Dauer + dezentem Blur-Keyframe (`::view-transition-image-pair`) gegen
   Interpolations-Artefakte; bestehender `prefers-reduced-motion`-Override setzt
   alle VT-Animationen auf 0s.

## Graceful Degradation

- Browser ohne VT-Support: `startViewTransition` fehlt, React navigiert sofort
  wie bisher, kein Fehler.
- `ViewTransition`-Symbol fehlt: `FieldMorph` rendert Kinder direkt, kein Crash.
- `prefers-reduced-motion: reduce`: kein animierter Morph.

## Verifikation

- `npx tsc --noEmit` — sauber.
- `npx next build` — erfolgreich (erster Commit; Flag akzeptiert).
- Dev-Server-Runtime: Hook auf `document.startViewTransition` zeigt
  `vtCalls = 1` pro Navigation -> der Morph wird real ausgelöst. Navigation nach
  `/app?step=1`, Text vorausgefüllt, keine Errors.

## Bewusst zurückgestellt (Task 2, optional)

Scroll-Alignment in `Hero.tsx` gegen den "Fly"-Effekt bei weit runtergescrolltem
Feld. Erst die Basisversion im Alltag beurteilen. Hero.tsx unangetastet.

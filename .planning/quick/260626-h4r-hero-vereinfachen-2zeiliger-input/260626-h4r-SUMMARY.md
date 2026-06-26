---
phase: quick-260626-h4r
plan: 01
type: execute
status: complete
date: 2026-06-26
files_modified:
  - web/src/components/Hero.tsx
  - web/src/components/wizard/Step2Issue.tsx
  - web/src/components/HowItWorksWithExample.tsx
  - web/src/app/globals.css
---

# Quick Task 260626-h4r: Hero verschlanken + 2-zeiliges Anliegen-Feld

## Ergebnis

Der Hero ist entschlackt und das Anliegen-Feld einladender. Live im Dev-Server
bei 375px / 700px / 768px / Desktop verifiziert.

## Umgesetzt

1. **Hero entschlackt** (`Hero.tsx`)
   - Idle-Tagline UND der bei Tippbeginn erscheinende Tips-Crossfade entfernt:
     ueber dem Feld steht nichts mehr, die H1 grenzt direkt ans Feld.
   - "BALD: Land & Kommune"-Pill entfernt (weiter unten ohnehin referenziert).
   - Toten State aufgeraeumt (`charCount`, `tipsOpened`, `writing`,
     `HERO_EXPAND_CHARS`, `TAGLINE_IDLE`, ungenutzte Imports `Link`,
     `TipsDisclosure`, `useState`). `tipsOpened` faellt aus dem Handoff (Prop ist
     optional, kein Typ-Bruch; Tips leben weiter im Wizard).
   - Trust-Badges: `flex-nowrap` garantiert eine Zeile. Labels schalten jetzt
     bei `md` (768px) statt `sm` (640px) von kurz auf lang, weil die langen
     Labels (~611px) erst ab dem 768er-Container (max-w-2xl) in eine Zeile
     passen; im 640-735px-Bereich wuerden sie sonst abgeschnitten. Darunter
     greifen die kurzen Labels (passen immer).

2. **Anliegen-Feld 2-zeilig + laengere Placeholder** (`Step2Issue.tsx`, `globals.css`)
   - Landing-Feld startet 2 Zeilen hoch (neuer `twoLines`-Floor in `resize()`)
     und waechst danach wie bisher.
   - Laengere Placeholder-Beispiele (Phone- + Wide-Set), die ~2 Zeilen fuellen.
   - `placeholder-truncate`-CSS auf 2-Zeilen-Umbruch umgestellt (`white-space:
     normal`). Neue `clampToTwoLines()`-Funktion ersetzt die alte 1-Zeilen-
     `ellipsize()`: simuliert den Wort-Umbruch per Canvas und kappt garantiert
     bei 2 Zeilen mit "…". (Reine Pixel-Breite reichte nicht: Wort-Umbruch-Slack
     drueckte einen "1.9 Zeilen breiten" String auf eine 3. Zeile.)
   - Verifiziert: alle 7 Phone-Placeholder rendern bei genau 2 Zeilen.

3. **Argument-Umzug** (`HowItWorksWithExample.tsx`)
   - "Du musst kein Politik-Profi sein. Das Tool findet die richtigen Worte und
     Adressen." sitzt jetzt als Unterzeile unter der H2 "So einfach geht's".

## Wichtige Nebenwirkung (separat gefixt, NICHT Teil dieses Plans)

Der VT-Morph Landing -> Wizard feuerte nur beim ZWEITEN Klick (weisser Screen
beim ersten). Ursache: `router.push("/app")` traf eine ungecachte Route ->
Navigation nicht synchron -> React konnte die Snapshots nicht paaren. Fix:
`router.prefetch(WIZARD_PATH)` beim Mount in `Hero.tsx`. Verifiziert: `vtCalls=1`
schon beim ERSTEN Klick (Hook auf `document.startViewTransition`), Navigation +
Prefill intakt. Greift auch in Produktion (kalte Route = RSC-Roundtrip).

## Verifikation

- `npx tsc --noEmit` + `eslint` sauber, keine toten Imports/Vars.
- 375px: Feld 72px (= 2 Zeilen), Placeholder mit "…" gekappt, 3 kurze Badges
  einzeilig, Marquee im ersten Viewport.
- 700px: kurze Badges, einzeilig, kein Overflow.
- 768px: lange Badges, einzeilig (611px, zentriert im 672er-Container).
- Desktop: lange Badges einzeilig, Placeholder fuellt 2 Zeilen.
- VT-Morph: feuert beim ersten Klick (vtCalls=1).

## Aufgeraeumt

- `onCharCountChange`-Prop aus `Step2Issue` entfernt (nur der Hero nutzte es; mit
  dem Tagline-Crossfade obsolet, Kommentar war stale).
- `micCentered`-State komplett entfernt: war fuer das alte 1-zeilige Landing-Feld
  (Mic/Submit vertikal zentriert). Beim 2-zeiligen Feld liess das die Buttons
  mittig schweben. Da das Feld jetzt immer >=2 Zeilen ist, sind Mic + Weiter-
  Button fest unten rechts gepinnt (translateY = fieldHeight - h - 8), genau wie
  davor beim 1-Zeilen-Feld. Verifiziert: Submit 8px vom Boden, 10px von rechts;
  Button-Mitte 13px unter der Feldmitte (Mobile + Desktop).

## Bewusst belassen

- Die `text-xs sm:text-sm`-Groesse der Badges (Font-Switch bei sm), waehrend die
  Labels bei md schalten: unkritisch, da die kurzen Labels bei text-sm reichlich
  Platz haben.

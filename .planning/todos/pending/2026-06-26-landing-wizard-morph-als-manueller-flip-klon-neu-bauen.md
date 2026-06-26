---
created: 2026-06-26T15:39:03.618Z
title: Landing-Wizard Morph als manueller FLIP-Klon neu bauen
area: ui
files:
  - web/src/components/Hero.tsx
  - web/src/components/wizard/Step2Issue.tsx:8-25
  - web/src/components/wizard/Step2Issue.tsx:505-592
  - web/src/components/wizard/WizardShell.tsx:239-306
  - web/src/app/globals.css:162-185
  - web/next.config.ts
  - web/src/lib/wizard-handoff.ts
---

## Problem

Der gewünschte Effekt: Beim Klick auf den Weiter-Pfeil auf der Landing soll das
Anliegen-Feld optisch nahtlos in das Feld von Wizard-Step-1 übergehen, sodass
der User merkt "das ist derselbe Input, jetzt kommt nur noch die Tonalität dazu".

Der bisherige Ansatz über Reacts experimentelles `<ViewTransition name="anliegen-feld">`
(Next 16.2, `experimental.viewTransition: true`) **funktioniert nicht** und ist
im Browser beweisbar kaputt. Gemessen am laufenden Dev-Server (Chrome, Preview):

- `document.startViewTransition().ready` wird **bei jeder** Navigation rejected mit
  `InvalidStateError: Transition was aborted because of invalid state` — kalt UND warm,
  mit UND ohne Fallback.
- Visueller Gegenbeweis: Transition künstlich auf 2,5s verlangsamt, nach 1s ist die
  Seite schon komplett auf dem Wizard → es läuft **keine** Animation, harter Schnitt.
- Beim allerersten Klick zusätzlich ein weißer Screen (in dev: on-demand-Compile von
  `/app`; `router.prefetch` greift in dev nicht, Next: "automatic prefetching runs only
  in production").
- Ursache vermutlich die cross-route/cross-layout-Navigation (`/` site-layout → `/app`
  app-layout) + `router.push` + `router.replace`-on-mount in WizardShell. Tief in
  React-experimental, kein sauberer Fix in Sicht.

Ein Fix-Versuch über `app/loading.tsx` (gleicher ViewTransition-name als Morph-Partner)
half NICHT und wurde wieder entfernt.

## Solution

Entscheidung: **Reacts ViewTransition rausnehmen** und den Effekt als **manuellen
FLIP / Shared-Element-Klon** nur auf der Landing nachbauen. Robust, cache-/dev-
unabhängig, keine VT-API, kein weißer Screen. Frontend-Arbeit über `/frontend-design`
oder `/taste` führen (Projektkonvention). Keine neuen Deps — Vanilla CSS-Transition
oder Web Animations API.

### Teil A — tote VT-Maschinerie entfernen
- `web/src/components/wizard/Step2Issue.tsx`: `ViewTransition`-Cast + `FieldMorph`
  (ca. Z. 8-25) entfernen; die `<FieldMorph>`-Umhüllung um das Feld (ca. Z. 509 und
  schließendes Tag ca. Z. 592) durch direktes Rendern der Kinder ersetzen.
- `web/src/app/globals.css`: die `::view-transition-*`-Regeln für `anliegen-feld` +
  `@keyframes anliegen-morph-blur` + den VT-Block in `@media (prefers-reduced-motion)`
  (ca. Z. 162-185) entfernen.
- `web/next.config.ts`: `experimental.viewTransition: true` entfernen.
- `web/src/components/Hero.tsx`: `router.prefetch(WIZARD_PATH)` **behalten** (snappy
  Navigation), aber den morph-bezogenen Kommentar entschärfen.
- `web/src/lib/wizard-handoff.ts`: **behalten** (trägt den getippten Text per
  sessionStorage in den Wizard; Step 1 ist dadurch vorbefüllt = die eigentliche
  Kontinuität).

### Teil B — manueller FLIP/Klon (in Hero.tsx handleSubmit, ggf. ausgelagerter Helper)
Beim gültigen Submit (Text >= MIN_CHARS), VOR/parallel zur Navigation:
1. Live-Rect des echten Felds messen: `document.querySelector('#issueText').getBoundingClientRect()`.
2. Ziel-Box des Wizard-Step-1-Felds pro Viewport-Breite berechnen (Konstanten unten).
3. Einen **fixierten Klon-`<div>`** an `document.body` hängen (NICHT in den unmountenden
   Hero), der das Feld optisch nachbildet (gleicher Text aus dem Textarea-Value, creme
   bg, border warmgrau/30, rounded, padding wie das Wizard-Feld), positioniert auf der
   gemessenen Start-Box (position: fixed, top/left/width/height).
4. Hero-Inhalt (alles außer Klon) wegblenden (opacity-Transition).
5. Nächster Frame: Klon per Transition (~280ms ease) auf die Ziel-Box fahren
   (top/left/width/height). Richtung ist egal — einfach zur Ziel-Box.
6. **Parallel** `saveHandoff(...)` + `router.push(WIZARD_PATH)` sofort feuern (Compile/
   Load startet hinter dem Klon).
7. Klon **erst entfernen, wenn das echte Wizard-Feld gemalt ist**: per rAF pollen auf
   `#issueText` an Zielposition (≠ Klon), dann Klon im nächsten Frame entfernen. So
   kein weißer Gap, auch wenn der dev-Compile mehrere Sekunden dauert.
8. `prefers-reduced-motion`: Animation überspringen, direkt navigieren.
9. Vor dem Animieren ggf. Textarea `blur()` (Mobile-Keyboard).

### Gemessene Ziel-Geometrie (Wizard Step 1, `#issueText`)
Stand 2026-06-26, Feldhöhe 160 (HEIGHT_MIN_WIZARD). Top ist viewport-HÖHEN-unabhängig
(content-flow von oben), hängt nur an der Breite → stabil über Geräte. **Vor Umbau live
mit Preview-Tools gegenchecken**, da Layout über dem Feld (H1/Intro/Tips) driftet.

| Breite | Wizard-Feld top | breite | left | (Landing-Start zum Vergleich) |
|---|---|---|---|---|
| 375 (Mobil) | ~398 | vw-32 (343) | 16 | Landing 311 → +87 (runter) |
| 768 (Tablet) | ~349 | 512 | (vw-576)/2+32 = 128 | Landing 378 → -29 |
| 1280 (Desktop) | ~349 | 512 | 384 | Landing 539 → -190 |

Formel Ziel:
- `pad = vw >= 640 ? 32 : 16`
- `containerW = min(vw, 576)`  (max-w-xl)
- `fieldW = containerW - 2*pad`
- `left = (vw - containerW)/2 + pad`
- `top = vw >= 640 ? 349 : 398`  (Magic-Konstanten, kommentieren; AppHeader ~65-69px inkl.)
- `height = 160`

### Bekannte kleine Unschärfe
Bei langem Handoff-Text wächst das Wizard-Feld über 160 hinaus (auto-grow bis 320). Der
Klon endet bei 160 → minimales Nachsetzen beim Reveal. Optional: Klon-Zielhöhe =
`max(160, gemessene Landing-Content-Höhe)` als Annäherung.

### Verifikation (Preview-Tools, nicht raten)
- Dev-Server frisch starten (`.next` löschen für echten Kalt-Test), Landing laden,
  Feld füllen (>50 Zeichen), Weiter klicken.
- Prüfen: kein weißer Screen beim 1. Klick; Feld bleibt optisch an Ort/Größe; Wizard
  zeigt denselben Text. Über 375/768/1280 testen.
- `git status` sauber halten, surgical bleiben, separat committen.

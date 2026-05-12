---
id: 260512-vco
slug: stichpunkte-copy-clarification
date: 2026-05-12
status: complete
type: quick
---

# Summary: Stichpunkte Copy Clarification

## Motivation

User-Feedback aus Testgespräch: Es war nicht ersichtlich, dass man keinen Brief vortippen muss. Stichpunkte reichen, der Rest wird formuliert. Diese Botschaft hat an mehreren Touchpoints gefehlt oder war durch Wörter wie "Schildere" / "Beschreib" sogar verdeckt.

## Changes

- **`web/src/components/Hero.tsx`** — Neue erste Sub-Headline-Rotation: "Drei Stichpunkte reichen, kein Aufsatz nötig. / Wir bauen daraus einen Brief, der gelesen wird." Bisherige erste Rotation auf "Sprich rein oder tipp ein paar Stichpunkte." geschärft.
- **`web/src/components/HowItWorks.tsx`** — Schritt 01 Description ersetzt durch "Stichpunkte oder Gedanken per Sprachnachricht, wir übernehmen die Formulierung. ..."
- **`web/src/components/CallToAction.tsx`** — "Beschreib dein Anliegen, ..." ersetzt durch "Beschreib uns in Stichpunkten, was dich bewegt. Wir finden die zuständigen Abgeordneten und formulieren einen Brief, der ankommt."
- **`web/src/components/wizard/Step2Issue.tsx`** — 4 Änderungen:
  - Subheader: "Stichpunkte reichen. Du musst keine ganzen Sätze schreiben. Sprich einfach drauf los oder tipp ein paar Notizen. Wir formulieren daraus deinen Brief." (Voice-Hint-Conditional entfernt.)
  - Divider-Text: "oder schreib es selbst" → "oder tipp deine Stichpunkte".
  - Zwei neue Stichpunkt-Placeholder am Anfang der Rotation, Vollsatz-Placeholder bleiben als Alternative.
  - TipsDisclosure-Bullet umformuliert: "Stichpunkte genügen. Notier konkret, wo du wohnst, was du siehst, was dich nervt. Wir bauen daraus die Sätze."

## Constraints respektiert

- Keine em-dashes (—) in der neuen Copy. Diff geprüft.
- Keine Code-Refactorings, nur Copy.
- Voice-Recorder UI und Tone-Slider unverändert.

## Verification

- `tsc --noEmit` passes.
- `git diff` zeigt 4 Dateien, +15 / -9 Zeilen.
- User wird die Formulierungen final polieren.

## Followups (optional, nicht jetzt)

- SEO-Meta in `web/src/app/layout.tsx` und Subseiten könnte ebenfalls "Stichpunkte"-Framing aufgreifen (z.B. "Was stört dich? Stichpunkte reichen..."). Nicht eilig.
- Beispielseite und Treppe-der-Selbstwirksamkeit prüfen, ob "vortippen"-Framing auch dort lurkt.

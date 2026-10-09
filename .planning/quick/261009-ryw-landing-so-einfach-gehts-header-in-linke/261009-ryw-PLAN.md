---
quick_id: 261009-ryw
mode: quick
files: [web/src/components/HowItWorksWithExample.tsx]
---

# Landing "So einfach geht's": Header links, Countdown überall

## Task 1: Header in linke Spalte (md+)
- Eyebrow, H2, Intro aus dem zentrierten Block über dem Grid in die linke Spalte über die Schritte verschieben.
- Mobil bleibt zentriert (`text-center md:text-left`), md+ linksbündig.
- Rechte Spalte (Tabs + Panels) startet oben bündig mit dem Header (`md:pt-6` entfällt).
- verify: Desktop/iPad-Screenshot, Section kürzer; Mobil-Reihenfolge Header → Schritte → Panels unverändert.

## Task 2: Auto-Rotation + Fortschrittsbalken auch auf Desktop
- `isMobile`-Bedingung aus `shouldAutoRotatePanels` entfernen, `md:hidden` am Balken entfernen, Balken in Pillen-Tabs einpassen.
- Hover-/Fokus-Pause vom Tablist auf den ganzen Beispielbereich (Tabs + Karte) erweitern.
- verify: Desktop wechselt alle 5 s, pausiert bei Hover über Karte; `npm run lint`, Jest landingPageContent.

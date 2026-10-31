---
quick_id: 261031-fco
status: complete
date: 2026-10-31
---

# Debug-Seite: Haken, Tonleiste, Link-Info, CTA, Teilen-Zeile

- Kopieren-Button zeichnet einen Haken, Breite bleibt gleich, reduced-motion zeigt ihn ohne Animation.
- Tonalität als nicht bedienbare Wizard-Leiste; alte Links ohne Stufe zeigen weiter Text.
- i-Icon mit Popup erklärt den Link und sagt offen, dass der Code nicht verschlüsselt ist.
- Anliegen und Änderungswunsch sind aus den Technischen Details raus.
- Navbar-CTA nur auf /debug, Kampagnenbriefe führen zu den laufenden Kampagnen.
- Teilen-Zeile verlinkt /weitersagen, die Seite teilt nie die eigene Adresse.

Geprüft: `debugPageFormat`-Tests, `tsc`, ESLint, Browser lokal mit synthetischen Links (normal, Kampagne, Variante, alter Link, kaputter Link; 375 px und Desktop). Das echte Schreiben in die Zwischenablage nur mit Stub geprüft, die Fehleranzeige im Browser. Plan und Umsetzung liefen direkt in der Session, ohne gsd-planner und gsd-executor.

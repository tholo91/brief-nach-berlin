---
quick_id: 261031-fco
mode: quick
---

# Debug-Seite: Haken, Tonleiste, Link-Info, CTA, Teilen-Zeile

Entscheidungen aus dem Grilling mit Thomas (31.10.2026), Plan und Umsetzung direkt in der Session.

## Aufgabe 1: Seite

- `web/src/app/debug/CopyButton.tsx`: Rahmen bleibt, gezeichneter Haken plus „Kopiert“, Breite springt nicht, reduced-motion.
- `web/src/app/debug/ToneScale.tsx`: nicht bedienbare Leiste mit den Wizard-Wörtern; Varianten zeigen `requestedToneLevel`; alte Links ohne gültige Stufe zeigen Text.
- `web/src/app/debug/LinkInfo.tsx`: i-Icon mit Popup, Esc und Klick daneben schließen.
- `web/src/app/debug/page.tsx`: Teilen-Zeile mit Link „Jetzt teilen →“ auf /weitersagen, nie die Adresse der Seite selbst teilen.
- `web/src/components/AppHeader.tsx`: optionaler CTA; normal „Neuen Brief schreiben“, Kampagne „Anderen Kampagnenbrief schreiben“.

## Aufgabe 2: Technische Details

- `web/src/app/debug/formatDebug.ts`: Anliegen und Änderungswunsch raus, Zeichenzahl und eingefügter Brief bleiben.
- `web/src/__tests__/debugPageFormat.test.ts` anpassen.

## Prüfung

`npx jest debugPageFormat`, `npx tsc --noEmit`, Browser lokal: normal, Kampagne, Variante, alter Link, kaputter Link, 375 px.

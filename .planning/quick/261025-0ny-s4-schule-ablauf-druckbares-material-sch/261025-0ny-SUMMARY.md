---
quick_id: 261025-0ny
status: complete
commit: 7c00cd6
---

# S4 Unterrichtsmaterial `/schule/ablauf`: Summary

## Gebaut

- `web/src/app/schule/ablauf/page.tsx` (außerhalb von `(site)`, Pfad `/schule/ablauf`): Bildschirm-Kopfzeile (Marke, „Zurück zur Seite für Schulen“, „Seite drucken“), Blatt 1 Stundenablauf (45-Minuten-Tabelle, 90 Minuten zusätzlich, Vorher kurz prüfen), Blatt 2 Arbeitsblatt mit Name/Klasse, Checkliste (5 Punkte), 3 Schreiblinien, Peer-Feedback mit 5 Linien, Blatt 3 Tafelbild Bund/Land/Kommune mit Merksatz.
- `web/src/components/schule/PrintButton.tsx`, Ergänzungen in `web/src/lib/schule/lessonPlan.ts` (Checkliste, Tafelbild), eigener Druckblock in `globals.css` (`@page lesson-a4`, weißer Hintergrund nur hier, Seitenumbruch pro Blatt), Sitemap (0.7).
- PO-Nacharbeit: Schreiblinien als echte Linien statt Hintergrundverlauf (Browser drucken Hintergründe standardmäßig nicht, außerdem fehlte eine Linie). Die beiden neuen Seiten-Tests lagen als `.test.tsx` vor und liefen deshalb nie (Jest sucht nur `*.test.ts`); auf `.test.ts` mit `createElement` umgestellt.

## Verifikation

- `cd web && npx jest`: 165 Suites, 1526 Tests grün; tsc sauber; eslint ohne neue Meldung.
- Druckvorschau: headless Chrome `--print-to-pdf` → 3 Seiten, jede 210 × 297 mm, ohne Kopf- und Fußzeile, weißer Hintergrund, nichts abgeschnitten (PNG je Seite geprüft).
- Bildschirm 375 px und Desktop geprüft.
- Belege (lokal, gitignored): `screenshots/s4-druck-a4-seite-1..3.png`, `s4-druck-a4.pdf`, `s4-375-ablauf.jpg`, `s4-desktop-ablauf.jpg`.

## Befund

- Die globale Druckregel `body > *:not(main)` macht jede normale Seite unter `(site)` beim Drucken leer (geprüft mit `/impressum`). Für `/schule/ablauf` umgangen, für den Rest der Seite bestehender Bug.
- Der Turbopack-Dev-Cache im iCloud-Ordner übersah Dateiänderungen (veraltete CSS und Module trotz Neustart); erst Löschen von `web/.next/dev` half.

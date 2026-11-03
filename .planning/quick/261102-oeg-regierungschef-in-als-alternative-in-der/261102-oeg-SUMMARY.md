---
quick_id: 261102-oeg
status: complete
date: 2026-11-02
---

# Regierungschef:in als Alternative in der normalen Land-Strecke

Noch nicht committet. Der Eintrag in STATE.md folgt mit dem Commit, weil `quick-tasks-append` den aktuellen HEAD einträgt.

## Ergebnis
- Normale Strecke: Karte Regierungschef:in sichtbar, Landesregierung oder Senat vorausgewählt, auch nach dem Rückweg aus dem Personenpfad.
- Land-Kampagnen ohne festes Bundesland: Regierungschef:in bleibt vorausgewählt. Mit festem Bundesland: weiterhin keine Karte.
- Einleitungstext je Fall angepasst.

## Zusätzlich behoben
- „Ausgewählt: …" zeigte bei gewählter Regierungschef:in weiter die Institution, auch schon in Kampagnen.
- Die mobile Leiste überdeckte den Link „Lieber einer Person im Landtag schreiben?" um 17 px, der Klick ging ins Leere. Abstand von `pb-32` auf `pb-40`.

## Prüfung
- Jest: 177 Suiten, 1717 Tests grün. tsc ohne Fehler in `src/`, ESLint sauber auf den geänderten Dateien.
- Browser lokal, 375 x 812, PLZ 28203: Vorauswahl, Wechsel, Personenpfad, Rückweg.
- Keine Brieferzeugung ausgelöst. Einmaliger echter Routing-Aufruf über den Wizard.

## Daten
BE, MV, ST: Keine neue Regierungsspitze gefunden (Wikipedia-Stand bis etwa 13.10.2026, Berlin-Senatsseite nennt Kai Wegner). Daten unverändert. Sachsen-Anhalt: AfD kündigt Kandidatur für Dezember an.

## Offen
- `will-change: transform` an `.wizard-step-content` macht die mobile Leiste nicht wirklich fixiert; sie sitzt am Ende des Schritts.
- Der Einleitungstext nennt die Vorauswahl weiter, auch wenn die Regierungschef:in gewählt wurde.

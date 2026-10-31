---
phase: quick-261031-hho
plan: 01
subsystem: datenloeschen
tags: [datenschutz, copy, tests]
status: complete
key-files:
  modified:
    - web/src/app/(site)/datenloeschen/DatenloeschenClient.tsx
    - web/src/__tests__/datenloeschenPage.test.ts
metrics:
  completed: 2026-10-31
actuals:
  tokens: 2500
  tasks: 2
  commits: 2
plan_head_before: b7df67bdd0a3cbbefbd0bf546d1253f93320fd71
plan_head_after: 20d07a7d1d98d1feb54d4e26e3759b47a549bcd3
---

# Quick 261031-hho: Datenloeschen Kampagnen-Hinweis und Rueckfrage-Mail

Die Seite /datenloeschen nennt wieder, dass Kampagnen nicht enthalten sind (mit Link auf /kampagne/verwalten), und der Leerzustand kuendigt die schon geplante Rueckfrage-Mail an.

## Commits

- 8720424: fix(quick-261031-hho): Datenloeschen-Seite nennt Kampagnen wieder in allen Zustaenden (D-01, D-03 Zeilen 73 und 93)
- 20d07a7: fix(quick-261031-hho): Leerzustand kuendigt die geplante Rueckfrage-Mail wieder an (D-02, D-03 Zeile 72)

## Umsetzung

- Neue lokale Komponente `CampaignNotice` (eine Quelle fuer den Satz), eingebunden in `SmallPrint` (Zustaende empty und stored) und im Erfolgszustand vor dem Button "Neuen Brief schreiben".
- `SmallPrint` ist jetzt ein div mit zwei Absaetzen.
- Zustand empty hat einen dritten Absatz mit dem Rueckfrage-Satz, wortgleich zum Erfolgszustand.
- Tests B0 und B pruefen `href="/kampagne/verwalten"` positiv, B0 prueft "Rueckfrage-Mail" positiv.

## Verifikation (real gelaufen)

- `npx jest src/__tests__/datenloeschenPage.test.ts`: 13/13 gruen (nach RED: Task 1 zwei rote Tests, Task 2 ein roter Test).
- `npx eslint` auf beide Dateien: sauber.
- Alle grep/awk-Gates aus den Plan-Verify-Schritten: bestanden.
- Erfolgszustand nur per Regions-Gate geprueft (Client-State, nicht per renderToStaticMarkup renderbar). Nicht im Browser angesehen.
- Kein Push, nur die zwei Plan-Dateien in den Commits.

## Deviations from Plan

None - plan executed exactly as written.

Hinweis: Der Commit-Guard meldet `main` als geschuetzten Branch; der Plan und der Auftrag sehen ausdruecklich sequentielle Commits auf main vor (Trunk-based), daher bewusst so ausgefuehrt.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- Beide Dateien vorhanden, Commits 8720424 und 20d07a7 sind Vorfahren von HEAD.

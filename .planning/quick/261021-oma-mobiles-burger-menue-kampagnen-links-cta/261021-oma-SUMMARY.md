---
quick_id: 261021-oma
status: complete
files:
  - web/src/components/Header.tsx
---

# Quick 261021-oma Summary

Mobiles Burger-Menü in `Header.tsx`: Header-CTA und mobile Sprachwahl werden bei offenem Menü ausgeblendet, Sprache-Zeile steht immer im Panel, zwei Links (Laufende Kampagnen, Für NGOs + Creator) nur bei locale "de", Stift-Icon im Panel-Button, Panel scrollbar (`max-h-[calc(100dvh-5rem)] overflow-y-auto`).

Commit: `feat(header): mobiles Menü mit Kampagnen-Links und ohne doppelten CTA`

## Checks

- eslint Header.tsx: pass
- tsc: keine Fehler in src; nur vorbestehende Duplikat-Fehler in `.next/types/* 4.ts` (iCloud-Duplikate, nicht Teil des Tasks)
- jest: keine Header-Tests (nur AppHeader, 6/6 pass)

## Deviations

None.

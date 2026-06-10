---
type: quick-summary
quick_id: 260610-jal
slug: rate-limit-after-plz-lookup
date: 2026-06-10
status: complete
---

# Summary: Rate-Limit erst nach erfolgreichem PLZ-Lookup zählen

## Was geändert wurde

`web/src/lib/actions/submitWizard.ts`: PLZ-Lookup-Block (`lookupPLZ` +
`plz_not_found` early return) wurde **vor** die beiden Rate-Limit-Checks
(IP + Email) gezogen. Reiner Reorder, keine Logikänderung an den einzelnen
Blöcken. Kommentar ergänzt, der die Reihenfolge begründet.

## Wirkung

- **Vorher:** Jeder Submit-Versuch verbrauchte einen von 3 täglichen Email-Tokens
  (`LETTERS_PER_EMAIL.max = 3`) — auch bei `plz_not_found`. Wer die PLZ vertippte
  oder in einem Listen-only-Wahlkreis wohnt, konnte sich nach 3 Fehlversuchen für
  24h aussperren, ohne je einen Brief zu bekommen. Die neue Auto-Navigation
  zurück zu Step 2 verstärkte das.
- **Nachher:** `plz_not_found` kostet keinen Token mehr. Happy Path (gültige PLZ)
  unverändert — Token wird konsumiert, Disambiguation folgt.

## Sicherheit / Altitude

Kein DoS-Risiko: `lookupPLZ` ist ein statischer In-Memory-Lookup ohne Kosten.
Die teuren Schritte (KI-Generierung + Email-Versand) passieren erst in
`selectPoliticianAction` und liegen weiterhin hinter dem Rate-Limit.

## Verifikation

- `tsc --noEmit` grün (EXIT=0).
- Happy Path unangetastet (Reorder, kein verändertes Verhalten bei gültiger PLZ).

## Dateien

- `web/src/lib/actions/submitWizard.ts`

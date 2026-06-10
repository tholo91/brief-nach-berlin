---
type: quick-plan
quick_id: 260610-jal
slug: rate-limit-after-plz-lookup
date: 2026-06-10
---

# Quick Task: Rate-Limit erst nach erfolgreichem PLZ-Lookup zählen

## Problem

In `web/src/lib/actions/submitWizard.ts` werden die Rate-Limit-Checks (IP + Email)
**vor** dem PLZ-Lookup ausgeführt. `checkRateLimit` inkrementiert den Zähler bei
jedem erlaubten Aufruf. Ein `plz_not_found` verbraucht damit einen von 3 täglichen
Email-Tokens (`LETTERS_PER_EMAIL.max = 3`), obwohl kein Brief erzeugt wurde.

Die neue Auto-Navigation zurück zu Step 2 (aus dem Code-Review-Fix) macht
schnelles Wiederholen frictionless. Folge: Wer seine PLZ vertippt oder in einem
Listen-only-Wahlkreis wohnt, sperrt sich nach 3 Fehlversuchen für 24h selbst aus,
ohne je einen Brief bekommen zu haben.

## Fix

Den PLZ-Lookup-Block (`lookupPLZ` + `plz_not_found`-Return) **vor** die beiden
Rate-Limit-Checks ziehen. Der Lookup ist ein rein statischer In-Memory-Vorgang
ohne Kosten — ihn ohne Rate-Limit laufen zu lassen birgt kein DoS-Risiko, da die
teuren Schritte (KI/Email) erst in `selectPoliticianAction` passieren und weiterhin
hinter dem Rate-Limit liegen.

Neue Reihenfolge:
1. Zod-Validierung (unverändert)
2. **PLZ-Lookup → `plz_not_found` early return (NEU vorgezogen, kein Token)**
3. Rate-Limit IP
4. Rate-Limit Email
5. `disambiguationNeeded` return

## Akzeptanz

- Happy Path (gültige PLZ) unverändert: Token wird konsumiert, Disambiguation folgt.
- Ungültige PLZ: `plz_not_found` ohne Token-Verbrauch.
- `tsc --noEmit` grün.

## Dateien

- `web/src/lib/actions/submitWizard.ts` (Reorder, eine Datei)

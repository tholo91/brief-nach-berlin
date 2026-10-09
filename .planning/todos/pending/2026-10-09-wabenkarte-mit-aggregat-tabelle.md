---
created: 2026-10-09T17:00:00.000Z
title: "Wabenkarte statt PLZ-Punkte, optional mit Aggregat-Tabelle"
area: karte
severity: minor
files:
  - web/src/lib/letterSignals/getPublicMapData.ts
  - web/src/components/letter-signals/GermanyContributionMap.tsx
  - web/src/components/wizard/LetterSignalCard.tsx
  - web/src/lib/actions/letterSignals.ts
  - web/supabase/migrations/020_letter_signal_exact_map.sql
  - web/scripts/delete-letter-data-by-email.ts
---

## Problem

Die Karte zeigt einen Punkt pro PLZ. Mit wachsender Zahl wird daraus eine Punktewolke, die eher die Bevölkerungsdichte abbildet als die Beteiligung. Die Kartenabfrage liest exakte PLZ-Zählungen und wächst mit jeder neuen PLZ (Stand 2026-10-09: 1.275 PLZ, seit Quick 261009-pro seitenweise geladen und 1 h gecacht).

## Solution

Waben statt Punkte: Deutschland wird in gleich große Waben von etwa 10 km aufgeteilt. Jede Wabe wird je nach Anzahl der Briefe heller oder dunkler.

**Idee mit Aggregat-Tabelle:** Jeder Kartenbeitrag zählt zusätzlich eine Wabe in `letter_signal_hex_counts (hex_id, x, y, count)` hoch, in derselben RPC wie der Insert (Muster: `increment_letter_counters`). Die Karte liest nur noch diese Tabelle, als einen einzigen JSON-Wert, damit das 1.000-Zeilen-Limit von PostgREST nie wieder greift.

Haken:
1. Die Koordinaten pro PLZ liegen nur in TS (`plzMapPoints.generated.json`), nicht in der DB. Die Wabe muss deshalb in der Server Action berechnet und an die RPC übergeben werden.
2. Das Raster ist festgeschrieben, sobald es gewählt ist. Wer die Wabengröße später ändern will, muss aus `letter_signals.plz` neu befüllen. Deshalb die PLZ dort behalten.
3. Beim Löschen (`delete-letter-data-by-email.ts`) muss die Wabe wieder herunterzählen. Einmal ist ein Backfill aus den bestehenden `letter_signals` nötig.
4. Alternative ohne neue Tabelle: Die Waben in TS auf den ohnehin stündlich gecachten PLZ-Zählungen bündeln. Das ist einfacher, ohne Migration und ohne Löschlogik. Die Tabelle lohnt sich vor allem für Datenschutz (die Karte sieht nie eine PLZ) und für sehr große Mengen.

Design:
- Wabenradius `HEX_RADIUS` etwa 1,8 Einheiten in der 180er-ViewBox, 4 Deckkraft-Stufen (1 / 2-3 / 4-9 / 10+).
- Die Waben werden per `clipPath` auf die Landesgrenze zugeschnitten.
- Der eigene Punkt bleibt rot und exakt. Beim lokalen Hochzählen im Wizard wird er auf die Wabe eingerastet.
- Frontend über `/frontend-design`.

Offene Entscheidung: Aggregat-Tabelle oder nur TS-Bündelung.

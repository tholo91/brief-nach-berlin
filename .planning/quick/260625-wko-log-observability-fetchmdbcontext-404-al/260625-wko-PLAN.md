---
quick_id: 260625-wko
status: complete
date: 2026-06-25
---

# Quick Task 260625-wko: Log-Observability in fetchMdbContext

## Ziel

Die Logs von `fetchMdbContext` vertrauenswürdig machen, ohne Funktionslogik zu ändern.

## Hintergrund

Vercel-Log zeigte `[fetchMdbContext] api_error { status: 404, politicianId: 68452 }`.
Untersuchung ergab: Mandat 68452 (Lutz Brinkmann, Bundestag 2025–2029) ist gültig,
aber `poll-results?mandate=68452` liefert 404, weil der MdB noch keine erfasste
Abstimmungshistorie hat. Gutartig und selbstheilend. Zwei Observability-Probleme:

- **A:** Routine-Zustand (404) wird als `api_error` Warning geloggt → wirkt wie ein Fehler.
- **B:** Log-Label `politicianId` ist falsch — die übergebene ID ist die candidacy_mandate-ID.

## Tasks

1. `web/src/lib/enrichment/fetchMdbContext.ts`:
   - 404 gezielt als `console.log("[fetchMdbContext] no_poll_results", ...)` behandeln.
   - Echte Non-2xx (5xx etc.) bleiben `console.warn("[fetchMdbContext] api_error", ...)`.
   - Alias `const politicianId = mandateId` entfernt; alle Log-Keys `politicianId` → `mandateId`.
2. `web/src/__tests__/fetchMdbContext.test.ts`:
   - Assertions `politicianId` → `mandateId` (5 Stellen).
   - Neuer Test: 404 warnt NICHT, sondern loggt `no_poll_results` als info.

## Verifikation

- `npx jest fetchMdbContext` → 8/8 passed.
- `npx tsc --noEmit` → kein Fehler in fetchMdbContext.
- Reine Logging-/Test-Änderung, kein funktionales Verhalten betroffen.

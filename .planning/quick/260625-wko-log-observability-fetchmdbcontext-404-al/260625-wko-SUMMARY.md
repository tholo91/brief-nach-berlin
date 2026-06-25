---
quick_id: 260625-wko
status: complete
date: 2026-06-25
commit: cb1d15b
---

# Quick Task 260625-wko: Log-Observability in fetchMdbContext — Summary

## Ergebnis

Logs von `fetchMdbContext` aufgeräumt. Reine Observability-Änderung, kein funktionales
Verhalten geändert (graceful Degradation bei fehlendem MdB-Kontext bleibt identisch).

## Änderungen

- **`web/src/lib/enrichment/fetchMdbContext.ts`**
  - 404 von `poll-results` → `console.log("[fetchMdbContext] no_poll_results", { status: 404, mandateId })`.
    Grund: 404 = Mandat ohne erfasste Abstimmungshistorie (normal für neu eingezogene MdBs), gutartig.
  - Andere Non-2xx bleiben `console.warn("[fetchMdbContext] api_error", ...)`.
  - Alias `const politicianId = mandateId` entfernt; alle Log-Keys auf `mandateId` umgestellt
    (die ID ist die candidacy_mandate-ID, nicht die Politiker-Entity-ID).
- **`web/src/__tests__/fetchMdbContext.test.ts`**
  - 5 Assertions `politicianId` → `mandateId`.
  - Neuer Test: 404 warnt nicht, loggt `no_poll_results` als info.

## Verifikation

- `npx jest fetchMdbContext` → 8/8 passed.
- `npx tsc --noEmit` → kein Fehler in der Datei.

## Commit

`cb1d15b` fix(enrichment): 404 als no_poll_results loggen, Log-Label mandateId

---
phase: quick-261021-kcm
plan: 01
subsystem: success-page
tags: [bugfix, vercel-timeout, retry]
status: complete
requirements: [QUICK-261021-kcm]
key-files:
  modified:
    - web/src/components/wizard/Step3Success.tsx
    - web/src/__tests__/successPageExperience.test.ts
decisions:
  - "Nur nicht lesbare 504 gelten als nicht erstellt (Retry sicher); alle anderen nicht lesbaren 5xx bleiben konservativ (Brief-Versand ist nicht idempotent)."
actuals:
  tokens: 1200
  tasks: 2
  commits: 1
plan_head_before: 39850b42316a5f4dbbfba14f0ba0854ac068363d
plan_head_after: 4ee870e9a73ad9f75b55a6dc17b8dcee5a462e13
completed: 2026-10-21
---

# Quick 261021-kcm: Erfolgsseite behandelt HTTP 504 als nicht erstellt

Nicht lesbarer HTTP 504 (Vercel-Timeout bei maxDuration = 60) setzt `generationMayHaveSucceeded` auf false, damit "Brief konnte nicht erstellt werden" mit "Nochmal versuchen" erscheint.

## Aenderungen

- `Step3Success.tsx`: im Non-JSON-Catch-Zweig `setGenerationMayHaveSucceeded(res.status >= 500 && res.status !== 504)` plus zweizeiliger Kommentar (after() sendet die Mail erst nach der Antwort, bei 504 lief sie nie).
- `successPageExperience.test.ts`: neuer Source-String-Test "treats a Vercel 504 timeout as not created so retry stays visible". RED vorher bestaetigt, danach 10/10 gruen.

Commit: 4ee870e (nicht gepusht).

## Verifikation

- jest successPageExperience: 10/10 pass.
- eslint auf beiden Dateien: exit 0.
- tsc --noEmit: 0 Fehler in `src/`; 3 Fehler nur in gitignorten iCloud-Duplikaten `.next/types/*d 4.ts` (vorbestehend, ausserhalb des Scopes).
- Keine Geviertstriche in hinzugefuegten Zeilen.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

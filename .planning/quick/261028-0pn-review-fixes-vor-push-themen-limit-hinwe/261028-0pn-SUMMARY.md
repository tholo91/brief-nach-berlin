---
phase: quick-261028-0pn
plan: 01
subsystem: jung, schule, resend
tags: [fix, review]
status: complete
commits: 3
plan_head_before: c3f3b2075a56b047260c0f1aedf97cf23fe3679d
plan_head_after: e0e6bfa0f147ad1b2ae25fff76f95a00a4a286cb
key-files:
  modified:
    - web/src/components/jung/JungExperience.tsx
    - web/src/__tests__/jungEntry.test.ts
    - web/src/app/(site)/projekttag-demokratie/page.tsx
    - web/src/lib/actions/resendLetter.ts
    - web/src/__tests__/schreibMerzResend.test.ts
actuals:
  tasks: 3
  commits: 3
---

# Quick 261028-0pn: Review-Fixes vor Push

Drei kleine Fixes, je ein Commit: Limit-Hinweis auf /jung, Anker-Link auf der Projekttag-Seite, Jugend-Audience beim Resend.

## Commits

- 7a89ece: /jung zeigt unter den Chips „Du kannst höchstens zwei Themen wählen.“, sobald selectionLimitReached gilt. Topic-Komponenten unverändert.
- f877f97: Link „Für die Schulleitung“ zeigt auf /schule#schulleitung (Section mit scroll-mt-32).
- e0e6bfa: resendLetterAction reicht `audience: isYouthAudience(data) ? "jung" : undefined` an prepareLetterEmail durch.

## Deviations from Plan

**1. [Orchestrator override] audience über isYouthAudience**
- Statt `data.audience === "jung"` wird der vorhandene Helper `isYouthAudience` aus `@/lib/schule/youth` genutzt (identisch zum Erstversand, prüft auch klasse).
- Tests: Jugend-Resend (klasse 9) liefert audience "jung"; Erwachsenen-Resend und "jung" ohne gültige Klasse liefern undefined.

## Verification

- jest (jungEntry, schulePage, schreibMerzResend, letterEmailYouth, topicStarters): 5 Suites, 43 Tests bestanden.
- eslint auf allen geänderten Quelldateien: sauber.
- tsc --noEmit: keine Fehler in src; nur vorhandene Duplikate in `.next/types/routes.d 3.ts` (iCloud-Kopie, nicht aus diesem Plan).

## Known Stubs

None.

## Self-Check: PASSED

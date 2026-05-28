---
phase: 04-stadtstaaten-plz-wahlkreis-genauigkeit-und-wahlkreis-gruppie
plan: "03"
subsystem: wizard-disambiguation
tags: [ui, wizard, disambiguation, frontend-design]
dependency_graph:
  requires: ["04-01", "04-02"]
  provides: [grouped-wahlkreis-disambiguation, plz-change-back-link]
  affects: [web/src/components/wizard/Step3Success.tsx, web/src/components/wizard/WizardShell.tsx]
tech_stack:
  added: []
  patterns: [wahlkreis-grouping, flat-index-arrow-nav, conditional-back-link]
key_files:
  created: []
  modified:
    - web/src/components/wizard/Step3Success.tsx
    - web/src/components/wizard/WizardShell.tsx
decisions:
  - "Grouping is a pure client-side partition of sortedPoliticians by wahlkreisId; no server change"
  - "Flat index built in useMemo so arrow-key radiogroup nav still works across groups"
  - "Multi-col grid kicks in only when cards count high enough to scroll; default stays single-col"
  - "PLZ-change link is embedded in Step3Success (not global Back slot) so it only renders in disambiguation substate, never in success substate"
  - "Back-link resets actionResult+politicians, keeps issueText/toneLevel/optional fields — Mistral has not been called yet at this point"
metrics:
  duration: "~50 min (build + verify + UX iteration)"
  completed: "2026-05-28"
  tasks_completed: 2
  files_modified: 2
---

# Phase 04 Plan 03: Wahlkreis-Gruppierung + Direkt/Liste-Label Summary

**One-liner:** Disambiguation step now groups politician cards by Wahlkreis with a "Wahlkreis N · Name" header per group, labels each card as Direktmandat / über die Liste, and offers a "PLZ ändern" back-link to correct the postal code without losing the issue text.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Group cards by Wahlkreis + Direkt/Liste labels (UI skill) | fdb7544 | Step3Success.tsx |
| 1-fix | Flat-Index in useMemo statt Render-IIFE (react-hooks/refs) | 372585e | Step3Success.tsx |
| 2 (checkpoint UX) | PLZ im Subtext + "PLZ ändern"-Link | 6130da2 | Step3Success.tsx, WizardShell.tsx |

## What Changed

### Step3Success.tsx

- Disambiguation substate now renders `wahlkreisGroups` (built via `useMemo` partition of `sortedPoliticians` by `wahlkreisId`) instead of a flat list.
- Each group has a header `Wahlkreis {id} · {name}` and renders cards in a 1-col stack or 2-col grid (`cardsMultiCol`) depending on total count.
- Each card carries a Direktmandat (waldgruen pill) or "über die Liste" (warmgrau pill) label.
- A flat index is computed alongside the groups so arrow-key navigation in the radiogroup still works across group boundaries.
- New optional `onChangePlz` prop renders a "← PLZ ändern" back-link above the headline.
- Subtext now interpolates `wizardData.plz`: "Deine PLZ 20354 gehört zu mehreren Wahlkreisen. Das MdB mit Direktmandat ist vorausgewählt. Du kannst aber auch jemand anderen wählen."

### WizardShell.tsx

- Passes `onChangePlz` to `Step3Success` only when `actionResult.disambiguationNeeded === true`, so the back-link does not appear after the letter has been generated.
- Handler resets `actionResult` and `politicians`, then `setStep(2)`. `wizardData` (issue text, tone, optional fields) is preserved.

## Human Verify Results (Checkpoint Gate)

Tested with `npm run dev`:

| PLZ | Expected | Observed | Status |
|-----|----------|----------|--------|
| 20354 | 2 Wahlkreis-Gruppen (WK 18 · Hamburg-Mitte, WK 20 · Hamburg-Eimsbüttel), je Direkt + Liste, Direktmandat vorausgewählt | 2 Gruppen mit je 2 MdBs (Direkt + Liste); Hamburg-Nord (WK 21) korrekt nicht enthalten (deckt 20354 nicht ab) | PASS |
| 20249 | 1 Gruppe WK 21 · Hamburg-Nord, Direktmandat vorausgewählt, Liste auswählbar | 1 Gruppe mit 2 MdBs, Direktmandat vorausgewählt | PASS |
| Em-Dashes / Sprache | keine Em-Dashes, deutsches Wording natürlich | bestätigt | PASS |

User-Feedback im Checkpoint: zwei UX-Wünsche (PLZ im Subtext, PLZ-ändern-Link). Beide in Task 2 (Commit 6130da2) ergänzt — keine Logikänderung, da bei Disambiguation noch kein Brief generiert wurde.

## Deviations from Plan

### Plan-Erweiterung (vom Human-Verify-Checkpoint induziert)

**Subtext-Personalisierung + PLZ-ändern-Back-Link**
- **Founder-Wunsch im Checkpoint:** Subtext sollte die konkrete PLZ anzeigen; Disambiguation-Schritt sollte einen Weg zurück bieten, falls die PLZ falsch eingetippt wurde.
- **Vor Implementation geprüft:** Bei Disambiguation ist noch kein OpenAI/Mistral-Call erfolgt — siehe submitWizard.ts:97. Re-Submit nutzt denselben statischen lookupPLZ-Pfad. Daher reine Routing-Änderung, keine neue Server-Logik.
- **Implementiert:** Step3Success.tsx + WizardShell.tsx (Commit 6130da2)

### Auto-fixed Issues

**1. [Rule 1 - Bug] Flat-Index als IIFE im Render verursachte react-hooks/refs Lint-Warnung**
- **Found during:** Task 1 nach erstem Commit fdb7544
- **Issue:** Der Flat-Index wurde in einer IIFE direkt im JSX gebaut, was die react-hooks/exhaustive-deps Regel beim Linten flaggte.
- **Fix:** In `useMemo` mit expliziten Dependencies verschoben.
- **Files modified:** web/src/components/wizard/Step3Success.tsx
- **Commit:** 372585e

## Self-Check: PASSED

- [x] Disambiguation-View gruppiert nach `wahlkreisId` (useMemo, nicht IIFE)
- [x] Header pro Gruppe: "Wahlkreis N · Name"
- [x] Direktmandat-Pill (waldgruen) und über-die-Liste-Pill (warmgrau)
- [x] Flat-Index erhält Arrow-Key-Navigation über Gruppen hinweg
- [x] `onChangePlz` rendert nur im Disambiguation-Substate, nicht nach Briefgenerierung
- [x] Subtext interpoliert `wizardData.plz`
- [x] Keine Em-Dashes im UI-Text
- [x] `tsc --noEmit` clean
- [x] Human-Verify mit 20354 + 20249 bestanden

## Threat Surface Scan

T-04-07 (Grouping-Logic könnte Karten verlieren / falsch zuordnen): mitigiert durch reine Partition mit Identity-Key `wahlkreisId`; jede `politician.id` taucht in exakt einer Gruppe auf; Selection läuft weiter über `handleCardSelect(p.id)`. Human-Verify hat die End-to-End-Kette PLZ → Karten → Brief bestätigt.

T-04-08 (Information Disclosure): keine neuen Felder gerendert, alle Daten waren vorher schon im UI (Name, Partei, Wahlkreis, AW-Link).

Keine neuen Netz-Endpunkte, kein neuer State, keine neuen Dependencies.

---
quick_id: 260625-skh
slug: landing-anliegen-ueberlebt-browser-zurue
date: 2026-06-25
status: complete
---

# Summary 260625-skh: Landing-Anliegen überlebt Browser-Zurück

## Problem

Tester-Feedback: Nach „Zurück" landete man wieder ganz am Anfang, der getippte
Anliegen-Text war weg. Ursache (verifiziert): Das Landing-Feld hatte kein
Gedächtnis, der Wizard-Handoff wird auf `/app` sofort gelöscht, und Step-Wechsel
laufen über `router.replace` — der **Browser-Zurück** springt daher direkt auf
die leere Landing. (Der interne „zurück"-Button im Wizard war NICHT die
Ursache; der erhält die Eingaben korrekt.)

## Lösung

Per-Tab-Draft (`sessionStorage`) für das Landing-Anliegen, sauber gekapselt und
mit klarem Lifecycle.

**Geänderte/neue Dateien:**

1. **`web/src/lib/landing-draft.ts` (neu)** — kleines Modul analog zu
   `wizard-handoff.ts`: `readLandingDraft`, `writeLandingDraft`,
   `clearLandingDraft`. sessionStorage, je try/catch. Eine Quelle der Wahrheit,
   kein Magic-String-Duplikat.
2. **`web/src/components/wizard/Step2Issue.tsx`** — nur die Landing-Variante
   (`isLanding`):
   - Restore beim Mount via `useIsoLayoutEffect` (erst nach Hydration,
     clientseitig → kein SSR/Client-Mismatch, kein Flackern).
   - Persist nur bei echter Nutzereingabe (`handleTextChange` +
     `handleTranscription`), nie beim Mount → kein Clobbering des Restores.
   - Die funktionale `setIssueText(prev => …)`-Form in `handleTranscription`
     bleibt unverändert (wird auch im Wizard genutzt).
3. **`web/src/components/wizard/WizardShell.tsx`** — `clearLandingDraft()` bei
   Erreichen von Step 3 (erfolgreicher Versand) via `useEffect([step])`. So
   sieht ein im selben Tab zurückkehrender Besucher nach Abschluss ein frisches
   Feld. Der bestehende Handoff-Lifecycle bleibt unangetastet.

Die Wizard-Variante von `Step2Issue` (default) ist verhaltensgleich — alle
Draft-Pfade sind auf `isLanding` gegated.

## Verifikation

- `npx eslint` über alle drei Dateien → 0 Errors, 0 Warnings.
- `npm run build` → erfolgreich (alle Routes inkl. `/` und `/app`).
- Browser-Preview, cache-frei neu gebaut (`.next` gelöscht, Dev-Server frisch):
  - Tippen → `sessionStorage["landing-issue-draft"]` enthält den Text. ✓
  - Reload (= Remount, wie Rückkehr auf die Landing) → Feld wieder befüllt. ✓
  - Kein Fehler-Overlay, keine Console-Errors. ✓
- Hinweis: Während der Bearbeitung zeigte der Dev-Console-Puffer kurz
  „defined multiple times" — das war stale Turbopack-Cache aus dem Moment, als
  der Import schon da war, die lokalen Helfer aber noch nicht entfernt. Nach
  `.next`-Clear + frischem Build verschwunden.

## Bewusste Entscheidungen

- Draft lebt sonst bis Tab-Close (deckt sich mit „Eingabe soll befüllt
  bleiben"); aktiv gelöscht wird nur nach erfolgreichem Versand.
- Edge Case (kein Datenverlust): Editiert jemand erst im Wizard und nutzt dann
  Browser-Zurück zur Landing, zeigt die Landing den letzten Landing-Stand, nicht
  die Wizard-Edits. Strikt besser als der Status quo (leeres Feld).

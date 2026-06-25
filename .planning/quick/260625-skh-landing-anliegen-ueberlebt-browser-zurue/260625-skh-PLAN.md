---
quick_id: 260625-skh
slug: landing-anliegen-ueberlebt-browser-zurue
date: 2026-06-25
status: complete
---

# Quick Task 260625-skh: Landing-Anliegen überlebt Browser-Zurück aus dem Wizard

## Problem

Feedback eines Testers: Nach dem Klick auf „Zurück" landete er wieder ganz am
Anfang und der bereits eingegebene Anliegen-Text war weg.

**Ursache (verifiziert im Code):**
- Die Landing rendert `Step2Issue` (`variant="landing"`) ohne Persistenz; das
  Feld ist „uncontrolled" (`useState(defaultValue ?? "")`).
- Der Landing→Wizard-Handoff (`sessionStorage`) wird auf `/app` beim Mount
  sofort gelöscht (`clearHandoff()`), und Step-Wechsel laufen über
  `router.replace` (kein History-Eintrag).
- Folge: Der **Browser-Zurück**-Button springt von `/app` direkt auf die
  Landing — und die ist leer, weil weder Handoff noch ein eigenes Draft-
  Gedächtnis existieren.
- Der **interne** „zurück"-Button im Wizard (Step 2→1) erhält die Eingaben
  korrekt; er ist nicht die Ursache.

## Lösung (surgisch, SSR-sicher, nur Landing-Variante)

Ausschließlich `web/src/components/wizard/Step2Issue.tsx`, komplett auf
`isLanding` gegated, damit die Wizard-Variante (default) verhaltensgleich bleibt.

### Task 1 — Per-Tab-Draft für das Landing-Feld

- **files:** `web/src/components/wizard/Step2Issue.tsx`
- **action:**
  1. Modul-Scope-Helfer ergänzen (analog zu `wizard-handoff.ts`,
     `sessionStorage`, try/catch): `LANDING_DRAFT_KEY`, `readLandingDraft()`,
     `writeLandingDraft(text)`.
  2. Restore via vorhandenem `useIsoLayoutEffect`, gegated `isLanding`,
     deps `[isLanding]`: gespeicherten Entwurf nach der Hydration einlesen und
     `setIssueText` setzen (client-only → kein SSR-Mismatch, kein Flackern).
  3. Persist **nur bei echter Nutzereingabe** (nie beim Mount → kein
     Clobbering): in `handleTextChange` nach `setIssueText(value)` und in
     `handleTranscription` innerhalb der bestehenden funktionalen
     `setIssueText(prev => …)`-Form (für den Wizard unverändert!).
- **verify:** `npm run lint` und `npm run build` laufen sauber durch.
- **done:** Browser-Zurück aus dem Wizard zeigt die Landing mit dem zuvor
  getippten Anliegen vorbefüllt; die Wizard-Variante ist unverändert.

## Scope-Update (während der Umsetzung, auf Wunsch „nachhaltig")

- Die Draft-Helfer wurden in ein eigenes Modul `web/src/lib/landing-draft.ts`
  ausgelagert (statt lokal in `Step2Issue.tsx`), damit es eine Quelle der
  Wahrheit gibt und `WizardShell` sie ebenfalls nutzen kann.
- `WizardShell.tsx` löscht den Draft nun nach erfolgreichem Versand (Step 3),
  damit kein veralteter Text im selben Tab hängen bleibt. Der bestehende
  Handoff-Lifecycle (clear on mount) bleibt unangetastet.

## Nicht-Ziele / bewusst ausgelassen

- KEINE Änderung an `Hero.tsx` oder `wizard-handoff.ts`.
- Draft lebt sonst bis Tab-Close (deckt sich mit „Eingabe soll befüllt
  bleiben"); aktiv gelöscht wird nur nach erfolgreichem Versand.

## Edge Case (akzeptiert, kein Datenverlust)

Editiert jemand den Text erst **im Wizard** (Step 1) und nutzt dann
Browser-Zurück zur Landing, zeigt die Landing den Stand vor dem Wizard-Einstieg
(letzter Landing-Stand), nicht die Wizard-Edits. Das ist strikt besser als der
Status quo (leeres Feld) und betrifft nicht den gemeldeten Fall.

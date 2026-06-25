---
quick_id: 260625-w13
slug: voice-flag-usedspeechtotext-geht-beim-la
date: 2026-06-25
---

# Quick Task 260625-w13: Voice-Flag geht beim Landing→Wizard-Handoff verloren

## Problem

Im Debug-Link (`/debug?d=...`) meldet `Voice input` immer `false`, auch wenn auf
der Landingpage eine Sprachnachricht genutzt wurde. Ursache: der nach dem
Landing-Umbau eingeführte Handoff Landing→Wizard reicht den Voice-Flag nicht
durch.

Zwei zusammenwirkende Defekte:

1. **Handoff verwirft den Flag.** `Step2Issue` (variant="landing") ruft
   `onSubmit(issueText, toneLevel, usedSpeechToText, tipsOpened)` korrekt auf,
   aber Heros `handleSubmit` nahm nur `issueText` an und speicherte nur
   `{ issueText, tipsOpened }`. `WizardHandoff` kannte das Feld gar nicht.
2. **Wizard überschreibt mit frischem `false`.** Selbst wenn der Flag ankäme,
   setzte `WizardShell.handleStep1Complete` `usedSpeechToText` hart auf den
   frisch gemounteten Wizard-Ref (false) — anders als `tipsOpened`, das per
   `||` gemergt wird.

Voice **im Wizard** funktionierte korrekt; nur Voice **auf der Landing** ging
verloren.

## Änderungen

- `web/src/lib/wizard-handoff.ts`: `WizardHandoff` um `usedSpeechToText?: boolean`
  erweitert; in `peekHandoff` typgeprüft durchgereicht (`saveHandoff` reicht das
  ganze Objekt durch).
- `web/src/components/Hero.tsx`: `handleSubmit` nimmt die vollen
  `onSubmit`-Parameter an und gibt `usedSpeechToText` an `saveHandoff` mit.
- `web/src/components/wizard/WizardShell.tsx`: liest `handoff.usedSpeechToText` in
  den initialen `wizardData`-State; OR-Merge in `handleStep1Complete`
  (`prev.usedSpeechToText || usedSpeechToText`) analog zu `tipsOpened`.

## Verifikation

- `npx tsc --noEmit` grün (EXIT 0).
- Datenfluss-Trace: Landing-Voice → `usedVoiceRef` → `onSubmit` → `saveHandoff`
  → sessionStorage → `peekHandoff` → `wizardData.usedSpeechToText` → OR-Merge →
  `buildDebugPayload` → `/debug`.
- Voller End-to-End-Test (echte Mikrofon-Aufnahme + Transkription + Generierung)
  nicht automatisiert verifizierbar.

## Nachgelagert (separat, nach Bestätigung)

Debug-Readout-Umbau (`buildDebugPayload.ts` + `debug/page.tsx`): Input-Cap
300→700, Anliegen-Text nach oben, Kürzungs-Marker, `Issue text words` raus.

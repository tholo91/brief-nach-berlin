---
quick_id: 260625-w13
slug: voice-flag-usedspeechtotext-geht-beim-la
date: 2026-06-25
status: complete
commit: 5e5acbe
---

# Summary: Voice-Flag geht beim Landing→Wizard-Handoff verloren

## Ergebnis

`usedSpeechToText` wandert jetzt vollständig von der Landing in den Debug-Payload.
Der `Voice input`-Wert im Debug-Link spiegelt wieder, ob auf der Landingpage
gesprochen wurde.

## Geänderte Dateien

- `web/src/lib/wizard-handoff.ts` — `WizardHandoff.usedSpeechToText` + Durchreichung
  in `peekHandoff`.
- `web/src/components/Hero.tsx` — `handleSubmit` nimmt die vollen `onSubmit`-Params
  an, gibt `usedSpeechToText` an `saveHandoff`.
- `web/src/components/wizard/WizardShell.tsx` — Flag ins initiale `wizardData`
  gelesen + OR-Merge in `handleStep1Complete` (analog `tipsOpened`).

## Verifikation

- `npx tsc --noEmit` → EXIT 0.
- Voller End-to-End-Test (echte Sprachaufnahme → Transkription → Generierung →
  Debug-Link) nicht automatisiert durchgeführt; Korrektheit über Datenfluss-Trace
  + Typecheck abgesichert.

## Offen / nachgelagert

Debug-Readout-Umbau (Input-Cap 300→700, Anliegen-Text nach oben, Kürzungs-Marker,
`Issue text words` raus) — wartet auf Bestätigung der Drop-Liste, dann separater
Quick-Task.

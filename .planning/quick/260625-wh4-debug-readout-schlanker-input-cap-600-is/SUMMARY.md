---
quick_id: 260625-wh4
slug: debug-readout-schlanker-input-cap-600-is
date: 2026-06-25
status: complete
commit: b6c1410
---

# Summary: Debug-Readout schlanker, mehr Original-Input

## Ergebnis

Der Debug-Link zeigt jetzt bis zu 600 Zeichen des Original-Anliegens (statt 300)
und die redundante `Issue text words`-Zeile ist weg. Damit ist der für die
Qualitäts-Diagnose entscheidende Input vollständiger sichtbar.

## Geänderte Dateien

- `web/src/lib/email/sendLetterEmail.ts` — `issueTextWordCount` aus dem Typ raus.
- `web/src/lib/email/buildDebugPayload.ts` — Cap 300→600; Feld aus beiden Buildern.
- `web/src/app/debug/page.tsx` — Zeile entfernt, Label „max 600 Zeichen".
- `web/scripts/render-email-preview.ts` — Mock-Feld entfernt.

## Verifikation

- `npx tsc --noEmit` → EXIT 0.
- Live `/debug?d=...` (HTTP 200): Zeile weg, Label „max 600 Zeichen", Rest intakt.
- Turbopack-Dev-Cache war vorab korrupt (alle Routen 500); `web/.next` geleert +
  Server-Neustart, danach grün. Unabhängig von dieser Änderung.

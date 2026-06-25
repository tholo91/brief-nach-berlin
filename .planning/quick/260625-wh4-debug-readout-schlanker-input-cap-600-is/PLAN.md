---
quick_id: 260625-wh4
slug: debug-readout-schlanker-input-cap-600-is
date: 2026-06-25
---

# Quick Task 260625-wh4: Debug-Readout schlanker, mehr Original-Input

## Ziel

Der Debug-Link soll fürs Qualitäts-Debugging mehr vom Original-Anliegen zeigen
und überflüssige Zeilen droppen. Der Brief-Output steht ohnehin in derselben
Mail, der volle Input ist das fehlende Diagnose-Signal.

## Entscheidungen (mit Thomas)

1. Input-Auszug-Cap **300 → 600** Zeichen (sicherheitshalber 600 statt 700,
   hält die base64-URL klein genug für Gmail/Outlook).
2. Anliegen-Text bleibt **unten** (kein Move nach oben).
3. **Kein** Kürzungs-Marker — `Issue text length` zeigt die echte Länge.
4. Zeile **`Issue text words` raus** — redundant, sobald man den Text liest.
   Feld komplett aus dem Payload entfernt (spart URL-Bytes).

## Änderungen

- `web/src/lib/email/sendLetterEmail.ts`: `issueTextWordCount` aus
  `LetterDebugPayload` entfernt; Preview-Kommentar auf 600 aktualisiert.
- `web/src/lib/email/buildDebugPayload.ts`: `ISSUE_TEXT_PREVIEW_MAX` 300→600;
  `issueTextWordCount` aus beiden Buildern (generate + resend) entfernt.
- `web/src/app/debug/page.tsx`: `Issue text words`-Zeile entfernt; Auszug-Label
  „max 300" → „max 600 Zeichen".
- `web/scripts/render-email-preview.ts`: Mock-Feld `issueTextWordCount` entfernt.

## Verifikation

- `npx tsc --noEmit` → EXIT 0.
- Live gegen Dev-Server (`/debug?d=...`, HTTP 200): `Issue text words`-Zeile
  weg, „max 600 Zeichen"-Label da, restliche Felder intakt.
- Nebenbefund: Turbopack-Dev-Cache war korrupt (alle Routen 500) — `web/.next`
  geleert und Server neu gestartet, danach grün. Nicht durch diese Änderung
  verursacht.

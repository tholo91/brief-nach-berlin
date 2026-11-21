---
status: complete
---
# Quick 261121-mlz: Debug-Link personalNotePreview

- Feld `personalNotePreview` in `LetterDebugPayload`, gefüllt in `generate-letter/route.ts` aus dem serverseitig geprüften `personalNote` (max 2000 Zeichen).
- `/debug` zeigt Abschnitt "Dein Zusatz (Chips und Text)".
- Aus dem signierten Feedback-Token entfernt (wie `issueTextPreview`). Resend-Pfad unverändert.
- Test: `reviewCampaignSlug.test.ts` erweitert; tsc und 3 Suites grün. Nicht committet.

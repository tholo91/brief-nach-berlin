---
quick_id: 261008-xfr
phase: quick-261008-xfr
plan: 01
subsystem: campaigns
tags: [campaigns, verwalten, dialog, ui]
status: complete
requirements: [kampagne-verwalten-uebertragen-dialog]
key-files:
  modified:
    - web/src/components/campaigns/CampaignManager.tsx
decisions:
  - "Native <dialog> mit showModal() in lokaler ManagerDialog-Komponente, geteilt von Übertragen- und Archivieren-Dialog, keine neue Dependency"
  - "Transfer-Formular bleibt nach Erfolg gemountet (hidden), damit Reset und Fokus beim erneuten Öffnen funktionieren"
  - "Archivieren-Bestätigung ergänzt (Amendment 5), Server-Actions unverändert"
---

# 261008-xfr: Kampagne übertragen als Link + Dialog

UI-Arbeit mit `/frontend-design`.

## Ergebnis
- Grüner Übertragen-Kasten unter der Statuskarte entfernt.
- In "Kampagne umstellen": Trennlinie, "Soll jemand anderes die Kampagne betreuen?" + Link "Verwaltung übertragen" (nur bei `canTransfer`).
- Dialog "Verwaltung übertragen?": neutrale Liste (Bestätigungslink, neue Verwaltungs-Mail), rote Box nur für "alte Links funktionieren nicht mehr", Formular, Fehler im Dialog, bei Erfolg grüne Meldung + "Schließen".
- "Kampagne archivieren" öffnet jetzt einen Bestätigungsdialog statt sofort zu archivieren.
- Schließen per Esc, "Abbrechen" und Klick auf den Hintergrund.

## Checks
- `npx jest src/__tests__/transferCampaignAction.test.ts`: 5/5 grün.
- `npx tsc --noEmit`: keine Fehler in `CampaignManager.tsx`. 4 vorbestehende Fehler in `src/__tests__/campaignTopicReset.test.ts` (Datei unverändert).
- Nicht geprüft: Darstellung im Browser (Desktop/375px), weil es keinen lokalen Verwaltungslink gab. Laut Abstimmung nicht nötig.

## Nicht committet
Laut Plan kein Commit. Im Working Tree liegen weitere fremde Änderungen.

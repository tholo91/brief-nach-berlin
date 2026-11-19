---
quick_id: 261119-rk1
phase: quick
plan: 261119-rk1
subsystem: campaigns
tags: [kampagnen, verwaltung, varianten, satzanfaenge, ui]
status: complete
commits: 2
plan_head_before: cf7b04840034eacd5038d583c9f82f019b063749
plan_head_after: 612c651
branch: quick/261119-rk1
key-files:
  created:
    - web/src/components/campaigns/CampaignVariantsEditor.tsx
    - web/src/__tests__/updateCampaignVariants.test.ts
    - web/src/__tests__/campaignVariantsEditor.test.ts
    - .planning/todos/pending/2026-11-19-ki-vorschlag-fuer-varianten-in-der-verwaltung.md
  modified:
    - web/src/lib/actions/updateCampaign.ts
    - web/src/lib/campaigns/issueVariants.ts
    - web/src/lib/campaigns/repository.ts
    - web/src/lib/campaigns/schema.ts
    - web/src/components/campaigns/CampaignManager.tsx
actuals:
  tasks: 3
  commits: 2
---

# Quick 261119-rk1: Varianten und Satzanfänge in der Kampagnen-Verwaltung

Ersteller:innen pflegen Varianten des Anliegens (max 2) und Satzanfänge (max 3) jetzt selbst in `/kampagne/verwalten`; Varianten bleiben nach einer Anliegen-Änderung aktiv.

## Commits
- `960ff8e` feat(kampagnen): Varianten und Satzanfänge in der Verwaltung speichern
- `612c651` feat(kampagnen): Varianten und Satzanfänge in der Kampagnen-Verwaltung bearbeiten
- Task 3 (Backlog-Eintrag) bewusst nicht committet.

## Umsetzung
- Formfelder: `issueTextAlternative` (0 bis 2, wiederholt), `personalHook` (0 bis 3, wiederholt), `variantsSubmitted=1` (Marker).
- Der Marker `variantsSubmitted` ist eine Ergänzung zum Plan: Ohne ihn würde ein Formular ohne Einträge (veralteter Client) Varianten und Satzanfänge löschen. Fehlt er, bleiben beide unangetastet.
- Validierung in `validateCampaignVariantInput` (`issueVariants.ts`) mit deutschen Meldungen. Fehler kommen als `fieldErrors.issueTextAlternatives` und `fieldErrors.personalHooks`. Dazu `campaignPersonalHooksSchema` (3 bis 80 Zeichen, max 3, eindeutig) im Update-Schema des Repositorys als zweite Absicherung.
- Moderation: alle Varianten und Satzanfänge laufen durch `moderateText`.
- Repository: `variantPatch` setzt `issue_text_alternatives`, `issue_text_alternatives_base` (= neues Anliegen) und `personal_hooks` in `updateCampaignPublicFields`, `saveAwaitingApprovalCampaignEdits` und `publishCampaignEdits`. Die Revision bekommt die neuen Varianten. `personal_hooks` liegt nicht auf Revisionen (041).
- UI: `CampaignVariantsEditor` direkt unter dem Anliegen-Feld. Varianten als Textareas mit Zeichenzähler (min. 50), Satzanfänge als Chips im Stil des Wizards (Bearbeiten per Klick auf den Chip, Entfernen per X), ein Eingabefeld mit Hinzufügen/Übernehmen. Sanfter Hinweis bei geändertem Anliegen. Keine Gedankenstriche, ich-Form entfällt, weil neutral formuliert.
- Keine Migration, kein Mistral-Call, keine neue Abhängigkeit.

## Verifikation
- `npx jest`: 202 Suites, 1977 Tests grün.
- `npx tsc --noEmit`: sauber.
- `npm run lint`: 0 Fehler, 9 Warnungen, keine in den geänderten Dateien (bestehende Warnungen in unabhängigen Dateien).
- Nicht geprüft: Browser-Preview (Orchestrator), Production.

## Deviations from Plan

### Auto-fixed / Ergänzungen
**1. [Rule 2 - Missing critical functionality] Marker `variantsSubmitted`**
- Schutz davor, dass ein Formular ohne Varianten-Felder beides leert.
- Dateien: `updateCampaign.ts`, `CampaignVariantsEditor.tsx`.

**2. [Rule 3 - Blocking] Commits auf eigenem Branch statt `main`**
- Der Pre-Commit-Guard verbietet Commits auf dem geschützten Branch `main` (`git.allow_default_branch_commits` ist nicht gesetzt). Ich habe `quick/261119-rk1` angelegt (mit den unverändert mitgenommenen, nicht gestagten Änderungen) und dort committet. Zum Übernehmen: Fast-Forward-Merge nach `main`.

## Known Limitations
- Ein im Satzanfang-Eingabefeld getippter, aber nicht mit "Hinzufügen" bestätigter Text wird beim Speichern nicht mitgenommen.
- Varianten, die wegen einer früheren Anliegen-Änderung inaktiv waren (Base veraltet), werden beim nächsten Speichern wieder aktiv.

## Known Stubs
None.

## Threat Flags
None. Keine neuen Endpunkte; neue Texte laufen durch die bestehende Moderation.

## Self-Check: PASSED
- CampaignVariantsEditor.tsx, updateCampaignVariants.test.ts, campaignVariantsEditor.test.ts, Backlog-Datei vorhanden.
- Commits 960ff8e und 612c651 in der Historie des Branches.

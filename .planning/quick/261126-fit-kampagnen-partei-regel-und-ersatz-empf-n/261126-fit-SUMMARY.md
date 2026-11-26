---
phase: quick-261126-fit
plan: 01
subsystem: campaigns
tags: [campaigns, recipient-routing, step3, prompt, migration]
requires: []
provides:
  - campaigns.target_parties and campaigns.backup_recipient (SQL-only configuration)
  - one recipient rule for submitWizard, generate-letter, selectPolitician, resendLetter
  - Step 3 backup card with collapsed nationwide party search
  - role-aware prompt variant for fixed recipients
affects: [campaigns, wizard, letter-generation]
tech-stack:
  added: []
  patterns:
    - "campaign_fixed kind reused for the backup recipient, address resolved server-side from the campaign row"
key-files:
  created:
    - web/supabase/migrations/045_campaign_party_rule_backup.sql
    - web/src/lib/lookup/campaignRecipientRule.ts
    - web/src/__tests__/campaignRecipientRule.test.ts
    - web/src/__tests__/step3CampaignBackup.test.ts
  modified:
    - web/supabase/MIGRATION_STATUS.md
    - web/src/lib/campaigns/schema.ts
    - web/src/lib/campaigns/repository.ts
    - web/src/lib/lookup/campaignFixedRecipient.ts
    - web/src/lib/actions/submitWizard.ts
    - web/src/lib/actions/selectPolitician.ts
    - web/src/lib/actions/resendLetter.ts
    - web/src/app/api/generate-letter/route.ts
    - web/src/lib/generation/generateLetter.ts
    - web/src/lib/types/wizard.ts
    - web/src/components/wizard/Step3Success.tsx
    - web/src/lib/i18n/wizardCopy.ts
    - web/src/__tests__/campaignRolloutSafety.test.ts
    - web/src/__tests__/recipientSelectionHardening.test.ts
    - web/src/__tests__/generateLetterLevelPrompt.test.ts
key-decisions:
  - "Party rule compares normalized strings (soft hyphen and whitespace stripped); a typo in target_parties yields restricted with an empty list, so misconfiguration is visible instead of silently unrestricted"
  - "Backup recipient is reused as kind campaign_fixed: no new recipient kind, no letter_signals constraint, no email or stats change"
  - "Invalid backup_recipient jsonb is logged (without payload) and treated as null so the campaign page stays reachable"
metrics:
  duration: "about 50 minutes"
  completed: 2026-11-26
status: complete
commits: 3
plan_head_before: 68057568b5a28214dffa17df382812a583462bc6
plan_head_after: 3db172d63f83113c967c0b0f074848695d50cba8
actuals:
  tokens: 17000
  tasks: 3
  commits: 3
---

# Phase quick-261126-fit Plan 01: Partei-Regel und Ersatz-Empfänger Summary

Bund-Kampagnen können per SQL eine Partei-Regel (`target_parties`) und einen Ersatz-Empfänger (`backup_recipient`) bekommen; ohne lokalen Treffer geht der Brief serverseitig aufgelöst an die Ministerin, mit Funktion und Anrede im Prompt.

## What was built

- **Task 1 (a612a2d):** Migration 045 (zwei Spalten, zwei Constraints, auskommentiertes UPDATE), `parseCampaignPartyRule` (tolerant bei kaputtem jsonb), `campaignRecipientRule.ts` mit `campaignAllowedPoliticianIds`, `campaignBackupRecipient`, `resolveCampaignRecipientRule`, `campaignSelectionAllowed`. `submitWizardAction` liefert `campaignBackupRecipient` nur ohne lokalen Parteitreffer. `role` optional im `campaignFixedRecipientSchema`, durchgereicht in `buildCampaignFixedRecipient`.
- **Task 2 (42c00cc):** `route.ts`, `selectPolitician.ts`, `resendLetter.ts` nutzen die Regel. `campaign_fixed` wird nur akzeptiert, wenn ein Ersatz konfiguriert ist und die PLZ keinen lokalen Treffer hat; Adresse, Anrede und Funktion kommen aus der Kampagne. Prompt mit Funktion hat eigene Zuständigkeits-, Bitte- und Neutralitätsblöcke (ohne Wahlkreis, ohne Partei) und `amt` im Empfänger-Eintrag; ohne Funktion bleibt der Prompt unverändert.
- **Task 3 (3db172d):** Step 3 zeigt bei Ersatz-Empfänger nur die vorausgewählte Karte (Badge "Zuständig für das Anliegen"), einen Hinweissatz und einen Toggle, hinter dem die bundesweite Partei-Suche liegt. Die Fixed-Karte ist jetzt eine gemeinsame lokale Komponente. DE/EN/TR-Texte ergänzt.

## Ready-to-run SQL for demokratiearbeit-finanzieren

Nach Migration 045 im SQL Editor ausführen (steht auch auskommentiert am Ende der Migrationsdatei; `personName` kann Thomas vorher anpassen):

```sql
UPDATE public.campaigns
SET
  target_parties = '{"CDU/CSU","SPD"}',
  backup_recipient = jsonb_build_object(
    'organizationName', 'Bundesministerium für Bildung, Familie, Senioren, Frauen und Jugend',
    'personName', 'Frau Bundesministerin Karin Prien',
    'role', 'Bundesministerin für Bildung, Familie, Senioren, Frauen und Jugend, für das Anliegen zuständig',
    'salutation', 'Sehr geehrte Frau Bundesministerin Prien,',
    'street', 'Glinkastraße',
    'houseNumber', '24',
    'postalCode', '10117',
    'city', 'Berlin',
    'countryCode', 'DE'
  ),
  updated_at = now()
WHERE slug = 'demokratiearbeit-finanzieren'
  AND target_level = 'Bund';

-- Kontrolle (nur lesen):
SELECT slug, target_parties, backup_recipient
FROM public.campaigns
WHERE slug = 'demokratiearbeit-finanzieren';
```

## Apply order

1. Migration `045_campaign_party_rule_backup.sql` im SQL Editor ausführen (Code toleriert fehlende Spalten, Reihenfolge zum Deploy ist frei).
2. Deploy (Push auf `main`).
3. UPDATE oben ausführen.
4. Smoke-Test auf der Live-Kampagne: PLZ 28195 (lokaler Koalitions-MdB vorausgewählt, keine Ersatz-Karte) und PLZ 10243 (nur Ersatz-Karte, Hinweis, MdB-Suche eingeklappt). Optional 06249 und 29216.

## Notes

- Ersatz-Briefe erscheinen in den Ersteller-Statistiken als "Fester Empfänger", weil `campaign_fixed` wiederverwendet wird.
- Backlog-Hinweis: Ersteller-Formular bzw. Admin-Oberfläche für `target_parties` und `backup_recipient` ist bewusst nicht gebaut (D-05); als eigene Story erfassen, falls mehr Kampagnen das brauchen.
- `MIGRATION_STATUS.md` war vorher sauber; Zeile für 045 (Pending) angehängt und committet.
- Kampagnen-Landingtexte und CampaignHero unverändert (D-06).

## Verification

- Zielsuiten pro Task grün, danach Gesamtlauf `cd web && npx jest`: 211 Suites, 2797 Tests, alle grün (inklusive der unrelated schmutzigen Email-Dateien im Worktree).
- `cd web && npx tsc --noEmit`: ohne Fehler.
- `npx eslint` auf Step3Success.tsx, campaignRecipientRule.ts, schema.ts, generateLetter.ts: ohne Ausgabe.
- Mistral wurde nirgends real aufgerufen; Prompt-Tests nutzen `buildSystemPrompt` und `buildUserPrompt` direkt.

## Deviations from Plan

### Auto-fixed / process deviations

**1. [Process] Commits auf Branch `gsd/quick-261126-fit` statt `main`**
- **Found during:** Task 1 commit
- **Issue:** Der Pre-Commit-Guard stuft `main` als geschützten Branch ein (`git.allow_default_branch_commits` nicht gesetzt) und verlangt Abbruch.
- **Fix:** Lokalen Branch `gsd/quick-261126-fit` von `main` (6805756) angelegt, alle drei Commits dort. Nichts gepusht, Konfiguration nicht geändert. Zum Übernehmen: `git checkout main && git merge --ff-only gsd/quick-261126-fit`.
- **Commit:** a612a2d, 42c00cc, 3db172d

**2. [Scope] `campaignFixedRecipient.ts` in Commit 1 statt Commit 2**
- Die Regeldatei braucht `role` im Empfänger-Typ, daher kam die kleine Änderung schon in Task 1.

Sonst: Plan wie geschrieben ausgeführt. Keine Auth-Gates.

## Known Stubs

None.

## Threat Flags

None (keine neue Angriffsfläche über den Threat-Register-Plan hinaus; Mitigationen T-01 bis T-04 sind umgesetzt und getestet).

## Self-Check: PASSED

- Dateien vorhanden: Migration 045, `campaignRecipientRule.ts`, beide neuen Testdateien.
- Commits vorhanden: a612a2d, 42c00cc, 3db172d (Vorfahren von HEAD).

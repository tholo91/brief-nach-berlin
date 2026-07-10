---
phase: quick-260710-dgq
plan: 01
subsystem: campaigns
tags: [campaigns, wizard, level-routing, supabase]
requires:
  - 999.6 level routing (lookupPLZWithLevel, LevelRoutingContext, StepLevelSelect)
provides:
  - Campaign.targetLevel ("Bund" | "Land") + Campaign.targetState (bundeslandKey | null)
  - Creator-Formularfeld "Wohin soll die Kampagne gehen?"
  - Wizard-Ebenen-Bindung fuer Kampagnen inkl. PLZ-Mismatch-Fallback
affects:
  - Kampagnen-Anlage, Kampagnenseite (Hero), Besucher-Wizard
tech-stack:
  added: []
  patterns:
    - resolveCampaignTarget als pure, testbare Default-Funktion in schema.ts (Repository ist server-only und in Jest nicht importierbar)
key-files:
  created:
    - web/supabase/migrations/011_campaign_target_level.sql
    - web/src/__tests__/campaignTargetLevel.test.ts
  modified:
    - web/src/lib/campaigns/schema.ts
    - web/src/lib/campaigns/repository.ts
    - web/src/lib/actions/createCampaignDraft.ts
    - web/src/components/campaigns/CreatorCampaignForm.tsx
    - web/src/lib/wizard-handoff.ts
    - web/src/lib/types/wizard.ts
    - web/src/components/campaigns/CampaignHero.tsx
    - web/src/components/campaigns/CampaignIssueStarter.tsx
    - web/src/components/wizard/WizardShell.tsx
    - web/src/lib/actions/submitWizard.ts
decisions:
  - "createCampaignSchema lehnt targetState bei targetLevel Bund per superRefine ab (statt still auf null zu normalisieren); createCampaignDraft normalisiert Form-Input vorher, sodass der User nie diesen Fehler sieht"
  - "resolveCampaignTarget in schema.ts extrahiert, damit der Altdaten-Default (Bund) ohne server-only-Import testbar ist"
  - "Mismatch-Panel ersetzt Step1bOptional auf Step 2b; Zurueck-Navigation bleibt verfuegbar und cleart das Panel"
metrics:
  duration: ~59min
  completed: 2026-07-10
---

# Quick Task 260710-dgq: Kampagnen-Ziel-Ebene (Bund/Landtag + Bundesland) Summary

Kampagnen tragen jetzt eine feste politische Ziel-Ebene (Bundestag oder Landtag, optional festes Bundesland); der Besucher-Wizard ueberspringt den Ebene-Step, bindet den Empfaenger fest an die Kampagnen-Ebene und faengt PLZ-Mismatches bei fester Bundesland-Bindung freundlich ab.

## Task Commits

| Task | Name | Commit |
| ---- | ---- | ------ |
| 1 | Datenmodell, Migration, Repository und Creator-Action | f376904 |
| 2 | Creator-Formularfeld, Handoff und leichte Hero-Copy | 8143ac7 |
| 3 | Wizard-Ebenen-Bindung, PLZ-Mismatch-Fallback und Tests | 6416a1a |

## What Was Built

- **Datenmodell (D1, D6):** Migration 011 fuegt `target_level` (default 'Bund', CHECK Bund/Land) und `target_state` (nullable bundeslandKey) auf `public.campaigns` hinzu. `mapCampaign` defaultet Altdaten via `resolveCampaignTarget` auf Bund. `createCampaignSchema` erzwingt per superRefine, dass targetState nur bei Land gesetzt ist. `BUNDESLAND_NAMES`/`BUNDESLAND_KEYS` sind die Single Source fuer Dropdown und Hero-Copy. Kommune ist an keiner Stelle waehlbar.
- **Creator-Formular (D2):** Pflichtfeld "Wohin soll die Kampagne gehen?" (Radio Bundestag/Landtag, Default Bundestag) in Schritt 1; bei Landtag ein optionales Bundesland-Select mit Default "Alle Bundesländer". Auswahl wandert in den localStorage-Draft und ueber hidden inputs in die finale FormData; `createCampaignDraft` normalisiert ungueltige Keys auf null.
- **Handoff + Hero (D7, D8):** `WizardHandoff` transportiert `campaignTargetLevel`/`campaignTargetState` mit Typ-Guards. `CampaignHero` passt die Intro-Copy an die Ebene an (Bundestag / Landtag von X / zustaendiger Landtag) und zeigt NUR bei Land-Kampagnen eine dezente Pill unter dem Titel: "Landtagskampagne · {Bundesland}" bzw. "Landtagskampagne". Keine Gedankenstriche in User-Copy.
- **Wizard-Bindung (D3, D4):** Bei `wizardData.campaign` wird der "level"-Step uebersprungen, `selectedLevel` fest auf `targetLevel` gesetzt und `onChangeLevel` in Step3Success nicht angeboten. Die Prompt-Ebene ergibt sich automatisch aus `recipient.level` (mdb -> Bund, mdl -> Land), kein separater Parameter noetig. `levelRouting` bleibt gesetzt, damit fuer Land `byLevel.Land` die Empfaengerliste liefert; die Auto-Empfehlung lenkt nie um.
- **PLZ-Mismatch (D5):** `submitWizard` prueft VOR dem Rate-Limit-Spend (kein Token-Verbrauch), ob die Besucher-PLZ im gebundenen Bundesland liegt, und liefert sonst `campaign_state_mismatch`. Der Wizard zeigt ein freundliches waldgruenes Panel mit der Meldung "Diese Kampagne richtet sich an den Landtag von {X}. Deine Postleitzahl liegt in einem anderen Bundesland." plus Button "Stattdessen einen freien Brief schreiben", der die Kampagnen-Bindung loescht und den normalen Flow (mit Ebenen-Erkennung) weiterlaufen laesst. Kein harter Stopp, kein Brief an den falschen Landtag.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] resolveCampaignTarget statt mapCampaign-Export fuer Tests**
- **Found during:** Task 3
- **Issue:** `repository.ts` importiert `server-only`; Jest hat keinen Mock dafuer, ein Import im Test wuerde crashen.
- **Fix:** Pure Default-Funktion `resolveCampaignTarget` nach `schema.ts` extrahiert und in `mapCampaign` verwendet - der Test prueft damit den echten Produktionscode-Pfad ohne server-only-Import.
- **Files modified:** web/src/lib/campaigns/schema.ts, web/src/lib/campaigns/repository.ts
- **Commit:** 6416a1a

**2. [Rule 2 - Missing critical] wizardData.campaign in submitWizard-Payload**
- **Found during:** Task 3
- **Issue:** `WizardShell.submitWizard` baute `fullData` ohne das `campaign`-Feld - der serverseitige Mismatch-Check haette nie gegriffen.
- **Fix:** `campaign: wizardData.campaign` in die Action-Payload aufgenommen.
- **Files modified:** web/src/components/wizard/WizardShell.tsx
- **Commit:** 6416a1a

**3. [Rule 2 - Missing critical] Altdaten-Draft-Koerzierung im Creator-Formular**
- **Found during:** Task 2
- **Issue:** Bestehende localStorage-Drafts ohne targetLevel haetten `""` geladen - kein Radio waere gecheckt gewesen.
- **Fix:** Draft-Loader koerziert unbekannte Werte auf "Bund" und leert targetState.
- **Files modified:** web/src/components/campaigns/CreatorCampaignForm.tsx
- **Commit:** 8143ac7

## Verification

- `npx tsc --noEmit`: gruen (nach jedem Task)
- `npx jest campaignTargetLevel`: 9/9 gruen
- Bestehende Suiten `lookupPLZWithLevel levelRouter routingToken rathausRecipient generateLetterLevelPrompt`: 40/40 gruen

## User Setup Required

**Supabase (manuell, vor Deploy):** Migration `web/supabase/migrations/011_campaign_target_level.sql` im Supabase Studio SQL Editor (Projekt brief-nach-berlin) ausfuehren. Ohne Migration schlagen Kampagnen-Inserts mit target_level fehl.

Danach manuell testen: Kampagne mit Landtag + festem Bundesland anlegen, Kampagnenseite oeffnen, mit PLZ aus anderem Bundesland durch den Wizard (Mismatch-Panel), mit passender PLZ (Brief an MdL, Ebene-Step uebersprungen).

## Known Stubs

None - alle Felder sind durchgaengig verdrahtet (Formular -> DB -> Handoff -> Wizard -> Empfaenger).

## Self-Check: PASSED

---
phase: quick-261126-fit
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/supabase/migrations/045_campaign_party_rule_backup.sql
  - web/supabase/MIGRATION_STATUS.md
  - web/src/lib/campaigns/schema.ts
  - web/src/lib/campaigns/repository.ts
  - web/src/lib/lookup/campaignRecipientRule.ts
  - web/src/lib/lookup/campaignFixedRecipient.ts
  - web/src/lib/actions/submitWizard.ts
  - web/src/lib/types/wizard.ts
  - web/src/lib/actions/selectPolitician.ts
  - web/src/lib/actions/resendLetter.ts
  - web/src/app/api/generate-letter/route.ts
  - web/src/lib/generation/generateLetter.ts
  - web/src/components/wizard/Step3Success.tsx
  - web/src/lib/i18n/wizardCopy.ts
  - web/src/__tests__/campaignRecipientRule.test.ts
  - web/src/__tests__/campaignRolloutSafety.test.ts
  - web/src/__tests__/recipientSelectionHardening.test.ts
  - web/src/__tests__/generateLetterLevelPrompt.test.ts
  - web/src/__tests__/step3CampaignBackup.test.ts
autonomous: true
requirements: [QUICK-261126-fit]

estimate:
  tokens: 120000
  raw_tokens: 120000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "A Bund campaign with target_parties {CDU/CSU,SPD} offers in Step 3 only MdBs whose party string is exactly CDU/CSU or SPD (per D-01); for PLZ 28195 the local match is preselected (direct first, list MdBs in the expandable area) and no backup recipient is offered (per D-03)"
    - "For a PLZ without a local party match (10243 only Linke, 06249 only AfD, 29216 no MdB at all) and a configured backup_recipient, Step 3 shows only the backup recipient, preselected, plus one short hint sentence; the nationwide party-filtered MdB search sits collapsed behind a toggle (per D-02, D-03)"
    - "Without backup_recipient, a PLZ without local match behaves exactly like today: nationwide searchable list of the party-filtered MdBs (per D-03)"
    - "The browser only sends {kind: campaign_fixed}; the server resolves the backup address from the campaign slug and accepts it only when the PLZ has no local party match; MdB picks outside the party list are rejected (per D-02, D-04)"
    - "The letter to the backup recipient uses the salutation 'Sehr geehrte Frau Bundesministerin Prien,' and frames the request through her stored role (ministry responsibility), not a Wahlkreis (per D-04)"
    - "Existing Fixed campaigns and ID-restricted campaigns behave unchanged: the prompt without role is byte-identical, existing Jest suites stay green, the campaign landing copy is untouched (per D-06)"
    - "Configuration is SQL only: migration 045 adds target_parties and backup_recipient with constraints, and a ready-to-run UPDATE for slug demokratiearbeit-finanzieren is documented; no creator form or admin UI is added (per D-05)"
  artifacts:
    - path: web/supabase/migrations/045_campaign_party_rule_backup.sql
      provides: "campaigns.target_parties text[] + campaigns.backup_recipient jsonb with Bund-only constraints, commented UPDATE for demokratiearbeit-finanzieren"
    - path: web/src/lib/lookup/campaignRecipientRule.ts
      provides: "campaignAllowedPoliticianIds, campaignBackupRecipient, resolveCampaignRecipientRule, campaignSelectionAllowed (one rule for submitWizard, route, selectPolitician, resendLetter)"
    - path: web/src/__tests__/campaignRecipientRule.test.ts
      provides: "Party filter, intersect with IDs, local match incl. list MdB, backup only without local match, no-backup fallback, invalid jsonb tolerated"
    - path: web/src/__tests__/step3CampaignBackup.test.ts
      provides: "Render check: backup card preselected, hint shown, MdB search collapsed; without backup today's search"
  key_links:
    - from: web/src/lib/campaigns/repository.ts
      to: web/src/lib/campaigns/schema.ts
      via: "mapCampaign reads target_parties and backup_recipient via parseCampaignPartyRule"
    - from: web/src/lib/actions/submitWizard.ts
      to: web/src/lib/lookup/campaignRecipientRule.ts
      via: "campaignAllowedPoliticianIds + campaignBackupRecipient replace the targetPoliticianIds-only computation; result.campaignBackupRecipient"
    - from: web/src/app/api/generate-letter/route.ts
      to: web/src/lib/lookup/campaignRecipientRule.ts
      via: "resolveCampaignRecipientRule(campaign, data.plz) feeds the guard and resolveRecipientSelection(campaignFixedRecipient ?? backupRecipient)"
    - from: web/src/components/wizard/Step3Success.tsx
      to: web/src/lib/types/wizard.ts
      via: "result.campaignBackupRecipient drives backup card, currentSelection {kind: campaign_fixed}"
    - from: web/src/lib/generation/generateLetter.ts
      to: web/src/lib/lookup/campaignFixedRecipient.ts
      via: "CampaignFixedRecipientRecipient.role switches the fixed-recipient prompt blocks to the role-aware variant"
---

<objective>
Kampagnen mit target_level 'Bund' bekommen zwei per SQL gesetzte Felder: eine Partei-Regel (target_parties, z. B. {"CDU/CSU","SPD"}) und einen Ersatz-Empfänger (backup_recipient, Form wie CampaignFixedRecipient plus optional role). Step 3 zeigt lokale Treffer der Parteien wie heute bei eingeschränkten Kampagnen; ohne lokalen Treffer erscheint nur der Ersatz-Empfänger, vorausgewählt, die bundesweite Partei-Liste eingeklappt darunter. Der Brief an den Ersatz-Empfänger läuft über den bestehenden campaign_fixed-Pfad mit serverseitiger Auflösung.

Locked decisions from the user interview are cited as D-01 to D-06 (D-01 party rule as names, D-02 backup recipient in CampaignFixedRecipient shape, D-03 Step-3 routing, D-04 letter role and server resolution, D-05 SQL-only config, D-06 landing copy unchanged).

Purpose: Die Kampagne demokratiearbeit-finanzieren richtet sich an MdBs der Regierungsparteien. Rund 1.149 von 10.812 PLZ haben keinen solchen MdB; dort soll der Brief an die zuständige Ministerin gehen statt an ein beliebiges MdB aus einem anderen Wahlkreis.
Output: Migration 045, eine Regel-Datei für alle vier Server-Stellen, Step-3-Karte mit Hinweis, rollenbewusster Prompt, Tests.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@web/src/lib/campaign-recipient-picker.ts
@web/src/lib/lookup/campaignFixedRecipient.ts
@web/src/lib/lookup/resolveRecipient.ts
@web/supabase/migrations/023_campaign_fixed_recipient.sql
@web/supabase/migrations/041_campaign_personal_hooks.sql

Verified facts (planner + coordinator data check, 2026-11-26):
- Bundestag party strings in web/data/politicians-cache.json are exactly: SPD, CDU/CSU (combined, no separate CSU), Die Linke, AfD, fraktionslos, and the Greens string which contains a soft hyphen (U+00AD). The campaign config is therefore target_parties = {"CDU/CSU","SPD"}.
- lookupPLZ(plz).politicians returns all Bundestag MdBs of the PLZ Wahlkreise, direct AND list (filter by wahlkreisId only). Local match = those politicians whose id is in the allowed set.
- Test PLZ: 28195 has a coalition MdB; 10243 only Linke; 06249 only AfD; 29216 no MdB at all.
- resolveRecipientSelection (mdb) already does: allowed IDs with local match -> only local; without local match -> all allowed IDs nationwide. Reuse it, do not duplicate.
- The three guard sites route.ts (~line 236), selectPolitician.ts (~line 97), resendLetter.ts (~line 103) contain the same block: allowedPoliticianIds from campaign.targetPoliticianIds, getCampaignFixedRecipient, a guard rejecting non-mdb selections when allowedPoliticianIds is non-empty. All three switch to the new rule.
- getPublicCampaignBySlug selects * from campaigns, so new columns flow through mapCampaign. publishCampaignEdits and approve_campaign write explicit column lists, so SQL-set target_parties and backup_recipient survive creator edits (same reasoning as 041 personal_hooks).
- campaign_fixed letters already work end-to-end (prompt, email, letter signals, resend). Reusing kind campaign_fixed means no change in web/src/lib/email/* (those files are dirty in the worktree from other work: do not touch them).

Worktree caveat: unrelated uncommitted changes exist (.planning/ROADMAP.md, .planning/STATE.md, web/src/__tests__/buildEmailHtmlRecipients.test.ts, web/src/lib/email/buildEmailHtml.ts, web/src/lib/email/mailLocale.ts, an untracked 261117-r86 SUMMARY). Stage only files from files_modified, each by explicit path, never git add -A or git add . or git commit -a.
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Tracer: Partei-Regel und Ersatz-Empfänger von der DB bis zur Step-3-Antwort von submitWizard</name>
  <files>web/supabase/migrations/045_campaign_party_rule_backup.sql, web/supabase/MIGRATION_STATUS.md, web/src/lib/campaigns/schema.ts, web/src/lib/campaigns/repository.ts, web/src/lib/lookup/campaignRecipientRule.ts, web/src/lib/actions/submitWizard.ts, web/src/lib/types/wizard.ts, web/src/__tests__/campaignRecipientRule.test.ts, web/src/__tests__/campaignRolloutSafety.test.ts</files>
  <read_first>web/supabase/migrations/023_campaign_fixed_recipient.sql, web/supabase/migrations/041_campaign_personal_hooks.sql, web/src/lib/campaigns/schema.ts (lines 59-125, 277-320), web/src/lib/campaigns/repository.ts (CampaignRow ~30-60, mapCampaign ~180-215), web/src/lib/actions/submitWizard.ts (lines 150-230 and the return at ~372), web/src/lib/types/wizard.ts (~185-200), web/src/__tests__/campaignRecipientAllowlist.test.ts (mock pattern), web/src/__tests__/campaignRolloutSafety.test.ts (mock factory lines 1-80 and the no-local-match case ~331)</read_first>
  <behavior>
    - campaignAllowedPoliticianIds: no parties, IDs [7,7,999999] -> restricted true, allowed [7,999999] (dedup only, unchanged semantics, getAllBundestagPoliticians not called)
    - campaignAllowedPoliticianIds: parties ["CDU/CSU","SPD"], no IDs -> restricted true, allowed is non-empty and every allowed ID belongs to a CDU/CSU or SPD politician in the real cache
    - campaignAllowedPoliticianIds: parties and IDs both set -> intersection (an SPD ID stays, a Linke ID drops)
    - campaignAllowedPoliticianIds: parties ["CSU"] (typo) -> restricted true, allowed [] (misconfig is visible, not silently unrestricted)
    - party match ignores soft hyphen and surrounding whitespace on both sides
    - resolveCampaignRecipientRule with backup: PLZ 28195 -> backupRecipient null; PLZ 10243, 06249, 29216 -> backupRecipient set with kind campaign_fixed and the stored salutation
    - local match via a list MdB only (lookupPLZ mocked to return one non-direct SPD MdB) -> backupRecipient null
    - campaign without backup and no local match -> backupRecipient null (today's nationwide search)
    - parseCampaignPartyRule: invalid backup jsonb -> backupRecipient null without throwing; target_level other than Bund -> parties [] and backup null
    - submitWizardAction (campaignRolloutSafety): party+backup campaign and a PLZ without local match returns campaignRestricted, campaignRestrictedNoLocalMatch and campaignBackupRecipient; with a local match no campaignBackupRecipient key
  </behavior>
  <action>
Migration (per D-01, D-02, D-05): create web/supabase/migrations/045_campaign_party_rule_backup.sql. Do not touch 044. Header comment in German, style of 041: apply manually in the Supabase SQL Editor; columns live only on campaigns, not on campaign_revisions, because approve_campaign and publishCampaignEdits write explicit column lists and leave them untouched (same as personal_hooks in 041); no new table, so no REVOKE/GRANT (the 033 pattern applies to new tables only); the code tolerates missing columns, so apply order versus deploy is free. Wrap in BEGIN/COMMIT. Add to public.campaigns: target_parties text[] not null default '{}' and backup_recipient jsonb. Constraints with drop-if-exists first: campaigns_target_parties_require_bund check (target_level = 'Bund' or cardinality(target_parties) = 0); campaigns_backup_recipient_valid check (backup_recipient is null or (target_level = 'Bund' and jsonb_typeof(backup_recipient) = 'object' and (cardinality(target_parties) > 0 or cardinality(target_politician_ids) > 0))). Add a comment that party values must match the Politician.party strings exactly (CDU/CSU combined; Greens contain a soft hyphen). At the bottom, as SQL comments (not executed), the ready-to-run UPDATE for slug demokratiearbeit-finanzieren with a where on target_level = 'Bund': target_parties = '{"CDU/CSU","SPD"}', backup_recipient = jsonb_build_object with organizationName 'Bundesministerium für Bildung, Familie, Senioren, Frauen und Jugend', personName 'Frau Bundesministerin Karin Prien', role 'Bundesministerin für Bildung, Familie, Senioren, Frauen und Jugend, für das Anliegen zuständig', salutation 'Sehr geehrte Frau Bundesministerin Prien,', street 'Glinkastraße', houseNumber '24', postalCode '10117', city 'Berlin', countryCode 'DE', plus updated_at = now(). Then a read-only check query (select slug, target_parties, backup_recipient from campaigns where slug = ...). The personName form is planner discretion (envelope convention); say in a comment that Thomas may adjust it before running.

MIGRATION_STATUS.md: first run git diff --quiet on web/supabase/MIGRATION_STATUS.md. Append one table row for 045 after the 044 row: status Pending; Thomas applies in the SQL Editor, then runs the commented UPDATE; code reads the columns via select * and works before and after. If the file was already dirty from other work, append only and leave it unstaged; report that in the SUMMARY.

Schema (web/src/lib/campaigns/schema.ts, per D-02, D-04): add an optional role field to campaignFixedRecipientSchema (trimmed string, min 2, max 200, optional, no default, so existing Fixed jsonb and creator forms stay byte-identical). Extend the Campaign type with optional targetParties?: string[] and backupRecipient?: CampaignFixedRecipient | null (optional like personalHooks, so existing fixtures compile). Add a pure exported function parseCampaignPartyRule(row with target_level, target_parties, backup_recipient) returning { targetParties, backupRecipient }: parties trimmed and empty strings dropped; for target_level other than Bund both empty/null; backup via campaignFixedRecipientSchema.safeParse, on failure console.error with a short German message without the payload and return null (a typo in SQL must not take the campaign page down). CampaignRevision stays unchanged.

Repository (web/src/lib/campaigns/repository.ts): add target_parties?: string[] | null and backup_recipient?: unknown to CampaignRow; in mapCampaign spread parseCampaignPartyRule(row). Do not touch mapRevision, createCampaign, update or publish paths.

Rule module (new web/src/lib/lookup/campaignRecipientRule.ts, server-only data via ./plzLookup; never import it from client components). Export:
- campaignAllowedPoliticianIds(campaign) -> { restricted, allowedPoliticianIds }. Input is Pick of targetLevel, targetPoliticianIds plus optional targetParties, backupRecipient. IDs are deduped. Without parties (or not Bund) return restricted = IDs non-empty and allowed = deduped IDs, without calling getAllBundestagPoliticians (keeps campaignRolloutSafety expectations). With parties: party set normalized (strip U+00AD, trim) compared against the normalized Politician.party of getAllBundestagPoliticians(); allowed = IDs non-empty ? IDs intersected with party IDs : party IDs; restricted = true.
- campaignBackupRecipient(campaign) -> CampaignFixedRecipientRecipient | null: buildCampaignFixedRecipient(backupRecipient) only for targetLevel Bund with a backup and a restriction (parties or IDs); no PLZ logic here.
- resolveCampaignRecipientRule(campaign | null, plz) -> { restricted, allowedPoliticianIds, backupRecipient }: null campaign -> not restricted, [], null. backupRecipient is set only when campaignBackupRecipient returns one AND lookupPLZ(plz).politicians has no id in the allowed set. Call lookupPLZ lazily, only when a backup is configured (existing tests that mock nothing must not hit it).
- campaignSelectionAllowed(rule, kind) -> boolean: not restricted -> true; kind mdb -> allowedPoliticianIds non-empty; kind campaign_fixed -> backupRecipient not null; everything else false.

submitWizard (web/src/lib/actions/submitWizard.ts, per D-03): extend the campaignTarget object with targetParties and backupRecipient from the loaded campaign. Replace the campaignTargetIds line with campaignAllowedPoliticianIds(campaignTarget) (or not restricted for no campaign); keep getBundestagPoliticiansByIds(allowed), the local filter, campaignRestricted = rule.restricted, campaignRestrictedNoLocalMatch and the existing error for restricted with zero politicians exactly as they are. Compute campaignBackup = campaignRestrictedNoLocalMatch && campaignTarget ? campaignBackupRecipient(campaignTarget) : null. Add backup: Boolean(campaignBackup) and partyRule: Boolean(targetParties length) to the plz lookup log (no PLZ, no names). Return campaignBackupRecipient only when set (spread pattern like campaignRestrictedNoLocalMatch). In web/src/lib/types/wizard.ts add campaignBackupRecipient?: CampaignFixedRecipientRecipient to the disambiguationNeeded branch with a one-line German doc comment.

Tests: new web/src/__tests__/campaignRecipientRule.test.ts covering the behavior list. Mock @/lib/lookup/plzLookup with jest.requireActual and lookupPLZ as jest.fn whose default implementation calls the actual one (pattern from campaignRecipientAllowlist.test.ts); the list-MdB case overrides it once. Extend campaignRolloutSafety.test.ts with two submitWizard cases (backup returned without local match; absent with local match); add getAllBundestagPoliticians: jest.fn() to its plzLookup mock factory. Mock @/lib/mistral wherever generation could be reached (project rule: never real Mistral calls).
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/campaignRecipientRule.test.ts src/__tests__/campaignRolloutSafety.test.ts src/__tests__/campaignRecipientAllowlist.test.ts src/__tests__/campaignFixedRecipient.test.ts src/__tests__/campaignTargetLevel.test.ts && npx tsc --noEmit</automated>
  </verify>
  <done>Migration 045 exists with both columns, both constraints and the commented UPDATE; MIGRATION_STATUS has a Pending row for 045; a party+backup campaign returns campaignBackupRecipient from submitWizardAction only for PLZ without a local party match; ID-only campaigns return exactly what they returned before; the listed suites and tsc pass.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Brief an den Ersatz-Empfänger: Server-Guards über die Regel und rollenbewusster Prompt</name>
  <files>web/src/lib/lookup/campaignFixedRecipient.ts, web/src/lib/generation/generateLetter.ts, web/src/app/api/generate-letter/route.ts, web/src/lib/actions/selectPolitician.ts, web/src/lib/actions/resendLetter.ts, web/src/__tests__/recipientSelectionHardening.test.ts, web/src/__tests__/generateLetterLevelPrompt.test.ts</files>
  <read_first>web/src/app/api/generate-letter/route.ts (lines 220-265, 340-370), web/src/lib/actions/selectPolitician.ts (lines 85-130), web/src/lib/actions/resendLetter.ts (lines 95-160), web/src/lib/generation/generateLetter.ts (constants at ~280-350, buildSystemPrompt ~395-425, buildUserPrompt ~600-650), web/src/__tests__/recipientSelectionHardening.test.ts (lines 1-130 and the campaign_fixed cases 157-250), web/src/__tests__/generateLetterLevelPrompt.test.ts (fixed-recipient case ~177-192)</read_first>
  <behavior>
    - selectPoliticianAction, party+backup campaign, PLZ 10243, selection {kind: campaign_fixed} -> resolveRecipientSelection is called with campaignFixedRecipient equal to the built backup recipient (address from the campaign, not the client)
    - same campaign, PLZ 28195, selection campaign_fixed -> rejected with "Empfänger nicht gefunden." before resolution
    - party campaign without backup, selection campaign_fixed -> rejected
    - existing case "übergibt den festen Kampagnenempfänger ..." keeps its exact toHaveBeenCalledWith options object (no new option keys)
    - resendLetterAction accepts campaign_fixed for the backup case (PLZ 10243) and rejects it for 28195
    - buildSystemPrompt with campaignFixedRecipient carrying role contains the role text and the exact salutation, and does not contain the no-function sentence of the role-less block
    - buildSystemPrompt for a fixed recipient without role is byte-identical to before (existing assertions unchanged)
    - buildUserPrompt with role adds an amt entry with the role to the empfaenger item
  </behavior>
  <action>
Recipient (web/src/lib/lookup/campaignFixedRecipient.ts, per D-04): add optional role?: string to CampaignFixedRecipientRecipient; buildCampaignFixedRecipient copies it only when set (spread, so campaignFixedRecipient.test.ts toEqual stays green). Keep label, postalAddress and address line order unchanged (the Fixed NRV campaign depends on them). getCampaignFixedRecipient stays Fixed-only (CampaignHero uses it; landing copy unchanged per D-06).

Guards (per D-02, D-04, kind campaign_fixed reused, no new recipient kind, so no letter_signals constraint, email or stats change): in route.ts, selectPolitician.ts and resendLetter.ts replace the local allowedPoliticianIds line and the non-mdb guard with: rule = resolveCampaignRecipientRule(campaign, data.plz); if rule.restricted and not campaignSelectionAllowed(rule, selection kind) -> the existing "Empfänger nicht gefunden." response of that file (same status/shape as today). Keep the Bundeskanzler guard and the Fixed guard (campaignFixedRecipient from getCampaignFixedRecipient) unchanged. Pass to resolveRecipientSelection the same option keys as today: allowedPoliticianIds: rule.allowedPoliticianIds, campaignSlug, campaignFixedRecipient: campaignFixedRecipient ?? rule.backupRecipient. For campaigns without parties and without backup this yields the identical values as before. Do not touch web/src/lib/email/*, letterSignals or resolveRecipient.ts.

Prompt (web/src/lib/generation/generateLetter.ts, per D-04): when input.campaignFixedRecipient.role is set, buildSystemPrompt uses role-aware variants of the three fixed constants (Zuständigkeit block, Bitte line, Partei header) instead of FIXED_CAMPAIGN_RECIPIENT_ZUSTAENDIGKEIT_BLOCK, FIXED_CAMPAIGN_RECIPIENT_BITTE_LINE, FIXED_CAMPAIGN_RECIPIENT_PARTEI_HEADER; salutation replacement stays as is. Content of the variants, written as positive directives (project prompt style): the recipient is the stored person in the stored function (quote the role); address her in that function and base the single request on the responsibility that comes with it (for a minister: her ministry's responsibility for the issue); the Wahlkreis plays no role; name no party; the address describes only the recipient. Without role the prompt must stay byte-identical. In buildUserPrompt add amt: role to the institutional empfaenger entry when the fixed recipient has a role (same key the landesminister entry uses). No real Mistral calls: tests use buildSystemPrompt/buildUserPrompt directly and @/lib/mistral stays mocked.

Tests: extend recipientSelectionHardening.test.ts with the selectPolitician and resend cases from the behavior list (campaign fixture with targetLevel Bund, targetPoliticianIds [], targetParties ["CDU/CSU","SPD"], backupRecipient Prien shape; real PLZ data 10243 vs 28195; resolveRecipient stays mocked as in the file). Extend generateLetterLevelPrompt.test.ts with the role cases. Write the new assertions first and watch them fail, then implement.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/recipientSelectionHardening.test.ts src/__tests__/generateLetterLevelPrompt.test.ts src/__tests__/generateLetterRouteHardening.test.ts src/__tests__/campaignFixedRecipient.test.ts src/__tests__/campaignRecipientRule.test.ts src/__tests__/generateLetterAdultRegression.test.ts && npx tsc --noEmit</automated>
  </verify>
  <done>Selecting campaign_fixed works server-side for a party+backup campaign only when the PLZ has no local party match, resolving the address from the campaign; MdB picks are limited to the party list; the prompt carries the role and exact salutation for the backup letter; prompts without role are unchanged; listed suites and tsc pass.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Step 3: Ersatz-Empfänger-Karte, ein Hinweissatz, eingeklappte bundesweite Suche</name>
  <files>web/src/components/wizard/Step3Success.tsx, web/src/lib/i18n/wizardCopy.ts, web/src/__tests__/step3CampaignBackup.test.ts</files>
  <read_first>web/src/components/wizard/Step3Success.tsx (lines 190-280 state, 391-400 handleCardSelect, 420-455 displayedPoliticians, 500-521 currentSelection, 1376-1395 selectedPoliticianLabel, 1400-1460 title/intro, 1535-1605 note box and fixed card, 1922-1935 MdB section condition), web/src/lib/i18n/wizardCopy.ts (PickerKey union lines 10-80 and the de/en/tr picker blocks near campaignNoMatch), web/src/__tests__/step3AlternativeRecipients.test.ts (render pattern)</read_first>
  <behavior>
    - Render with result {disambiguationNeeded, politicians: [one CDU/CSU MdB from elsewhere], campaignRestricted, campaignRestrictedNoLocalMatch, campaignTargetCount: 1, campaignBackupRecipient} and a campaign slug: HTML contains "Frau Bundesministerin Karin Prien", the backup card has aria-checked="true", the hint sentence is present, the show-toggle label is present, the MdB's name and the campaign-recipient-search input are absent
    - Same result without campaignBackupRecipient: the campaign-recipient-search input and the MdB name are rendered (today's behavior)
    - A Fixed campaign render (level Fixed with fixedRecipient) still shows the fixed badge and fixed note (refactor does not change it)
  </behavior>
  <action>
UI (per D-03; project preference: apply the frontend-design skill lens, but reuse the existing visual language, no new styles). In Step3Success.tsx:
- Read campaignBackupRecipient from result (same guarded pattern as campaignRestrictedNoLocalMatch). State campaignBackupSelected (initial true when a backup exists) and showBackupAlternatives (initial false). Derived hideBackupAlternatives = backup exists and not showBackupAlternatives.
- Extract the inline fixed-recipient card (the radio div with badge, organizationName, personName, address, note) into a small local component in the same file taking recipient, selected, badge, optional note, onSelect. Selected/unselected classes mirror the MdB cards (border-waldgruen bg-waldgruen/10 vs border-waldgruen/20 bg-creme). The Fixed case renders it with selected = campaignFixedSelected and the same badge and note, so its markup stays as today.
- Backup case: render this card (badge = new backupBadge, no note) in its own radiogroup directly before the MdB section, followed by a text toggle button styled like the existing showMore button (aria-expanded) with backupShowMdbs / backupHideMdbs. Clicking the card: campaignBackupSelected true, selectedPoliticianId null. Hiding the list: showBackupAlternatives false, campaignBackupSelected true, selectedPoliticianId null (no hidden selection).
- Add the condition not hideBackupAlternatives to the MdB section condition (the block starting with not isKommune and (not isLand or showLandPersonPicker)). The nationwide party chips, search and cards inside stay unchanged.
- handleCardSelect also sets campaignBackupSelected false.
- currentSelection: after the campaign_fixed line, return {kind: campaign_fixed} when the backup exists and is selected; add both to the dependency list. selectedPoliticianLabel: backup selected -> personName or label.
- Title: backup selected -> fill(pc.toTitle, name = personName or label); otherwise the existing campaignRestricted branch. Intro: backup exists -> pc.campaignBackupHint (the one hint sentence). Note box: in the backup case show only the first line (campaignSentence) and drop the second line, so the hint appears exactly once.

Copy (web/src/lib/i18n/wizardCopy.ts): add four keys to PickerKey and to de, en, tr. No em dashes, no first person, Turkish in formal siz, check DE against the signs-of-AI-writing list:
- campaignBackupHint: de "In deinem Wahlkreis sitzt kein MdB aus dieser Kampagnenauswahl, deshalb geht dein Brief an die für das Anliegen zuständige Stelle." en "No Bundestag member from this campaign's selection represents your constituency, so your letter goes to the office responsible for this issue." tr "Seçim bölgenizde bu kampanya seçiminden bir Bundestag milletvekili olmadığı için mektubunuz bu konudan sorumlu makama gider."
- backupBadge: de "Zuständig für das Anliegen" en "Responsible for this issue" tr "Bu konudan sorumlu"
- backupShowMdbs: de "Lieber an ein MdB aus der Kampagnenauswahl schreiben" en "Write to a Bundestag member from the campaign selection instead" tr "Bunun yerine kampanya seçiminden bir milletvekiline yazın"
- backupHideMdbs: de "MdB-Auswahl ausblenden" en "Hide member selection" tr "Milletvekili seçimini gizleyin"
Campaign landing page and CampaignHero stay untouched (D-06). No creator form or admin UI (D-05).

Test: new web/src/__tests__/step3CampaignBackup.test.ts (.ts with React.createElement and renderToStaticMarkup inside LocaleProvider, mocks for selectPolitician, resendLetter, reportError as in step3AlternativeRecipients.test.ts). Write it first, watch it fail, then implement.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/step3CampaignBackup.test.ts src/__tests__/step3AlternativeRecipients.test.ts src/__tests__/step3Landesregierung.test.ts src/__tests__/elternYouthGermanSnapshot.test.ts src/__tests__/elternYouthLocalized.test.ts src/__tests__/campaignRecipientPicker.test.ts && npx tsc --noEmit</automated>
  </verify>
  <done>With a backup and no local match Step 3 shows only the preselected backup card, one hint sentence and a toggle that reveals today's nationwide party-filtered search; without a backup the screen is unchanged; Fixed campaigns render as before; DE/EN/TR keys exist; listed suites and tsc pass.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| browser -> submitWizard / selectPolitician / resendLetter / generate-letter | recipient selection and PLZ are untrusted; campaign config is loaded server-side by slug |
| Thomas (SQL Editor) -> campaigns row | trusted admin input; jsonb may contain typos |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261126fit-01 | Tampering | route.ts, selectPolitician.ts, resendLetter.ts | medium | mitigate | campaignSelectionAllowed + resolveCampaignRecipientRule: campaign_fixed only accepted when a backup is configured and lookupPLZ shows no local party match; otherwise "Empfänger nicht gefunden." |
| T-261126fit-02 | Tampering | campaign_fixed selection payload | medium | mitigate | wizardSchemas keeps {kind: campaign_fixed} strict; address, salutation and role come only from the campaign row (existing LOCK-5 pattern) |
| T-261126fit-03 | Elevation of privilege | MdB selection in party campaigns | low | mitigate | allowedPoliticianIds from the party rule flow into resolveRecipientSelection; a misconfigured party list yields restricted with [] and rejects mdb |
| T-261126fit-04 | Denial of service | mapCampaign on malformed backup_recipient | medium | mitigate | parseCampaignPartyRule uses safeParse and returns null; the campaign stays reachable and falls back to today's nationwide search |
| T-261126fit-05 | Information disclosure | backup address sent to the browser | low | accept | public ministry address of a public office holder; no user data involved |
| T-261126fit-06 | Tampering | role text injected into the Mistral prompt | low | accept | only Thomas writes the role via SQL; not user-controllable |
| T-261126fit-SC | Tampering | npm installs | low | accept | no packages installed in this plan |
</threat_model>

<verification>
- cd web && npx jest (full suite; Mistral is mocked). Report failures in files outside files_modified as pre-existing or caused by the dirty email worktree changes; do not fix them here. If Jest crashes with an alias/dataless error, the files are iCloud-evicted (see memory note: brctl download per file).
- cd web && npx tsc --noEmit
- git diff --cached --name-only lists only paths from files_modified (no web/src/lib/email/*, no .planning/ROADMAP.md or STATE.md).
- grep -c "target_parties" web/supabase/migrations/045_campaign_party_rule_backup.sql is at least 3 (column, constraint, UPDATE comment).
</verification>

<success_criteria>
- PLZ 28195 in a party+backup campaign: local coalition MdB preselected, no backup card.
- PLZ 10243, 06249, 29216: backup card only, preselected, hint shown, MdB search collapsed; the letter request resolves the Prien address server-side.
- Campaigns without target_parties and backup_recipient behave exactly as before (existing suites green, prompt without role unchanged).
- Migration 045 and the commented UPDATE are ready for Thomas; MIGRATION_STATUS lists 045 as Pending.
</success_criteria>

<output>
Create `.planning/quick/261126-fit-kampagnen-partei-regel-und-ersatz-empf-n/261126-fit-SUMMARY.md` when done. Include: the exact UPDATE statement for demokratiearbeit-finanzieren, the apply order (migration, deploy, UPDATE, then a smoke test with PLZ 28195 and 10243 on the live campaign), the note that backup letters appear as "Fester Empfänger" in creator stats (kind campaign_fixed reused), and a backlog hint for the creator form story (not built here, per D-05).
</output>

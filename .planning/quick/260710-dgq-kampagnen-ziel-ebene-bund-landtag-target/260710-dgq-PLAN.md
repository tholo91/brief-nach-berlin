---
phase: quick-260710-dgq
plan: 01
type: execute
wave: 1
depends_on: []
autonomous: true
requirements: [KAMPAGNE-ZIEL-EBENE]
files_modified:
  - web/supabase/migrations/011_campaign_target_level.sql
  - web/src/lib/campaigns/schema.ts
  - web/src/lib/campaigns/repository.ts
  - web/src/lib/actions/createCampaignDraft.ts
  - web/src/components/campaigns/CreatorCampaignForm.tsx
  - web/src/lib/wizard-handoff.ts
  - web/src/lib/types/wizard.ts
  - web/src/components/campaigns/CampaignHero.tsx
  - web/src/components/campaigns/CampaignIssueStarter.tsx
  - web/src/app/(site)/kampagne/[slug]/page.tsx
  - web/src/components/wizard/WizardShell.tsx
  - web/src/lib/actions/submitWizard.ts
  - web/src/__tests__/campaignTargetLevel.test.ts
user_setup:
  - service: supabase
    why: "Neue Spalten target_level / target_state auf public.campaigns"
    dashboard_config:
      - task: "Migration 011_campaign_target_level.sql im SQL Editor ausführen"
        location: "Supabase Studio -> SQL Editor -> Projekt brief-nach-berlin"

must_haves:
  truths:
    - "Creator legt beim Anlegen fest, ob die Kampagne an den Bundestag oder einen Landtag geht"
    - "Bei Landtag kann der Creator ein festes Bundesland wählen oder 'alle Bundesländer' lassen"
    - "Bestehende Kampagnen ohne Feld verhalten sich als targetLevel Bund"
    - "Besucher-Wizard überspringt bei source campaign den Ebene-Step und bindet den Empfänger an die Kampagnen-Ebene"
    - "Bei fester Bundesland-Bindung und abweichender Besucher-PLZ erscheint ein freundlicher Hinweis plus Angebot für einen freien Brief"
    - "Der Mistral-Prompt argumentiert auf der Kampagnen-Ebene (Bund vs Land)"
  artifacts:
    - path: "web/supabase/migrations/011_campaign_target_level.sql"
      provides: "Spalten target_level (default Bund) und target_state (nullable)"
    - path: "web/src/lib/campaigns/schema.ts"
      provides: "targetLevel/targetState im Campaign-Typ + CampaignTargetLevel + BUNDESLAND_NAMES"
    - path: "web/src/components/campaigns/CreatorCampaignForm.tsx"
      provides: "Ziel-Ebene-Pflichtfeld + optionales Bundesland-Dropdown"
    - path: "web/src/components/wizard/WizardShell.tsx"
      provides: "Skip des Level-Steps + Ebenen-Bindung + Mismatch-Panel für Kampagnen"
  key_links:
    - from: "CreatorCampaignForm targetLevel/targetState"
      to: "createCampaignDraft -> createCampaign -> campaigns row"
      via: "FormData + Zod + insert"
      pattern: "target_level|targetLevel"
    - from: "CampaignHero campaign.targetLevel"
      to: "CampaignIssueStarter -> saveHandoff -> WizardShell wizardData.campaign"
      via: "props + sessionStorage handoff"
      pattern: "campaignTargetLevel"
    - from: "wizardData.campaign.targetLevel"
      to: "generate-letter recipient.level (mdb=Bund / mdl=Land)"
      via: "erzwungene Empfänger-Ebene im Wizard"
      pattern: "targetLevel"
---

<objective>
Kampagnen bekommen eine feste politische Ziel-Ebene (Bundestag oder Landtag, optional ein festes Bundesland). Der Creator legt sie beim Anlegen fest, der Besucher-Wizard bindet den Empfänger fest daran und überspringt den Ebene-Auswahl-Step. Bei fester Bundesland-Bindung und abweichender Besucher-PLZ wird freundlich abgefangen.

Purpose: Der Kampagnen-Ersteller hat den politischen Hebel bereits gewählt. Besucher sollen daraus ihren eigenen Brief schreiben, ohne die Kampagne versehentlich auf eine andere Ebene umzulenken.
Output: Datenmodell + Migration, Creator-Formularfeld, Handoff, Wizard-Bindung inkl. Mismatch-Fallback, leichte Hero-Copy, Tests.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/todos/pending/2026-06-29-kampagnen-ziel-bund-oder-landesregierung-festlegen.md

Arbeitsverzeichnis ist der Worktree brief-nach-berlin-999.6 (Branch codex/999-6-level-routing-v2). Alle Pfade relativ dazu.

Locked Entscheidungen (aus dem Todo, mit Thomas am 2026-07-10 geklärt, NICHT neu diskutieren):
1. Campaign speichert targetLevel "Bund"|"Land" und targetState string|null (null = alle Bundesländer, PLZ entscheidet). Kommune ist KEINE Option.
2. Creator-Formular: Pflichtfeld "Wohin soll die Kampagne gehen?" (Bundestag / Landtag); bei Landtag optionales Bundesland-Dropdown (Default "alle Bundesländer").
3. Wizard bei source campaign: StepLevelSelect komplett überspringen, Empfänger fest an Kampagnen-Ebene binden (Bund -> MdB aus PLZ, Land -> MdL aus PLZ). Auto-Level-Erkennung nur als Prompt-Kontext, nie Empfänger umlenken.
4. Mistral-Prompt argumentiert auf der Kampagnen-Ebene.
5. PLZ-Mismatch (Kampagne an festes Bundesland gebunden, Besucher-PLZ liegt woanders): freundlich abfangen mit Hinweis "Diese Kampagne richtet sich an den Landtag von X" plus Angebot, stattdessen einen freien Brief zum Thema zu schreiben (normale Ebenen-Erkennung, ohne Kampagnen-Bindung). Kein harter Stopp.
6. Bestehende Kampagnen ohne Feld gelten als targetLevel Bund (Default im Mapping).
7. Kampagnenseite: leichte Hero-Copy, kein schweres Badge. Ergänzung 2026-07-10: Bei Landtag-Kampagnen zusätzlich eine dezente Pill neben/über dem Kampagnentitel: "Landtagskampagne · {Bundesland}" bei festem Bundesland, sonst "Landtagskampagne". Bundestag-Kampagnen bekommen KEINE Pill (Bund ist das Default-Mental-Model).
8. UI-Texte Deutsch, KEINE Gedankenstriche (em/en dash) in User-Copy.

Projekt-Constraints: Zod v3, Server Actions, kein neues Package. shadcn/ui-Stil und bestehende Wizard-/Form-Patterns exakt weiterverwenden.

<interfaces>
Aus web/src/lib/campaigns/schema.ts — Campaign-Typ hat aktuell keine targetLevel-Felder. Public fields:
```typescript
export const campaignPublicFieldsSchema = z.object({ title, issueText, description, creatorName, externalUrl, logoPath });
export const createCampaignSchema = campaignPublicFieldsSchema.extend({ slug, creatorEmail, moderationStatus, moderationCategories });
export type Campaign = { id; slug; creatorEmail; title; issueText; ...; letterCount; createdAt; updatedAt };
```

Aus web/src/lib/campaigns/repository.ts — CampaignRow (snake_case) + mapCampaign + createCampaign insert. mapCampaign ist die eine Stelle, an der DB->Domain gemappt wird (Default-Handling für Altdaten hier).

Aus web/src/lib/lookup/plzLookup.ts:
```typescript
export function lookupPLZWithLevel(plz: string): PlzLookupResult; // liefert bundeslandKey, bundeslandName, byLevel.{Bund,Land,Kommune}, coverage
```
bundeslandKey Werte: BB BE BW BY HB HE HH MV NI NW RP SH SL SN ST TH
bundeslandName Werte: Baden-Württemberg, Bayern, Berlin, Brandenburg, Bremen, Hamburg, Hessen, Mecklenburg-Vorpommern, Niedersachsen, Nordrhein-Westfalen, Rheinland-Pfalz, Saarland, Sachsen, Sachsen-Anhalt, Schleswig-Holstein, Thüringen

Aus web/src/lib/types/wizard.ts — WizardData.campaign ist heute { slug; title; creatorName?; externalUrl?; logoPath? }. WizardStep = 1 | 2 | "2b" | "level" | 3.

Wichtiger Wiring-Fakt: In web/src/app/api/generate-letter/route.ts wird der Prompt-Level aus `recipient.level` gesetzt (mdb -> Bund, mdl -> Land). Die Prompt-Bindung an die Kampagnen-Ebene entsteht also automatisch, sobald der Wizard die Empfänger-Auswahl (selection.kind) fest an targetLevel bindet. Kein separater "campaign level"-Parameter an generateLetter nötig.

WizardShell (web/src/components/wizard/WizardShell.tsx): nach submitWizard führt result.levelRouting zum "level"-Step (StepLevelSelect); ohne levelRouting direkt zu step 3. recipientsForLevel(politicians, levelRouting, selectedLevel) baut die Empfängerliste. Für Land braucht Step3Success levelRouting.byLevel.Land.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Datenmodell, Migration, Repository und Creator-Action</name>
  <files>web/supabase/migrations/011_campaign_target_level.sql, web/src/lib/campaigns/schema.ts, web/src/lib/campaigns/repository.ts, web/src/lib/actions/createCampaignDraft.ts</files>
  <action>
Datenmodell für targetLevel/targetState anlegen (D1, D6).

1. Migration 011_campaign_target_level.sql (Muster wie 009/010, idempotent, mit Kommentar-Header und Hinweis "Apply manually in Supabase Studio"):
```sql
alter table public.campaigns
  add column if not exists target_level text NOT NULL DEFAULT 'Bund'
    CHECK (target_level IN ('Bund', 'Land')),
  add column if not exists target_state text;
```
Kurz dokumentieren: target_state ist der bundeslandKey (BB/BE/... ) oder NULL = alle Bundesländer; nur relevant wenn target_level = 'Land'.

2. schema.ts:
   - `export const CAMPAIGN_TARGET_LEVELS = ["Bund", "Land"] as const;` + `export type CampaignTargetLevel = (typeof CAMPAIGN_TARGET_LEVELS)[number];`
   - `export const campaignTargetLevelSchema = z.enum(CAMPAIGN_TARGET_LEVELS);`
   - `export const BUNDESLAND_NAMES: Record<string, string>` mit allen 16 Keys->Namen (BB..TH, siehe interfaces). Diese Map ist Single Source für Dropdown-Optionen und Hero-Copy.
   - `export const BUNDESLAND_KEYS = Object.keys(BUNDESLAND_NAMES) as string[];`
   - Campaign-Typ um `targetLevel: CampaignTargetLevel;` und `targetState: string | null;` erweitern.
   - createCampaignSchema um `targetLevel: campaignTargetLevelSchema.default("Bund")` und `targetState: z.enum(Object.keys(BUNDESLAND_NAMES) as [string, ...string[]]).nullable().default(null)` erweitern. Zusätzlich per `.superRefine` erzwingen: wenn targetLevel === "Bund", muss targetState null sein (targetState nur bei Land erlaubt).

3. repository.ts:
   - CampaignRow um `target_level: CampaignTargetLevel | null;` und `target_state: string | null;` erweitern.
   - mapCampaign: `targetLevel: row.target_level ?? "Bund"` (D6 Default für Altdaten), `targetState: row.target_state ?? null`.
   - createCampaign insert: `target_level: parsed.targetLevel`, `target_state: parsed.targetLevel === "Land" ? parsed.targetState : null`.
   - CampaignUpdate-Typ ist nicht zwingend zu erweitern (Ziel-Ebene wird nach Anlegen nicht editiert). Nicht anfassen.

4. createCampaignDraft.ts:
   - createCampaignDraftSchema um `targetLevel: campaignTargetLevelSchema.default("Bund")` und `targetState: z.string().trim().optional()` erweitern; targetState auf gültigen Bundesland-Key normalisieren, sonst null. Regel: bei targetLevel !== "Land" -> targetState = null.
   - Im safeParse-Input `targetLevel: value(formData, "targetLevel") || "Bund"` und `targetState: value(formData, "targetState") || undefined` ergänzen.
   - createCampaign-Aufruf: targetLevel + targetState mitgeben.

Keine Revisions-Änderung (Ziel-Ebene ist kein öffentlicher Revisionstext).
  </action>
  <verify>
    <automated>cd web && npx tsc --noEmit</automated>
  </verify>
  <done>tsc grün. Campaign-Typ, createCampaignSchema und Repository führen targetLevel/targetState; Altdaten defaulten auf Bund; Migration existiert und ist idempotent.</done>
</task>

<task type="auto">
  <name>Task 2: Creator-Formularfeld, Handoff und leichte Hero-Copy</name>
  <files>web/src/components/campaigns/CreatorCampaignForm.tsx, web/src/lib/wizard-handoff.ts, web/src/lib/types/wizard.ts, web/src/components/campaigns/CampaignHero.tsx, web/src/components/campaigns/CampaignIssueStarter.tsx, web/src/app/(site)/kampagne/[slug]/page.tsx</files>
  <action>
Creator wählt die Ziel-Ebene, sie wandert über den Handoff in den Wizard, und die Hero-Copy wird leicht (D2, D7, D8).

1. CreatorCampaignForm.tsx (Schritt 1, nach dem Anliegen-Feld, vor Kurzadresse):
   - Pflichtfeld "Wohin soll die Kampagne gehen?" als zwei Radio-Optionen im bestehenden shadcn/Tailwind-Stil des Formulars (waldgruen, font-typewriter Label, rounded-md border):
     - "Bundestag" (value "Bund") - Default checked
     - "Landtag" (value "Land")
   - Wenn "Land" gewählt: optionales Bundesland-Dropdown `<select name="targetState">` mit erster Option `<option value="">Alle Bundesländer</option>` und danach je Bundesland eine Option aus BUNDESLAND_NAMES (value = Key, Label = Name). Hilfetext: "Wähle ein festes Bundesland, oder lass 'Alle Bundesländer' stehen, dann entscheidet die PLZ der schreibenden Person."
   - State in den bestehenden `draft` aufnehmen: draftFields um "targetLevel" und "targetState" erweitern, emptyDraft entsprechend ("targetLevel": "Bund", "targetState": ""), damit localStorage-Persistenz und die hidden inputs in Schritt 2 mitziehen. In Schritt 2 hidden inputs für targetLevel und targetState ergänzen (analog zu title/issueText/slug/creatorName), damit die FormData beim finalen Submit vollständig ist.
   - Radios/Select über updateDraft steuern. Bundesland-Select nur rendern wenn draft.targetLevel === "Land"; bei Wechsel auf "Bund" targetState auf "" zurücksetzen.
   - KEINE Gedankenstriche in Copy.

2. wizard-handoff.ts: WizardHandoff um `campaignTargetLevel?: "Bund" | "Land";` und `campaignTargetState?: string;` erweitern. In saveHandoff automatisch mitserialisiert (ist Teil des Objekts). In peekHandoff beide Felder mit Typ-Guards durchreichen (campaignTargetLevel nur "Bund"|"Land", sonst undefined; campaignTargetState string oder undefined).

3. types/wizard.ts: WizardData.campaign um `targetLevel?: "Bund" | "Land";` und `targetState?: string | null;` erweitern.

4. CampaignHero.tsx: PublicCampaign-Pick um "targetLevel" und "targetState" erweitern. Die einleitende Absatz-Copy (aktuell "...einen persönlichen Brief an dein Mitglied des Bundestags...") leicht an die Ebene anpassen:
   - Bund: "...einen persönlichen Brief an dein Mitglied des Bundestags."
   - Land mit targetState: "...einen persönlichen Brief an deine Abgeordneten im Landtag von {BUNDESLAND_NAMES[targetState]}."
   - Land ohne targetState: "...einen persönlichen Brief an deine Abgeordneten im zuständigen Landtag."
   Zusätzlich NUR bei targetLevel === "Land" eine dezente Pill im Hero nahe dem Kampagnentitel rendern (muted/waldgruen-Ton, kleine Schrift, rounded-full, im bestehenden Stil des Heros): Text "Landtagskampagne · {BUNDESLAND_NAMES[targetState]}" bei festem Bundesland, sonst "Landtagskampagne". Der Mittelpunkt "·" ist erlaubt (kein Gedankenstrich). Bund-Kampagnen bekommen keine Pill. targetLevel/targetState an CampaignIssueStarter als Props weiterreichen.

5. CampaignIssueStarter.tsx: Props um targetLevel/targetState erweitern und in saveHandoff als campaignTargetLevel/campaignTargetState mitgeben (nur setzen, wenn vorhanden).

6. WizardShell.tsx (nur der Handoff-Read-Block in useEffect, Detail-Bindung folgt in Task 3): beim Aufbau von wizardData.campaign aus dem Handoff `targetLevel: handoff.campaignTargetLevel ?? "Bund"` und `targetState: handoff.campaignTargetState ?? null` mit übernehmen.

7. page.tsx: getActiveCampaignBySlug liefert bereits das volle Campaign-Objekt (inkl. neuer Felder aus Task 1); nur sicherstellen, dass CampaignHero die Felder erhält (Campaign wird komplett übergeben, ggf. Pick-Typ in CampaignHero deckt es ab). Keine weitere Änderung nötig, außer der Typ-Erweiterung greift.
  </action>
  <verify>
    <automated>cd web && npx tsc --noEmit</automated>
  </verify>
  <done>tsc grün. Creator kann Bundestag/Landtag wählen, bei Landtag optional ein Bundesland; Auswahl landet über den Handoff in wizardData.campaign; Hero-Copy nennt die richtige Ebene ohne Badge, ohne Gedankenstriche.</done>
</task>

<task type="auto">
  <name>Task 3: Wizard-Ebenen-Bindung, PLZ-Mismatch-Fallback und Tests</name>
  <files>web/src/lib/actions/submitWizard.ts, web/src/components/wizard/WizardShell.tsx, web/src/lib/types/wizard.ts, web/src/__tests__/campaignTargetLevel.test.ts</files>
  <action>
Für Kampagnen den Ebene-Step überspringen, Empfänger fest an die Kampagnen-Ebene binden und PLZ-Mismatch freundlich abfangen (D3, D4, D5).

WICHTIG - Prompt-Bindung (D4): Der Brief-Level ergibt sich in api/generate-letter aus recipient.level, das aus selection.kind folgt (mdb -> Bund, mdl -> Land). Es reicht also, im Wizard die Empfänger-Ebene fest zu binden; ein separater Prompt-Parameter ist nicht nötig.

1. submitWizard.ts - Mismatch-Erkennung serverseitig (data.campaign ist vorhanden, da Teil von WizardData):
   - Nach dem PLZ-Lookup, wenn `data.campaign?.targetLevel === "Land"` und `data.campaign.targetState` gesetzt ist: `const derived = lookupPLZWithLevel(data.plz).bundeslandKey;` Wenn `derived !== data.campaign.targetState`, neuen Ergebnis-Typ zurückgeben:
     `{ error: "campaign_state_mismatch", targetStateName: BUNDESLAND_NAMES[data.campaign.targetState], message: ... }` mit Copy: "Diese Kampagne richtet sich an den Landtag von {targetStateName}. Deine Postleitzahl liegt in einem anderen Bundesland." (keine Gedankenstriche).
   - Diesen Check VOR dem Rate-Limit-Spend platzieren (analog zur plz_not_found-Logik: kein Token verbrennen).
   - Für Kampagnen (data.campaign vorhanden) das levelRouting weiterhin normal befüllen, wenn LANDTAG_ROUTING_ENABLED aktiv ist (byLevel wird für die Empfängerliste gebraucht). Die Auto-Empfehlung bleibt reiner Prompt-Kontext, sie darf den Empfänger nicht umlenken.

2. types/wizard.ts: WizardActionResult um `| { error: "campaign_state_mismatch"; targetStateName: string; message: string }` erweitern.

3. WizardShell.tsx:
   - Nach erfolgreichem submitWizard, wenn `wizardData.campaign` gesetzt ist: den "level"-Step NICHT betreten. Stattdessen selectedLevel fest auf `wizardData.campaign.targetLevel ?? "Bund"` setzen und direkt zu step 3. levelRouting weiter setzen (falls im Result), damit recipientsForLevel für Land byLevel.Land nutzt.
   - In Step3Success den onChangeLevel-Handler für Kampagnen NICHT anbieten (die Ebene ist fixiert). Bestehendes onChangePlz bleibt.
   - Mismatch-Handling: wenn result `error === "campaign_state_mismatch"`, ein freundliches Panel zeigen (im bestehenden Fehler-/Hinweis-Stil, waldgruen-Card, nicht airmail-rot als harter Fehler) mit der message und einem Button "Stattdessen einen freien Brief schreiben". Der Button:
     - löscht die Kampagnen-Bindung: `setWizardData(prev => ({ ...prev, campaign: undefined }))`
     - setzt den Schritt zurück auf "2b" (oder step 2), sodass der normale Flow ohne Kampagnen-Empfänger-Bindung und mit normaler Ebenen-Erkennung weiterläuft.
     Kein harter Stopp, kein Brief an den falschen Landtag.
   - State/handler minimal halten und bestehende Muster (setErrorMessage / eigenes campaignMismatch-State) nutzen. Empfehlung: eigener State `campaignMismatch: { message: string } | null`, im submit-catch-Zweig gesetzt, im Panel gerendert.

4. Tests campaignTargetLevel.test.ts (Jest, Muster wie lookupPLZWithLevel.test.ts / levelRouter.test.ts):
   - createCampaignSchema: targetLevel default "Bund"; targetState wird bei targetLevel "Bund" auf null gezwungen; bei "Land" bleibt ein gültiger Key erhalten; ungültiger Key wird abgelehnt oder auf null normalisiert (je nach Implementierung - Test an die gewählte Regel angleichen).
   - mapCampaign-Default: eine Row mit target_level null/undefined mappt auf targetLevel "Bund", targetState null (Altdaten-Verhalten, D6). mapCampaign ggf. über einen kleinen Row-Fixture testen (Import aus repository, falls exportiert; sonst das Default-Verhalten über eine reine Hilfsfunktion prüfen - keine echte Supabase-Verbindung).
   - Optional: BUNDESLAND_NAMES enthält alle 16 Keys.
   Keine Netzwerk-/Supabase-Calls in den Tests.
  </action>
  <verify>
    <automated>cd web && npx jest campaignTargetLevel && npx tsc --noEmit</automated>
  </verify>
  <done>Jest grün und tsc grün. Kampagnen-Wizard überspringt den Ebene-Step, bindet den Empfänger an targetLevel (Bund->MdB, Land->MdL), Prompt argumentiert korrekt über recipient.level; PLZ-Mismatch zeigt freundliches Panel mit Angebot für freien Brief; Altdaten defaulten auf Bund.</done>
</task>

</tasks>

<verification>
- cd web && npx tsc --noEmit (grün)
- cd web && npx jest campaignTargetLevel (grün)
- Bestehende Suiten unberührt: cd web && npx jest lookupPLZWithLevel levelRouter routingToken rathausRecipient generateLetterLevelPrompt (grün)
- Manuell (nach Migration im Supabase Studio): Kampagne mit Landtag + festem Bundesland anlegen, Kampagnenseite öffnen, mit PLZ aus einem anderen Bundesland durch den Wizard gehen -> Mismatch-Panel erscheint; mit passender PLZ -> Brief an MdL, Ebene-Step übersprungen.
</verification>

<success_criteria>
- targetLevel/targetState im Campaign-Modell, in Migration, Repository, Create-Action und Creator-Formular
- Bestehende Kampagnen ohne Feld verhalten sich als Bund (D6)
- Wizard bei source campaign: Ebene-Step übersprungen, Empfänger fest an Ebene gebunden, Prompt korrekt (Bund/Land)
- PLZ-Mismatch bei fester Bundesland-Bindung: freundlicher Hinweis + Angebot freier Brief, kein harter Stopp, kein Brief an falschen Landtag
- Leichte Hero-Copy je Ebene, kein Badge, keine Gedankenstriche
- Kommune ist an keiner Stelle als Kampagnen-Ziel wählbar
</success_criteria>

<output>
Nach Abschluss: `.planning/quick/260710-dgq-kampagnen-ziel-ebene-bund-landtag-target/260710-dgq-SUMMARY.md` erstellen.
</output>

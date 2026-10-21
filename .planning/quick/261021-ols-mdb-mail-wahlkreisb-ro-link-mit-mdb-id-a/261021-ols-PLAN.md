---
phase: quick-261021-ols
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/lib/email/sendLetterEmail.ts
  - web/src/lib/email/buildEmailHtml.ts
  - web/src/lib/lookup/mdbContact.ts
  - web/src/lib/actions/lookupMdbContact.ts
  - web/src/__tests__/emailMeetMdbLine.test.ts
  - web/src/components/MdbLookupCard.tsx
  - web/src/__tests__/mdbContact.test.ts
autonomous: true
requirements:
  - QUICK-261021-ols

estimate:
  tokens: 45000
  raw_tokens: 45000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "In the letter mail for recipientKind 'mdb', the Wahlkreisbuero link is `${APP_URL}/aktiv-werden?mdb=<id>#wahlkreisbuero`, where <id> is `politician.id` (Abgeordnetenwatch candidacy_mandate ID, the same key MdbContact.id and getBundestagPoliticiansByIds use)"
    - "The link never carries the user's PLZ, e-mail, feedback token or deletion token; only the public MdB ID"
    - "Without politicianId the link stays exactly `${APP_URL}/aktiv-werden#wahlkreisbuero` (no '?'); non-mdb recipient kinds still render no Wahlkreisbuero line at all"
    - "Opening /aktiv-werden?mdb=<known id>#wahlkreisbuero shows that MdB's name, party, Wahlkreis, office address and profile button in MdbLookupCard without the user typing a PLZ"
    - "An invalid or unknown ?mdb value fails silently: the card stays idle and the PLZ form works as before; /aktiv-werden stays a static page (page.tsx unchanged)"
    - "The plain-text mail variant (buildLetterEmailText) has no Wahlkreisbuero line today and stays unchanged"
    - "Only the seven listed files change; AGENTS.md, CLAUDE.md, .planning/research/2026-10-19-mistral-rate-limit.md, .planning/todos/pending/2026-10-20-kampagnen-verlauf-echte-briefzahlen.md and docs/sql/2026-10-21-prueft-die-afd-leak-variante.sql stay unstaged and untouched; nothing is pushed"
  artifacts:
    - path: "web/src/lib/email/sendLetterEmail.ts"
      provides: "politicianId?: number on SendLetterEmailParams, set in prepareLetterEmail's final Politician branch"
      contains: "politicianId: politician.id"
    - path: "web/src/lib/email/buildEmailHtml.ts"
      provides: "MdB line href with optional ?mdb=<id>"
      contains: "?mdb="
    - path: "web/src/lib/lookup/mdbContact.ts"
      provides: "private toMdbContact(politician) shared by buildMdbContacts and new buildMdbContactById(id)"
      contains: "export function buildMdbContactById"
    - path: "web/src/lib/actions/lookupMdbContact.ts"
      provides: "server action lookupMdbContactByIdAction(id) with zod positive-int validation"
      contains: "export async function lookupMdbContactByIdAction"
    - path: "web/src/components/MdbLookupCard.tsx"
      provides: "mount-time ?mdb read that pre-fills the result"
      contains: "lookupMdbContactByIdAction"
  key_links:
    - from: "web/src/lib/email/sendLetterEmail.ts (prepareLetterEmail, final branch `const politician: Politician = recipient;`)"
      to: "web/src/lib/email/buildEmailHtml.ts (~line 697, `data.recipientKind === \"mdb\"` block)"
      via: "SendLetterEmailParams.politicianId"
      pattern: "aktiv-werden\\$\\{data.politicianId"
    - from: "web/src/components/MdbLookupCard.tsx (useEffect on mount)"
      to: "web/src/lib/lookup/mdbContact.ts (buildMdbContactById -> getBundestagPoliticiansByIds([id]))"
      via: "lookupMdbContactByIdAction in web/src/lib/actions/lookupMdbContact.ts"
      pattern: "lookupMdbContactByIdAction"
---

<objective>
The MdB letter mail links to the Wahlkreisbuero finder with the public MdB ID (`/aktiv-werden?mdb=<id>#wahlkreisbuero`), and MdbLookupCard on /aktiv-werden resolves that ID on load and shows the office of exactly this MdB. No PLZ, token or e-mail in the URL.

Purpose: Today the mail link drops the reader on an empty PLZ form, although we already know their MdB. One click from the mail should show the office address directly.
Output: ID-carrying mail link, ID lookup (lib + server action), card pre-fill, tests.

Design is decided by Thomas (orchestrator `<decided_design>`, points 1-6). Quick 261019-u1n deliberately had no query params; its "no PLZ / no token" rule stays, a public MdB ID is explicitly OK.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@web/src/lib/email/sendLetterEmail.ts
@web/src/lib/email/buildEmailHtml.ts
@web/src/lib/lookup/mdbContact.ts
@web/src/lib/actions/lookupMdbContact.ts
@web/src/components/MdbLookupCard.tsx
@web/src/__tests__/emailMeetMdbLine.test.ts
@web/src/__tests__/mdbContact.test.ts
@web/src/__tests__/prepareLetterEmailLandesregierung.test.ts

<interfaces>
From web/src/lib/types/politician.ts:
- `id: number` = candidacy_mandate ID from Abgeordnetenwatch (USE THIS)
- `politicianId: number` = politician entity ID (do NOT use for the link; getBundestagPoliticiansByIds and MdbContact.id key on `id`)
- Convention already in code: buildDebugPayload sets `politicianId: p?.id`, so the field name `politicianId` holding `politician.id` matches the mail layer.

From web/src/lib/lookup/plzLookup.ts:
- `export function getBundestagPoliticiansByIds(ids: readonly number[]): Politician[]` (filters politicians-cache.json bundestag by `.id`)
- `export function lookupPLZ(plz: string): { wahlkreisIds: number[]; politicians: Politician[] }`

From web/src/lib/lookup/rathausRecipient.ts:
- `export interface MdbRecipient extends Politician { kind: "mdb" }` (so a test recipient is `{ ...politician, kind: "mdb" as const }`)

From web/src/lib/actions/lookupMdbContact.ts ("use server"):
- `export type LookupMdbContactResult = { ok: true; contacts: MdbContact[] } | { ok: false; reason: "invalid" | "not_found" }`
- `export async function lookupMdbContactAction(plz: string): Promise<LookupMdbContactResult>`

From web/src/lib/email/sendLetterEmail.ts:
- `export function prepareLetterEmail(args: { locale?, recipientEmail, recipient: Recipient, letterText, issueText, debug: LetterDebugPayload, ... }): { params: SendLetterEmailParams; feedbackToken: string }`
- Both callers (web/src/app/api/generate-letter/route.ts:378 and web/src/lib/actions/resendLetter.ts:175) go through prepareLetterEmail, so no caller changes.
- Module throws at import if BREVO_API_KEY is unset; tests use the mock pattern in prepareLetterEmailLandesregierung.test.ts (jest.mock server-only, @getbrevo/brevo, @/lib/feedback/token; set BREVO_API_KEY in beforeAll; dynamic import).
</interfaces>

Known pitfalls:
- iCloud-evicted files: if jest crashes with an odd "alias" error or git reports corrupt objects, it is iCloud dataless files; fix with `brctl download <file>` per file, not by changing code.
- Never call Mistral in tests (CLAUDE.md). None of the touched code paths call Mistral; do not import @/lib/mistral.
- UI skill rule (Thomas memory "Frontend edits go through /frontend-design or /taste; state it in plans"): this task makes NO visual change to MdbLookupCard. It reuses the existing result rendering unchanged, so no /frontend-design pass is needed. Do not touch markup, classes or copy.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Tracer - mail link carries MdB ID, server resolves it back to the contact</name>
  <files>web/src/lib/email/sendLetterEmail.ts, web/src/lib/email/buildEmailHtml.ts, web/src/lib/lookup/mdbContact.ts, web/src/lib/actions/lookupMdbContact.ts, web/src/__tests__/emailMeetMdbLine.test.ts</files>
  <behavior>
    - buildEmailHtml with recipientKind "mdb" and politicianId 123: the Wahlkreisbuero href ends with `/aktiv-werden?mdb=123#wahlkreisbuero`. With `debug.plz = "28195"`, `feedbackToken = "geheim-token"` and `deleteUrl` containing `?t=loeschtoken` also set, that href contains none of "28195", "plz", "geheim-token", "loeschtoken", "t=".
    - buildEmailHtml with recipientKind "mdb" and no politicianId: href ends with `/aktiv-werden#wahlkreisbuero` and contains no "?" (replaces the old "Link ohne Query-Parameter" test).
    - recipientKind "mdl" with politicianId 5: html contains no "?mdb=" (line only renders for mdb).
    - Roundtrip: real Bundestag politician from `lookupPLZ("28195").politicians[0]`, wrapped as `{ ...politician, kind: "mdb" as const }`, through prepareLetterEmail: `params.politicianId === politician.id`; buildEmailHtml(params) href matches `/aktiv-werden\?mdb=(\d+)#wahlkreisbuero/`; lookupMdbContactByIdAction(Number(capturedId)) returns `{ ok: true }` with `contacts[0].id === politician.id` and a non-empty name.
    - All existing tests in emailMeetMdbLine.test.ts (ANCHOR checks, escaping, non-mdb kinds, en/tr locale) stay green unchanged.
  </behavior>
  <action>
Implements decided_design points 1-4 and the mail half of point 6.

1. web/src/lib/email/sendLetterEmail.ts: add optional `politicianId?: number` to SendLetterEmailParams (place it next to the other politician* fields, with a one-line German comment: public Abgeordnetenwatch-Mandats-ID, nur fuer den Wahlkreisbuero-Link, nie PLZ oder Token). In prepareLetterEmail's final branch (`const politician: Politician = recipient;`, ~line 338) add `politicianId: politician.id` to the returned params. Use `politician.id`, NOT `politician.politicianId` (see interfaces: lookup keys on `.id`). Do not touch the mdb_later, rathaus, landesregierung, bundeskanzler or campaign_fixed branches. Do not touch callers.

2. web/src/lib/email/buildEmailHtml.ts ~line 697 (inside the `data.recipientKind === "mdb"` block): change the href from `${APP_URL}/aktiv-werden#wahlkreisbuero` to `${APP_URL}/aktiv-werden${data.politicianId ? `?mdb=${data.politicianId}` : ""}#wahlkreisbuero`. Leave the general `/aktiv-werden` link (~line 728) and everything else unchanged. Plain-text variant buildLetterEmailText (line 79) has no meetMdb line: confirmed, no change. The follow-up mail (web/src/lib/email/buildFollowupHtml.ts:78) has the same link but is OUT OF SCOPE for this task; do not change it.

3. web/src/lib/lookup/mdbContact.ts: extract the arrow body inside `buildMdbContacts` (findOfficeRecord + profileUrl + returned object) into a private `function toMdbContact(politician: Politician): MdbContact`. `buildMdbContacts(plz)` becomes `lookupPLZ(plz).politicians.map(toMdbContact)`. Add `export function buildMdbContactById(id: number): MdbContact | null` that calls `getBundestagPoliticiansByIds([id])` (import it from "./plzLookup" next to lookupPLZ) and returns `toMdbContact` of the first hit or null. One mapping only, no duplicated object literal (Bauprinzip "Erweitern statt kopieren").

4. web/src/lib/actions/lookupMdbContact.ts: add `export async function lookupMdbContactByIdAction(id: number): Promise<LookupMdbContactResult>`. Validate with a zod schema `z.number().int().positive()` (safeParse; failure returns `{ ok: false, reason: "invalid" }`). Call buildMdbContactById; null returns `{ ok: false, reason: "not_found" }`; otherwise `{ ok: true, contacts: [contact] }`. Keep the existing PLZ action untouched.

5. web/src/__tests__/emailMeetMdbLine.test.ts: write the behavior tests above first (RED), then implement 1-4 (GREEN). Replace the existing "mdb: Link ohne Query-Parameter" test with the two href tests (with id 123 incl. the no-PLZ/no-token assertions; without id no "?"). For the roundtrip test add at file top the same mocks as web/src/__tests__/prepareLetterEmailLandesregierung.test.ts (jest.mock "server-only" virtual, "@getbrevo/brevo" BrevoClient mock, "@/lib/feedback/token" signFeedbackToken returning a fixed string), set/restore BREVO_API_KEY in beforeAll/afterAll, and load prepareLetterEmail via dynamic `await import("@/lib/email/sendLetterEmail")`. Keep the existing `import type { SendLetterEmailParams }` (type-only import is erased, safe). Pass `debug: {} as never` like the Landesregierung test. Test names in German like the existing ones.

6. Run the verify command, then commit ONLY these five files by explicit path: `git add web/src/lib/email/sendLetterEmail.ts web/src/lib/email/buildEmailHtml.ts web/src/lib/lookup/mdbContact.ts web/src/lib/actions/lookupMdbContact.ts web/src/__tests__/emailMeetMdbLine.test.ts` then `git diff --cached --name-only` must list exactly those five, then commit with message `feat(mail): Wahlkreisbüro-Link trägt MdB-ID, Lookup per ID` plus the Co-Authored-By trailer. Never `git add -A`, `git add .` or `git commit -a`. Do not push.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/emailMeetMdbLine.test.ts src/__tests__/mdbContact.test.ts && npx tsc --noEmit && grep -c "politicianId: politician.id" src/lib/email/sendLetterEmail.ts && grep -c "?mdb=" src/lib/email/buildEmailHtml.ts && test "$(grep -c 'profileSource: record' src/lib/lookup/mdbContact.ts)" = "1" && grep -c "export async function lookupMdbContactByIdAction" src/lib/actions/lookupMdbContact.ts</automated>
  </verify>
  <done>Both jest files green (existing mdbContact tests still pass after the toMdbContact extraction), tsc clean, the roundtrip test proves mail href ID resolves to the same MdB via the server action, the href never contains PLZ or tokens, the mapping exists exactly once, and one commit contains exactly the five listed files.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: MdbLookupCard pre-fills the result from ?mdb on load, plus ID lookup edge-case tests</name>
  <files>web/src/components/MdbLookupCard.tsx, web/src/__tests__/mdbContact.test.ts</files>
  <behavior>
    - buildMdbContactById(id of `lookupPLZ("28195").politicians[0]`) returns a contact with that id, a name longer than 2 chars and a profileUrl starting with https:// (derive the id at runtime from lookupPLZ, do not hard-code a cache ID that can go stale after a data refresh).
    - buildMdbContactById(999999999) returns null.
    - lookupMdbContactByIdAction(0), (-5) and (1.5) each return `{ ok: false, reason: "invalid" }`.
    - lookupMdbContactByIdAction(999999999) returns `{ ok: false, reason: "not_found" }`.
    - lookupMdbContactByIdAction(known id) returns ok with exactly one contact whose id equals the input.
  </behavior>
  <action>
Implements decided_design point 5 and the lookup half of point 6.

1. web/src/__tests__/mdbContact.test.ts: extend the existing file (do not create a new one). Add `buildMdbContactById` to the mdbContact import and `lookupMdbContactByIdAction` to the action import; add describe blocks "buildMdbContactById" and "lookupMdbContactByIdAction" with the behavior cases above. Import lookupPLZ from "@/lib/lookup/plzLookup" to get the known id.

2. web/src/components/MdbLookupCard.tsx: import `useEffect` from react and `lookupMdbContactByIdAction` next to lookupMdbContactAction. Add one useEffect with an empty dependency array that reads `new URLSearchParams(window.location.search).get("mdb")` (same pattern as web/src/components/i18n/LocaleProvider.tsx:47). If the value matches `/^\d+$/`, call `startTransition(async () => { ... })`, await `lookupMdbContactByIdAction(Number(value))`, and only when `result.ok` set state to `{ status: "done", contacts: result.contacts }`. On any non-ok result do nothing (stay idle, no error message): silent failure per decided_design. Read the param via window.location inside the effect, NOT via the Next navigation hook for search params: that hook forces a Suspense boundary and client-render bailout on this static page. Do NOT edit web/src/app/(site)/aktiv-werden/page.tsx and do not read searchParams in any server component, so the page stays static. The shared `pending` flag will show "Suche läuft" on the button during the ID lookup; that is intended, no extra loading UI. No markup, class or copy changes (no visual change, so no /frontend-design pass). The card is also used on /bundestag-besuch-kostenlos; the param behaves the same there, harmless.

3. Run the verify command, then commit ONLY these two files by explicit path: `git add web/src/components/MdbLookupCard.tsx web/src/__tests__/mdbContact.test.ts`, check `git diff --cached --name-only` lists exactly those two, commit with message `feat(aktiv-werden): MdbLookupCard zeigt Büro per ?mdb-ID direkt an` plus the Co-Authored-By trailer. Never `git add -A`, `git add .` or `git commit -a`. Do not push.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/mdbContact.test.ts src/__tests__/emailMeetMdbLine.test.ts && npx tsc --noEmit && npx eslint src/components/MdbLookupCard.tsx src/lib/lookup/mdbContact.ts src/lib/actions/lookupMdbContact.ts && grep -c "window.location.search" src/components/MdbLookupCard.tsx && grep -c "lookupMdbContactByIdAction" src/components/MdbLookupCard.tsx && git diff --quiet HEAD -- "src/app/(site)/aktiv-werden/page.tsx"</automated>
  </verify>
  <done>mdbContact tests cover known id, unknown id, invalid ids and not_found; card reads ?mdb on mount via window.location and shows the existing result block for that MdB; invalid/unknown values leave the card idle; eslint and tsc clean; aktiv-werden/page.tsx unchanged; one commit with exactly the two listed files.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| mail link / browser URL -> MdbLookupCard | `?mdb=` is attacker-controllable query input |
| client -> server action lookupMdbContactByIdAction | untrusted `id` crosses into server code |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-ols-01 | Information disclosure | buildEmailHtml MdB href | high | mitigate | Link carries only the public MdB mandate ID; Task 1 test asserts href contains no PLZ, "plz", feedback token, deletion token or "t=" even when those are present in params (DSGVO rule from quick 261019-u1n kept) |
| T-ols-02 | Tampering | lookupMdbContactByIdAction | low | mitigate | zod `z.number().int().positive()` server-side; client additionally gates on `/^\d+$/` before calling; invalid input returns `invalid`, unknown returns `not_found`; no DB access, in-memory static JSON only |
| T-ols-03 | Spoofing / XSS | MdbLookupCard result rendering | low | mitigate | Contact data comes only from server-side static JSON resolved by ID; the raw query value is never rendered; React escapes all fields; no dangerouslySetInnerHTML |
| T-ols-04 | Denial of service | lookupMdbContactByIdAction | low | accept | Same cost profile as the existing public PLZ action (in-memory filter over ~630 politicians, no Supabase, no Mistral, no Brevo); no rate limit added, consistent with lookupMdbContactAction |
| T-ols-05 | Information disclosure | Vercel Analytics page URL | low | accept | `/aktiv-werden?mdb=<id>` may appear in analytics [unverified whether Vercel Analytics keeps query strings]; the value is a public MdB ID, not personal data, and Thomas explicitly approved public IDs in the link; no change to AnalyticsWrapper |
| T-ols-SC | Tampering | npm/pip/cargo installs | high | mitigate | No package installs in this plan; any new dependency is forbidden without asking Thomas (CLAUDE.md) |
</threat_model>

<verification>
- `cd web && npx jest src/__tests__/emailMeetMdbLine.test.ts src/__tests__/mdbContact.test.ts` green.
- `cd web && npx tsc --noEmit` clean.
- `cd web && npx jest src/__tests__/debugPayload.test.ts src/__tests__/prepareLetterEmailLandesregierung.test.ts src/__tests__/followupMeetMdb.test.ts src/__tests__/emailLocalization.test.ts` green (neighbouring prepareLetterEmail / mail tests unaffected).
- `git status --short` afterwards still shows AGENTS.md, CLAUDE.md, .planning/research/2026-10-19-mistral-rate-limit.md as modified-unstaged and the todo + docs/sql file as untracked; `git log -2 --stat` shows only the seven planned files across the two commits; nothing pushed.
- Not verifiable in Jest (report as open, not as passed): real browser check of `/aktiv-werden?mdb=<id>#wahlkreisbuero` on `npm run dev` or after deploy.
</verification>

<success_criteria>
- MdB letter mails link to `/aktiv-werden?mdb=<politician.id>#wahlkreisbuero`; without an ID the old link stays.
- The ID round-trips: mail href ID -> lookupMdbContactByIdAction -> same MdB contact (tested).
- MdbLookupCard shows that MdB's office on load from `?mdb`, silent on invalid/unknown, PLZ form unchanged, page stays static.
- No PLZ, token or e-mail in any URL; no new dependency; no Mistral call in tests; unrelated dirty files untouched; no push.
- Out of scope, report to Thomas as a follow-up option: the follow-up mail (web/src/lib/email/buildFollowupHtml.ts:78, sent from web/src/app/api/generate-letter/route.ts:411) uses the same link without ID.
</success_criteria>

<output>
Create `.planning/quick/261021-ols-mdb-mail-wahlkreisb-ro-link-mit-mdb-id-a/261021-ols-SUMMARY.md` when done
</output>

---
quick_id: 261119-qe1
task: 2
status: complete
scope: server side (A3-server, A4-server, A5, A6)
commits: 0
note: no commits by design (Thomas commits after OK); STATE.md/ROADMAP.md untouched
verification:
  tsc: clean
  jest: 195 suites, 1920 tests, 19 snapshots, all passing
---

# Task 2: Server side Schul-Flow (Bremen)

## What changed

- **Token field `l`** (`src/lib/schule/classToken.ts`): optional `l: "L"|"B"`. `verifyClassToken` now returns `level?: "Land"|"Bund"`. Old tokens (no `l`) verify unchanged; email tokens without a level are byte-identical to before.
- **Class link level** (`src/lib/actions/createClassLink.ts`): new optional `level: "auto"|"Land"|"Bund"` (default and `"auto"` write no field; anything else gives `invalid_input`).
- **PLZ from token** (`src/lib/schule/youthContext.ts`): `lockWizardToClassToken(data)` overwrites `data.plz` with the token PLZ (only for `audience === "jung"` + valid token). Called first in `submitWizardAction`, `selectPoliticianAction`, `POST /api/generate-letter`, `resendLetterAction`. Klasse stays a client value (it only steers tone, and an existing test pins the "invalid klasse = adult flow" fallback).
- **Landesminister recipient**: `data/landesminister.json` loader `src/lib/lookup/landesministerRecipient.ts` (skips `unverified`, tolerates missing state or file content), ressort codes in `src/lib/lookup/ressorts.ts`, new `kind: "landesminister"` in `Recipient` / `RecipientSelection` (`{kind, ressort}`, no id), branch in `resolveRecipientSelection`, `recipientEnvelope`, prompt (`generateLetter.ts`, own Zuständigkeits-/Bitte-/Partei-Block, salutation from data and enforced), debug payload, generation proof, letter-signal enum, generate-letter route.
- **Mail**: `prepareLetterEmail` maps `landesminister` to `recipientKind: "landesregierung"` with `governmentSource.addressee = "head"` and the minister address lines. Same layout, Landeswappen and "Postanschrift" block as the head of government; no new email code paths.
- **Ressort routing** (`levelRouter.ts`): same Mistral call, optional `ressort` in JSON schema (not required), one prompt line, `RoutingResultSchema.ressort` is optional and an unknown value parses as "no ressort". Old routing tokens still verify. Taxonomy JSON not extended (prompt carries the codes and three examples).
- **School decision** (`src/lib/schule/schoolRecipient.ts`): `resolveSchoolRecipient`. Level = token `l` ?? router level ?? Bund. Land: minister(ressort) else head of government. Bund: Direktmandat MdB of the token PLZ (else first local MdB, else `mdb_later`). Kommune (auto only): Rathaus; stadtstaat/ambiguous falls back to head of government, then MdB.
- **A6 prompt** (`youth.ts`, `generateLetter.ts` `youthBlock`): three bands (5-7 / 8-10 / 11-13) with the requested structure, positive "use only facts from the transkript" rule, voting-age sentences, party neutrality and Unterrichtsprojekt sentence kept. Word window now follows the input: input under 200 chars gives 80-120, otherwise 80-150 / 100-180 / 120-200 per band.

## Deviations from Plan

**1. [Rule 3 - Blocking] QR budget (151 byte) exceeded by `l`**
- Plan assumed about 151 bytes free; 151 is the total QR capacity (v10-Q) and a PDF link was already at exactly 151. Adding `l` gave 162 bytes.
- Fix: new opt-in `shortMac` in `src/lib/feedback/token.ts`. Tokens signed with a fixed level carry a 128-bit truncated HMAC (22 instead of 43 chars). Verification accepts both lengths for class tokens; all other token types are unchanged (flag is opt-in). PDF + level now about 141 bytes, tests assert at most 151 and that `createQrMatrix` accepts it.

**2. [Rule 1 - Behavior change, intended] Token PLZ overrides client PLZ**
- `generateLetterYouthRoute.test.ts` "prüft im PDF-Modus weiter die PLZ" pinned the old client-PLZ validation. Replaced by tests that the server uses the token PLZ (PDF and email mode) and still validates PLZ without a token.

**3. Snapshot** `generateLetterYouthPrompt.test.ts.snap` regenerated (6 youth blocks, intentional prompt change). The adult snapshot is untouched.

## Contracts for UI

### 1. Class link (teacher)

```ts
createClassLinkAction(input: {
  klasse: number;
  plz: string;
  delivery?: "pdf" | "email";          // default "email"
  level?: "auto" | "Land" | "Bund";     // default "auto" (no `l` in token)
}): Promise<{ url: string; expiresAt: string } | { error: "invalid_input" | "unknown_plz" | "rate_limited"; message: string }>
```
The ClassLinkGenerator maps "Automatisch" to `"auto"` (or omits it). No "Kommune" option: Kommune only happens via auto.

### 2. Wizard in school mode (Jugend + valid classToken + no campaign)

- Client keeps sending `audience: "jung"`, `klasse`, `classToken`. The `plz` field can hold anything (even empty is not enough for Zod on the client, send the token PLZ if known); the server overwrites it with the token PLZ. The UI should prefill and lock it from the token, but the server does not depend on it.
- `submitWizardAction(data, prefetchedRoutingToken)` result (variant `disambiguationNeeded: true`) now has the optional field:
  ```ts
  schoolRecipient?: {
    level: "Bund" | "Land" | "Kommune";   // final level (may differ from wish if data was missing)
    recipient: Recipient;                  // fully resolved; render name/office/address from it
    selection: RecipientSelection;         // pass straight to selectPoliticianAction
    reason: string;                        // German sentence for "Warum diese Person?"
  }
  ```
  Type: `SchoolRecipientPayload` in `src/lib/types/wizard.ts`. When present: skip `StepLevelSelect` and the person list, show the fixed recipient plus `reason`. `politicians` and `levelRouting` are still returned unchanged.
- Then call `selectPoliticianAction(data, schoolRecipient.selection, routingToken)` with the `routingToken` from the submit result. In school mode the server ignores the client selection and re-derives the recipient from token PLZ, token level and the signed routing token, so a stale or manipulated selection cannot change it. Same for `POST /api/generate-letter` (send `selection` and `routingToken` as today).
- Client must NOT send: a minister id (there is none; `landesminister` selection carries only a ressort code and is rejected outside school mode), a campaign slug (it disables school mode), any recipient object.
- Client must send the routing token through unchanged; without it (router timeout) auto falls back to Bund, token level Land falls back to the head of government.
- Letter-signal consent is skipped for youth as before; mails to ministers render as the head-of-government mail layout.

### 3. Server helpers (for other server code)

- `resolveSchoolRecipient({ plz, tokenLevel?, routing? })` in `src/lib/schule/schoolRecipient.ts` (pure, `plz` must be the token PLZ).
- `resolveSchoolMode(data)`, `resolveSchoolRecipientForRequest(data, routing)`, `lockWizardToClassToken(data)` in `src/lib/schule/youthContext.ts`.
- `verifyClassToken(token)` now also returns `level?: "Land" | "Bund"`.

## Data dependency

`data/landesminister.json` (other agent) is read as is. Currently only `HB` exists. Other states resolve to head of government. Entries with `unverified: true` are never used. Tests mock this file with an inline fixture.

## Not done / follow-ups

- No taxonomy mapping in `zustaendigkeit-taxonomie.json` (prompt holds the ressort codes).
- Minister recipients exist only in school mode by design; adult flow unchanged (verified by the adult snapshot and the "adults cannot select landesminister" test).
- UI work (all of Task 3) not started.

## Tests added or changed

`classToken.test.ts`, `createClassLink.test.ts`, `levelRouter.test.ts`, `generateLetterYouthPrompt.test.ts` (+ snapshot), `generateLetterYouthRoute.test.ts`; new: `schoolRecipient.test.ts`, `schoolServerTrust.test.ts`, `landesministerLetter.test.ts`.

## Self-Check: PASSED

`cd web && npx tsc --noEmit` clean; `npx jest` 195 suites / 1920 tests pass; eslint clean on touched source files. Mistral mocked everywhere.

---
phase: quick-261021-ols
plan: 01
subsystem: mail, aktiv-werden
tags: [mdb, wahlkreisbuero, email, lookup]
status: complete
requirements: [QUICK-261021-ols]
key-files:
  modified:
    - web/src/lib/email/sendLetterEmail.ts
    - web/src/lib/email/buildEmailHtml.ts
    - web/src/lib/lookup/mdbContact.ts
    - web/src/lib/actions/lookupMdbContact.ts
    - web/src/components/MdbLookupCard.tsx
    - web/src/__tests__/emailMeetMdbLine.test.ts
    - web/src/__tests__/mdbContact.test.ts
actuals:
  tasks: 2
  commits: 2
plan_head_before: 90e6df8
plan_head_after: 7af0c1c63fa9c2e98584f1d92607d7f1de8a59dd
completed: 2026-10-21
---

# Quick 261021-ols: MdB-Mail Wahlkreisbüro-Link mit MdB-ID

The MdB letter mail now links to `/aktiv-werden?mdb=<politician.id>#wahlkreisbuero`, and MdbLookupCard resolves that ID on mount and shows the office directly. No PLZ, token or e-mail in the URL.

## Commits
- 3b5e25c feat(mail): Wahlkreisbüro-Link trägt MdB-ID, Lookup per ID
- 7af0c1c feat(aktiv-werden): MdbLookupCard zeigt Büro per ?mdb-ID direkt an

## What changed
- `SendLetterEmailParams.politicianId` (public mandate ID), set in prepareLetterEmail's final Politician branch; buildEmailHtml appends `?mdb=<id>` only when present.
- `toMdbContact` extracted (single mapping); new `buildMdbContactById` and `lookupMdbContactByIdAction` (zod positive int, invalid / not_found).
- MdbLookupCard: mount-time `window.location.search` read, silent on invalid/unknown; page.tsx untouched (page stays static).
- Tests: href with/without ID incl. no PLZ/token leak, mdl has no `?mdb=`, roundtrip mail href -> server action, ID lookup edge cases.

## Deviations from Plan
None. Note: `tsc --noEmit` reports errors only in `.next/types/* 4.ts` (iCloud duplicate files, pre-existing, unrelated); no errors in `src/`.

## Not verified
- Real browser check of `/aktiv-werden?mdb=<id>#wahlkreisbuero` (dev or deploy).
- Follow-up mail (`buildFollowupHtml.ts:78`) still uses the link without ID (out of scope, follow-up option).

## Self-Check: PASSED

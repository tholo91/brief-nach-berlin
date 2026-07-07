---
quick_id: 260707-uhp
slug: improve-brief-variant-tone-adjustment-de
status: planned
date: 2026-07-07
---

# Quick Task 260707-uhp: Improve brief variant tone adjustment debug payload and prompt

## Goal

Make the existing letter-variant flow easier to debug and less likely to over-escalate or drop the sign-off.

## Tasks

1. Add variant debug metadata
   - Files: `web/src/lib/email/buildEmailHtml.ts`, `web/src/app/(site)/brief/anpassen/VariantForm.tsx`, `web/src/lib/client/letterVariantSubmission.ts`, `web/src/lib/validation/wizardSchemas.ts`, `web/src/app/api/generate-letter-variant/route.ts`, variant email/debug helpers.
   - Action: carry original tone from the first email hash into the variant request, build a variant debug payload, and add a debug link to the variant email.
   - Verify: tests cover the hash metadata and debug link.

2. Harden the variant prompt
   - Files: `web/src/lib/generation/generateLetterVariant.ts`, prompt tests.
   - Action: frame the task as a bounded revision, forbid fact drift, preserve closing exactly, and treat tone level as a ceiling.
   - Verify: prompt tests assert the new constraints.

3. Update GSD state
   - Files: `.planning/STATE.md`, quick summary.
   - Action: record the quick task after implementation and verification.
   - Verify: quick task artifacts exist and the state table has one new row.

---
status: complete
quick_id: 260707-uhp
slug: improve-brief-variant-tone-adjustment-de
date: 2026-07-07
commit: 985c86c
---

# Quick Task 260707-uhp: Improve brief variant tone adjustment debug payload and prompt

## Summary

Implemented variant-flow debug visibility and tightened the tone-adjustment behavior.

## Changes

- Added original tone handoff from the original letter email to `/brief/anpassen` via URL hash metadata.
- Added a `brief_variant` debug payload with original tone, requested tone, change request, original letter excerpt, word counts, model data, generation timing, and preservation check.
- Added a Debug link to variant emails.
- Hardened the variant prompt against fact drift, emotional over-escalation, and missing sign-offs.
- Added deterministic preservation of the original closing if the model drops it.

## Verification

- `npm test -- --runTestsByPath src/__tests__/generateLetterVariantPrompt.test.ts src/__tests__/emailVariantCta.test.ts src/__tests__/variantEmailFeedback.test.ts`
- `npx tsc --noEmit`
- `npx eslint src/__tests__/emailVariantCta.test.ts src/__tests__/generateLetterVariantPrompt.test.ts src/__tests__/variantEmailFeedback.test.ts 'src/app/(site)/brief/anpassen/VariantForm.tsx' src/app/api/generate-letter-variant/route.ts src/app/debug/page.tsx src/lib/client/letterVariantSubmission.ts src/lib/email/buildEmailHtml.ts src/lib/email/buildVariantEmailHtml.ts src/lib/email/sendVariantEmail.ts src/lib/email/variantDebugPayload.ts src/lib/generation/generateLetterVariant.ts src/lib/validation/wizardSchemas.ts`

Full `npm run lint` still fails on pre-existing unrelated files.

---
quick_id: 260530-kk4
slug: mistral-model-migration-centralize-ids-i
completed: 2026-05-30
status: complete
commits:
  - d2a8646 chore(mistral): centralize model IDs in lib/mistral.ts
  - 8aa6f7d fix(transcribe): migrate voxtral-mini-transcribe-2507 → voxtral-mini-latest
  - 1f89f83 feat(letter): switch to mistral-small-latest with reasoning_effort=high
  - ac5b9d3 docs(transparency): align DSGVO + KI-transparenz copy with current model IDs
side_commits:
  - b712e5e fix(letter): escape prompt XML + moderate input before generation [REVERTED in 49241ce]
  - ef7e429 chore(wizard): hint that draft is editable before sending
  - 49241ce revert(letter): remove input moderation + prompt XML escape (Thomas, post-review)
---

# Summary: Mistral Model Migration

## What shipped

1. **MISTRAL_MODELS registry** in `web/src/lib/mistral.ts` — single source of truth for all four model IDs (letter, moderation, transcription, levelRouting). Reviewer comment + next review date inline.
2. **URGENT deprecation fix**: `voxtral-mini-transcribe-2507` → `voxtral-mini-latest` in `/api/transcribe`. Without this, voice recording on the letter form would have broken on 2026-05-31 (tomorrow).
3. **Letter model switch**: `mistral-medium-latest` → `mistral-small-latest` with `reasoningEffort: "high"`. Mistral's official upgrade path from the Magistral family, ~10× cheaper than `mistral-medium-3-5` while keeping a reasoning loop on generation.
4. **Public copy aligned** in `datenschutz` + `ki-transparenz` pages + `.env.example` comments. DSGVO model-name commitments now match the running code.

## Pre-existing WIP also shipped

Two unrelated commits cleared first so the migration tree was clean:

- **b712e5e** — input moderation + prompt-injection XML escape (security hardening). **Subsequently reverted by Thomas in 49241ce** after threat-model review: input moderation duplicated existing output moderation; XML escape risked artifacts in legitimate German strings ("Müller & Co.", URLs); blast radius is the user themselves (the letter goes back to their own browser, not directly to the politician).
- **ef7e429** — one-line reassurance under Step3 generate button. Kept.

## Verification done

- `npx tsc --noEmit` — exit 0
- `npx eslint <8 changed files>` — exit 0, no findings
- `npx jest` — 44 / 44 passed
- SDK field name confirmed by reading `node_modules/@mistralai/mistralai/esm/models/components/chatcompletionrequest.d.ts:102` (`reasoningEffort?: ReasoningEffort | null | undefined`).

## Not yet verified (needs Thomas in front of dev server)

- [ ] Smoke test: record audio on `/` letter form, confirm transcription succeeds on Voxtral 2.0.
- [ ] **A/B validation**: 5 real prompts through old `mistral-medium-latest` vs new `mistral-small-latest + reasoning_effort: high`. If quality regresses, flip `MISTRAL_MODELS.letter` to `"mistral-medium-3-5"` and accept the cost bump.
- [ ] Visit `/datenschutz` and `/ki-transparenz` to confirm copy renders correctly.

## Related: surv.ai

Plan file written to `surv.ai/_bmad-output/implementation-artifacts/mistral-deprecation-2026-05-30.md`. surv.ai production code is already safe (all `-latest` aliases); plan covers optional centralization + stale doc cleanup. Ready-to-paste prompt for a separate Claude Code session is at the end of the main plan at `/Users/thomas/.claude/plans/ok-i-hope-we-zazzy-russell.md`.

## Cost impact

- **Letter generation**: drops from ~$0.4/$2 per Mtok (old medium) to ~$0.15/$0.6 per Mtok (small v4). Net ~60% cheaper than today, and ~10× cheaper than the recommended medium-3-5 migration path.
- **Transcription**: same model family, pricing unchanged.
- **Moderation**: auto-updates on Jun 30 to `mistral-moderation-2603`, no code change required.

## Files touched

- `web/src/lib/mistral.ts` (added registry)
- `web/src/lib/generation/generateLetter.ts` (registry + reasoningEffort)
- `web/src/lib/moderation/moderateText.ts` (registry)
- `web/src/app/api/transcribe/route.ts` (registry — URGENT fix)
- `web/scripts/render-email-preview.ts` (registry)
- `web/scripts/test-level-routing.ts` (registry)
- `web/src/app/(site)/datenschutz/page.tsx` (DSGVO copy)
- `web/src/app/(site)/ki-transparenz/page.tsx` (transparency copy)
- `web/.env.example` (comments)

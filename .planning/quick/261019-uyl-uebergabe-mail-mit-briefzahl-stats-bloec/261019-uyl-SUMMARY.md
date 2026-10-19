---
quick_id: 261019-uyl
status: complete
commits: 3
plan_head_before: b5dc85bda29aa8b9661cbbeee16348e6234f0092
plan_head_after: 6406f28
---

# Quick 261019-uyl: Übergabe-Mail mit Briefzahl und drei Blöcken

Transfer mail now shows the real letter count tile, "Das siehst du live / Das kannst du / Das bekommst du nicht" blocks, names the inviter, and greets the new address with a plain "Moin,".

## Commits

- 14fcc0c fix: pass `inviterName`, `letterCount`, `campaignStatus` instead of `creatorName`; success message "Die neue Adresse muss den Link noch bestätigen."
- 1a7a52a feat: transfer layout (count tile, three blocks, inviter intro) in `buildCampaignCreatorEmailHtml.ts`
- 6406f28 test: new cases in `campaignCreatorEmail.test.ts` and `transferCampaignAction.test.ts`

## Deviations

- Builder forces greeting "Moin," for kind `transfer` even if `creatorName` is passed (safety net for the old-name bug).
- `campaignStatus` is narrowed with the same ternary as `acceptCampaignTransfer.ts`.

## Verification

- `npx jest` (both files): 35 passed, 0 failed.
- `npx tsc --noEmit -p .`: 0 errors in `src/`; 2 pre-existing errors in `.next/types/*d 4.ts` (iCloud duplicate files), unrelated.
- No mail sent, no external API called.

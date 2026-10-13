import { z } from "zod";

const campaignIssueAlternativeSchema = z.string().trim().min(50).max(4000);

export const campaignIssueAlternativesSchema = z
  .array(campaignIssueAlternativeSchema)
  .max(2)
  .superRefine((alternatives, ctx) => {
    if (new Set(alternatives).size !== alternatives.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Kampagnenanliegen müssen eindeutig sein.",
      });
    }
  });

export interface CampaignIssueVariantSource {
  issueText: string;
  issueTextAlternatives?: unknown;
  issueTextAlternativesBase?: string | null;
}

export function getCampaignIssueTexts(input: CampaignIssueVariantSource): string[] {
  const mainText = input.issueText;
  if (input.issueTextAlternativesBase !== mainText) return [mainText];

  const parsed = campaignIssueAlternativesSchema.safeParse(input.issueTextAlternatives);
  if (!parsed.success) return [mainText];

  const normalizedMain = mainText.trim();
  const alternatives = parsed.data.filter((text) => text !== normalizedMain);
  return [mainText, ...alternatives];
}

export function selectCampaignIssueText(
  input: CampaignIssueVariantSource,
  random: () => number = Math.random,
): string {
  const texts = getCampaignIssueTexts(input);
  const value = random();
  const index = Math.min(texts.length - 1, Math.max(0, Math.floor(value * texts.length)));
  return texts[index];
}

export function restoreCampaignIssueDraft(
  input: CampaignIssueVariantSource,
  savedDraft: string,
  random: () => number = Math.random,
): string {
  if (savedDraft.trim().length > 0) return savedDraft;
  return selectCampaignIssueText(input, random);
}

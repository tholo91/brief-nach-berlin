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

export const CAMPAIGN_PERSONAL_HOOK_MIN = 3;
export const CAMPAIGN_PERSONAL_HOOK_MAX = 80;

/** Satzanfänge für die persönliche Zeile: getrimmt, 3 bis 80 Zeichen, höchstens 3, eindeutig. */
export const campaignPersonalHooksSchema = z
  .array(
    z
      .string()
      .trim()
      .min(CAMPAIGN_PERSONAL_HOOK_MIN)
      .max(CAMPAIGN_PERSONAL_HOOK_MAX),
  )
  .max(3)
  .superRefine((hooks, ctx) => {
    if (new Set(hooks).size !== hooks.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Satzanfänge müssen eindeutig sein.",
      });
    }
  });

export const CAMPAIGN_ALTERNATIVE_MIN = 50;
export const CAMPAIGN_ALTERNATIVE_MAX = 4000;

export interface CampaignVariantInputResult {
  alternatives: string[];
  hooks: string[];
  errors: { issueTextAlternatives?: string; personalHooks?: string };
}

/** Roh-Eingaben aus der Verwaltung: trimmen, Leeres entfernen, mit deutschen Meldungen prüfen. */
export function validateCampaignVariantInput(
  rawAlternatives: string[],
  rawHooks: string[],
  issueText: string,
): CampaignVariantInputResult {
  const alternatives = rawAlternatives.map((text) => text.trim()).filter(Boolean);
  const hooks = rawHooks.map((text) => text.trim()).filter(Boolean);
  const errors: CampaignVariantInputResult["errors"] = {};

  if (alternatives.length > 2) {
    errors.issueTextAlternatives = "Du kannst höchstens 2 Varianten anlegen.";
  } else if (
    alternatives.some(
      (text) => text.length < CAMPAIGN_ALTERNATIVE_MIN || text.length > CAMPAIGN_ALTERNATIVE_MAX,
    )
  ) {
    errors.issueTextAlternatives = `Jede Variante braucht ${CAMPAIGN_ALTERNATIVE_MIN} bis ${CAMPAIGN_ALTERNATIVE_MAX} Zeichen.`;
  } else if (new Set(alternatives).size !== alternatives.length) {
    errors.issueTextAlternatives = "Die Varianten müssen sich unterscheiden.";
  } else if (alternatives.includes(issueText.trim())) {
    errors.issueTextAlternatives = "Eine Variante ist gleich dem Anliegen. Bitte ändere den Wortlaut.";
  }

  if (hooks.length > 3) {
    errors.personalHooks = "Du kannst höchstens 3 Satzanfänge anlegen.";
  } else if (
    hooks.some(
      (text) => text.length < CAMPAIGN_PERSONAL_HOOK_MIN || text.length > CAMPAIGN_PERSONAL_HOOK_MAX,
    )
  ) {
    errors.personalHooks = `Jeder Satzanfang braucht ${CAMPAIGN_PERSONAL_HOOK_MIN} bis ${CAMPAIGN_PERSONAL_HOOK_MAX} Zeichen.`;
  } else if (new Set(hooks).size !== hooks.length) {
    errors.personalHooks = "Die Satzanfänge müssen sich unterscheiden.";
  }

  return { alternatives, hooks, errors };
}

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

import { z } from "zod";

export const CAMPAIGN_STATUSES = [
  "draft",
  "awaiting_email_verification",
  "active",
  "paused",
  "archived",
  "blocked",
] as const;

export const MODERATION_STATUSES = ["pending", "approved", "rejected"] as const;

export const CAMPAIGN_TOKEN_KINDS = ["verify_email", "manage"] as const;

export const REVISION_REASONS = [
  "created",
  "published",
  "edited",
  "activated",
] as const;

export const CAMPAIGN_TARGET_LEVELS = ["Bund", "Land"] as const;

export type CampaignTargetLevel = (typeof CAMPAIGN_TARGET_LEVELS)[number];

// Single Source für Bundesland-Dropdown und Hero-Copy.
// Keys entsprechen bundeslandKey aus lookupPLZWithLevel.
export const BUNDESLAND_NAMES: Record<string, string> = {
  BW: "Baden-Württemberg",
  BY: "Bayern",
  BE: "Berlin",
  BB: "Brandenburg",
  HB: "Bremen",
  HH: "Hamburg",
  HE: "Hessen",
  MV: "Mecklenburg-Vorpommern",
  NI: "Niedersachsen",
  NW: "Nordrhein-Westfalen",
  RP: "Rheinland-Pfalz",
  SL: "Saarland",
  SN: "Sachsen",
  ST: "Sachsen-Anhalt",
  SH: "Schleswig-Holstein",
  TH: "Thüringen",
};

export const BUNDESLAND_KEYS = Object.keys(BUNDESLAND_NAMES) as string[];

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];
export type CampaignModerationStatus = (typeof MODERATION_STATUSES)[number];
export type CampaignTokenKind = (typeof CAMPAIGN_TOKEN_KINDS)[number];
export type CampaignRevisionReason = (typeof REVISION_REASONS)[number];

const slugPattern = /^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$/;
const reservedCampaignSlugs = new Set(["starten", "verifizieren", "verwalten"]);

export function normalizeCampaignSlug(input: string): string {
  return input
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isValidCampaignSlug(slug: string): boolean {
  return slugPattern.test(slug);
}

export function isReservedCampaignSlug(slug: string): boolean {
  return reservedCampaignSlugs.has(slug);
}

export const campaignStatusSchema = z.enum(CAMPAIGN_STATUSES);
export const campaignTargetLevelSchema = z.enum(CAMPAIGN_TARGET_LEVELS);
export const campaignModerationStatusSchema = z.enum(MODERATION_STATUSES);
export const campaignTokenKindSchema = z.enum(CAMPAIGN_TOKEN_KINDS);
export const campaignRevisionReasonSchema = z.enum(REVISION_REASONS);

export const campaignSlugSchema = z
  .string()
  .trim()
  .transform(normalizeCampaignSlug)
  .refine(isValidCampaignSlug, "Ungültiger Kampagnen-Slug.")
  .refine((slug) => !isReservedCampaignSlug(slug), "Reservierter Kampagnen-Slug.");

export const campaignExternalUrlSchema = z
  .string()
  .trim()
  .url("Bitte gib eine gültige Adresse ein.")
  .max(500)
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "https:" || protocol === "http:";
  }, "Bitte gib eine http(s)-Adresse ein.");

export const campaignPublicFieldsSchema = z.object({
  title: z.string().trim().min(3).max(120),
  issueText: z.string().trim().min(20).max(4000),
  description: z.string().trim().max(400).optional().nullable(),
  creatorName: z.string().trim().max(120).optional().nullable(),
  externalUrl: campaignExternalUrlSchema.optional().nullable(),
  logoPath: z.string().trim().max(500).optional().nullable(),
});

export const createCampaignSchema = campaignPublicFieldsSchema
  .extend({
    slug: campaignSlugSchema,
    creatorEmail: z.string().trim().toLowerCase().email().max(200),
    moderationStatus: campaignModerationStatusSchema.default("pending"),
    moderationCategories: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
    targetLevel: campaignTargetLevelSchema.default("Bund"),
    targetState: z
      .enum(Object.keys(BUNDESLAND_NAMES) as [string, ...string[]])
      .nullable()
      .default(null),
  })
  .superRefine((value, ctx) => {
    if (value.targetLevel === "Bund" && value.targetState !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetState"],
        message: "Ein Bundesland ist nur bei Landtagskampagnen erlaubt.",
      });
    }
  });

export const updateCampaignPublicFieldsSchema = campaignPublicFieldsSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Keine Änderungen übergeben.");

export type CampaignPublicFieldsInput = z.input<typeof campaignPublicFieldsSchema>;
export type CreateCampaignInput = z.input<typeof createCampaignSchema>;
export type UpdateCampaignPublicFieldsInput = z.input<
  typeof updateCampaignPublicFieldsSchema
>;

export type Campaign = {
  id: string;
  slug: string;
  creatorEmail: string;
  title: string;
  issueText: string;
  description: string | null;
  creatorName: string | null;
  externalUrl: string | null;
  logoPath: string | null;
  status: CampaignStatus;
  moderationStatus: CampaignModerationStatus;
  moderationCategories: string[];
  targetLevel: CampaignTargetLevel;
  targetState: string | null;
  emailVerifiedAt: string | null;
  activatedAt: string | null;
  pausedAt: string | null;
  archivedAt: string | null;
  lastPublishedRevisionId: string | null;
  letterCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CampaignRevision = {
  id: string;
  campaignId: string;
  snapshotReason: CampaignRevisionReason;
  title: string;
  issueText: string;
  description: string | null;
  creatorName: string | null;
  externalUrl: string | null;
  moderationStatus: CampaignModerationStatus;
  moderationCategories: string[];
  createdAt: string;
};

export type CampaignTokenRecord = {
  id: string;
  campaignId: string;
  kind: CampaignTokenKind;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
};
